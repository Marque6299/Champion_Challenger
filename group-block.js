import { h, field, btn, kv, table, copyText, toast, download, intro, callout, num, stamp } from '../ui.js';
import { blockSummary, validateRoomingList, cleanRowsForExport } from '../lib/group.js';
import { parseTable, toCsv } from '../lib/csv.js';
import { formatCents } from '../lib/money.js';
import { parseYmd, ymd, addDays } from '../lib/tz.js';

const MAX_BYTES = 2000000, SHOW = 200;
export default {
  id: 'group-block',
  mount(root) {
    const arrival = field({ label: 'Arrival date', type: 'date' }), nights = field({ label: 'Nights', type: 'number', min: 0, inputmode: 'numeric' });
    const cur = field({ label: 'Currency', maxlength: 3, autocomplete: 'off' });
    const comp = field({ label: 'Comp ratio: 1 free room per', type: 'number', min: 0, placeholder: '25', inputmode: 'numeric', hint: 'Paid rooms per complimentary room. Use the contract\'s figure. Leave blank for none.' });
    const attr = field({ label: 'Attrition allowance (%)', type: 'number', min: 0, max: 100, placeholder: '10', inputmode: 'decimal', hint: 'Share of the block that can be released without penalty.' });
    const cutoffDays = field({ label: 'Cutoff, days before arrival', type: 'number', min: 0, placeholder: '30', inputmode: 'numeric', hint: 'When unreserved rooms return to the hotel.' });
    const linesBox = h('div', { class: 'lines' }), lines = [];
    const addBtn = btn('Add a room type', () => addLine(), 'secondary');
    function renum() { lines.forEach((l, i) => { l.type.wrap.querySelector('label').textContent = `Room type, line ${i + 1}`; l.rooms.wrap.querySelector('label').textContent = `Rooms per night, line ${i + 1}`; l.rate.wrap.querySelector('label').textContent = `Rate per night, line ${i + 1}`; l.remove.setAttribute('aria-label', `Remove room type ${i + 1}`); l.remove.hidden = lines.length === 1; }); addBtn.hidden = lines.length >= 8; }
    function addLine(type = '', rooms = '', rate = '') {
      const l = { type: field({ label: 'Room type', value: type, autocomplete: 'off' }), rooms: field({ label: 'Rooms per night', type: 'number', min: 0, inputmode: 'numeric', value: rooms }), rate: field({ label: 'Rate per night', type: 'number', min: 0, step: '0.01', inputmode: 'decimal', value: rate }) };
      l.remove = btn('Remove', () => { lines.splice(lines.indexOf(l), 1); l.el.remove(); renum(); summarise(); checkList(); }, 'secondary');
      l.el = h('div', { class: 'line-row three' }, l.type.wrap, l.rooms.wrap, l.rate.wrap, l.remove);
      [l.type, l.rooms, l.rate].forEach(f => f.input.addEventListener('input', () => { summarise(); }));
      lines.push(l); linesBox.append(l.el); renum();
    }
    const sumOut = h('div', { class: 'result', 'aria-live': 'polite' });
    let sumText = '';
    function summarise() {
      const s = blockSummary({ lines: lines.map(l => ({ type: l.type.input.value, rooms: l.rooms.input.value, rate: l.rate.input.value })), nights: nights.input.value, compRatio: num(comp.input), attritionPct: num(attr.input), arrival: arrival.input.value, cutoffDaysBefore: num(cutoffDays.input) });
      sumOut.replaceChildren();
      if (!s.paidRooms || !num(nights.input)) { sumOut.append(h('p', { class: 'hint' }, 'Enter room types, rooms per night and the number of nights to size the block.')); sumText = ''; return; }
      const c = (cur.input.value || '').toUpperCase(), m = x => formatCents(x, c);
      const rows = [['Paid rooms per night', String(s.paidRooms)], ['Room nights', String(s.roomNights)], ['Estimated room revenue', m(s.revenue), 'strong'], ['Average rate', m(s.avgRate)],
        s.comps ? ['Complimentary rooms per night', `${s.comps} (worth ${m(s.compValue)} over the stay)`] : null,
        num(attr.input) ? ['Minimum paid rooms after attrition', `${s.minPaidRooms} (${s.releasableRooms} can be released)`] : null, num(attr.input) ? ['Revenue at that minimum', m(s.minRevenue)] : null, s.cutoff ? ['Cutoff date', s.cutoff] : null];
      sumOut.append(kv(rows), btn('Copy summary', () => copyText(sumText, 'Summary copied'), 'secondary'));
      sumText = `Block: ${s.paidRooms} rooms per night for ${nights.input.value} nights (${s.roomNights} room nights), estimated room revenue ${m(s.revenue)}, average rate ${m(s.avgRate)}.` + (s.comps ? ` Complimentary rooms: ${s.comps} per night.` : '') + (num(attr.input) ? ` Minimum after ${num(attr.input)}% attrition: ${s.minPaidRooms} rooms per night.` : '') + (s.cutoff ? ` Cutoff date: ${s.cutoff}.` : '');
      checkList();
    }
    // Rooming list
    const paste = field({ label: 'Paste rooming list (copy rows from Excel, or paste CSV)', type: 'textarea', rows: 6, placeholder: 'Guest name\tRoom type\tArrival\tDeparture', hint: 'The first row must be the headings: guest name, room type, arrival and departure. An email and notes column are optional.' });
    const file = field({ label: 'Or choose a .csv, .tsv or .txt file', type: 'file', accept: '.csv,.tsv,.txt,text/csv,text/plain', hint: 'The file is read in this browser and never uploaded. To use an Excel workbook, save it as CSV or copy the cells.' });
    const fmt = field({ label: 'Dates written as 03/11/2026 mean', type: 'select', options: [['mdy', 'March 11 (month first)'], ['dmy', '3 November (day first)']], value: 'mdy' });
    const listOut = h('div', { class: 'result', 'aria-live': 'polite' });
    let last = null;
    function checkList() {
      listOut.replaceChildren(); last = null;
      const text = paste.input.value;
      if (!text.trim()) { listOut.append(h('p', { class: 'hint' }, 'Paste or choose a rooming list to check it against the block.')); return; }
      const t = parseTable(text);
      const types = {}; lines.forEach(l => { const k = l.type.input.value.trim(); if (k && num(l.rooms.input) > 0) types[k] = (types[k] || 0) + num(l.rooms.input); });
      const a = parseYmd(arrival.input.value), n = Math.floor(num(nights.input));
      const r = validateRoomingList(t.records, t.headers, { arrival: arrival.input.value, departure: a && n > 0 ? ymd(addDays(a, n)) : '', roomTypes: types, dateFormat: fmt.input.value });
      if (!r.ok) { listOut.append(callout('bad', h('strong', null, 'Columns not found: '), r.missing.join(', '), '. Use headings such as Guest name, Room type, Arrival (or Check-in), Departure (or Check-out).')); return; }
      last = r; const s = r.summary;
      listOut.append(kv([['Rows read', String(s.total)], ['Ready to use', String(s.valid), 'strong'], ['With errors', String(s.withErrors)], ['With warnings', String(s.withWarnings)], ...Object.entries(s.perType).map(([k, v]) => ['Valid rows: ' + k, String(v)])]));
      if (r.overAllocated.length) listOut.append(callout('warn', h('strong', null, 'More guests than rooms in the block: '), r.overAllocated.slice(0, 8).map(o => `${o.type} on ${o.date} (${o.count} guests, ${o.block} rooms)`).join('; '), r.overAllocated.length > 8 ? ` and ${r.overAllocated.length - 8} more.` : '.'));
      const shown = r.rows.slice(0, SHOW);
      listOut.append(table(['Row', 'Guest', 'Room type', 'Arrival', 'Departure', 'Nights', 'Check'], shown.map(x => [String(x.index), x.name, x.type, x.arrival || '', x.departure || '', x.nights ? String(x.nights) : '', x.errors.length ? 'Error: ' + x.errors.join('; ') : x.warnings.length ? 'Check: ' + x.warnings.join('; ') : 'OK']), 'Rooming list check'));
      if (r.rows.length > SHOW) listOut.append(h('p', { class: 'hint' }, `Showing the first ${SHOW} of ${r.rows.length} rows. The downloads include every row.`));
      listOut.append(h('div', { class: 'btn-row' },
        btn('Download cleaned CSV', () => download(`rooming-list-clean-${stamp()}.csv`, toCsv(cleanRowsForExport(r.rows)), 'text/csv')),
        btn('Download problems CSV', () => { const p = r.rows.filter(x => x.errors.length || x.warnings.length); if (!p.length) { toast('No problems to export'); return; } download(`rooming-list-problems-${stamp()}.csv`, toCsv([['Row', 'Guest', 'Problem'], ...p.map(x => [x.index, x.name, [...x.errors, ...x.warnings].join('; ')])]), 'text/csv'); }, 'secondary')));
    }
    file.input.addEventListener('change', () => {
      const f = file.input.files && file.input.files[0]; if (!f) return;
      if (f.size > MAX_BYTES) { listOut.replaceChildren(callout('bad', 'That file is larger than 2 MB. Split it into smaller lists.')); return; }
      const rd = new FileReader(); rd.onload = () => { paste.input.value = String(rd.result); checkList(); }; rd.onerror = () => listOut.replaceChildren(callout('bad', 'The file could not be read.')); rd.readAsText(f);
    });
    [arrival, nights, cur, comp, attr, cutoffDays].forEach(f => f.input.addEventListener('input', summarise));
    paste.input.addEventListener('input', checkList); fmt.input.addEventListener('change', checkList);
    addLine();
    root.append(intro('Size a group block, then check the rooming list against it. Everything runs in your browser, and no guest names are sent anywhere.'),
      h('h3', { class: 'calc-title' }, '1. The block'), h('div', { class: 'grid-3' }, arrival.wrap, nights.wrap, cur.wrap), linesBox, addBtn,
      h('div', { class: 'grid-3' }, comp.wrap, attr.wrap, cutoffDays.wrap), sumOut,
      h('h3', { class: 'calc-title' }, '2. The rooming list'), file.wrap, paste.wrap, fmt.wrap, listOut);
    summarise(); checkList();
  }
};
