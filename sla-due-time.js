import { h, field, check, btn, kv, copyText, intro, callout, zoneOptions, radios, uid, num } from '../ui.js';
import { PROPERTY_ZONES, localZone, parseLocalInput, wallToUtc, zoneParts, fmtFull, fmtFullGmt, humanDuration, pad2, parseYmd } from '../lib/tz.js';
import { addBusinessHours, calendarDue } from '../lib/sla.js';

const DAY_LIST = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [0, 'Sun']];
export default {
  id: 'sla-due-time',
  mount(root) {
    const device = localZone(), zones = zoneOptions(PROPERTY_ZONES, device);
    const start = field({ label: 'Request received', type: 'datetime-local' }), startTz = field({ label: 'Entered in', type: 'select', options: zones, value: device });
    const hours = field({ label: 'Response time promised (hours)', type: 'number', min: 0, step: 'any', value: 24, inputmode: 'decimal' });
    const mode = radios(uid('sla'), 'Count', [['calendar', 'Calendar hours (around the clock)'], ['business', 'Business hours only']], 'business');
    const partnerTz = field({ label: 'Partner\'s time zone', type: 'select', options: zones, value: 'America/New_York', hint: 'The time zone the business hours below are in.' });
    const ws = field({ label: 'Business day starts', type: 'time', value: '09:00' }), we = field({ label: 'Business day ends', type: 'time', value: '18:00' });
    const days = DAY_LIST.map(([v, l]) => check({ label: l, checked: v >= 1 && v <= 5, value: v }));
    const dayFs = h('fieldset', { class: 'fieldset' }, h('legend', null, 'Business days'), h('div', { class: 'radio-row' }, days.map(d => d.wrap)));
    const hol = field({ label: 'Holidays (optional)', type: 'textarea', rows: 2, placeholder: '2026-12-25, 2026-12-26', hint: 'Dates as YYYY-MM-DD, separated by commas or new lines.' });
    const bizBox = h('div', null, h('div', { class: 'grid-2' }, ws.wrap, we.wrap), dayFs, hol.wrap);
    const out = h('div', { class: 'result', 'aria-live': 'polite' });
    let summary = '';
    const toInput = p => `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
    function render() {
      bizBox.hidden = mode.value !== 'business'; out.replaceChildren(); summary = '';
      const w = parseLocalInput(start.input.value);
      if (!w) { out.append(h('p', { class: 'hint' }, 'Enter when the request was received.')); return; }
      const s = wallToUtc(w, startTz.input.value).date, tzP = partnerTz.input.value;
      let due;
      try {
        if (mode.value === 'business') {
          const bad = hol.input.value.split(/[\s,;]+/).filter(Boolean).filter(x => !parseYmd(x));
          if (bad.length) throw new Error(`These holiday dates are not valid: ${bad.join(', ')}. Use YYYY-MM-DD.`);
          due = addBusinessHours(s, num(hours.input), { tz: tzP, windowStart: ws.input.value, windowEnd: we.input.value, days: days.filter(d => d.input.checked).map(d => +d.input.value), holidays: hol.input.value.split(/[\s,;]+/).filter(Boolean) });
        } else due = calendarDue(s, num(hours.input));
      } catch (e) { out.append(h('p', { class: 'hint', role: 'alert' }, e.message)); return; }
      const now = new Date(), diff = due - now, over = diff < 0;
      const rows = [['Due, partner time', fmtFullGmt(due, tzP), 'strong'], tzP !== device ? ['Due, this device', fmtFullGmt(due, device)] : null, startTz.input.value !== tzP ? ['Received, partner time', fmtFull(s, tzP)] : null, ['Time from now', over ? `Overdue by ${humanDuration(diff)}` : `${humanDuration(diff)} remaining`]];
      out.append(h('p', { class: 'verdict ' + (over ? 'bad' : 'ok') }, over ? 'This response is overdue.' : 'This response is not yet due.'), kv(rows));
      summary = `Response due ${fmtFullGmt(due, tzP)}, partner time` + (tzP !== device ? `, which is ${fmtFull(due, device)} on this device` : '') + `. Counted in ${mode.value === 'business' ? 'business' : 'calendar'} hours from ${fmtFull(s, tzP)}.`;
      out.append(h('div', { class: 'btn-row' }, btn('Copy summary', () => copyText(summary, 'Summary copied'))));
    }
    [start, hours, ws, we, hol].forEach(f => f.input.addEventListener('input', render)); [startTz, partnerTz].forEach(f => f.input.addEventListener('change', render));
    days.forEach(d => d.input.addEventListener('change', render)); mode.on(render);
    const now = btn('Use current time', () => { start.input.value = toInput(zoneParts(new Date(), startTz.input.value)); render(); }, 'secondary');
    root.append(intro('Work out when a partner or supplier response is due. Business hours are counted inside the partner\'s own working day, skipping the days and holidays you set, and daylight saving is handled for you. Check the partner agreement for how its clock starts and stops.'),
      h('div', { class: 'grid-2' }, start.wrap, startTz.wrap), now, h('div', { class: 'grid-2' }, hours.wrap, partnerTz.wrap), mode.fs, bizBox, out);
    render();
  }
};
