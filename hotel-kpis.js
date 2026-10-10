import { h, field, kv, intro, num } from '../ui.js';
import { hotelKpis, pctChange, availableRoomNights } from '../lib/kpi.js';
import { formatAmount } from '../lib/money.js';

export default {
  id: 'hotel-kpis',
  mount(root) {
    const cur = field({ label: 'Currency (optional)', maxlength: 3, autocomplete: 'off' });
    const mk = (label, extra = {}) => field({ label, type: 'number', min: 0, step: 'any', inputmode: 'decimal', ...extra });
    const money = x => { const c = (cur.input.value || '').toUpperCase(); return x === null ? 'Not available' : formatAmount(x, c || 'USD') + (c ? ' ' + c : ''); };
    const pc = x => (x === null ? 'Not available' : x.toFixed(1) + '%');
    const rooms = mk('Rooms in the hotel'), days = mk('Days in the period'), avail = mk('Room nights available'), sold = mk('Room nights sold'), rev = mk('Room revenue');
    const helper = h('p', { class: 'hint', 'aria-live': 'polite' });
    const out = h('div', { class: 'result', 'aria-live': 'polite' });
    function update() {
      const helperVal = availableRoomNights(num(rooms.input), num(days.input));
      helper.textContent = helperVal ? `Rooms × days = ${helperVal} room nights available. ` : '';
      if (helperVal && !avail.input.value) { avail.input.value = helperVal; }
      const k = hotelKpis({ roomsAvailable: num(avail.input), roomsSold: num(sold.input), revenue: num(rev.input) });
      out.replaceChildren();
      if (!num(avail.input)) { out.append(h('p', { class: 'hint' }, 'Enter the room nights available, the room nights sold and the room revenue.')); return; }
      if (k.soldExceedsAvailable) out.append(h('p', { class: 'hint', role: 'alert' }, 'Room nights sold are higher than room nights available. Check the figures.'));
      out.append(kv([['Occupancy', pc(k.occupancy), 'strong'], ['ADR (average daily rate)', money(k.adr), 'strong'], ['RevPAR (revenue per available room)', money(k.revpar), 'strong']]));
    }
    [rooms, days, avail, sold, rev, cur].forEach(f => f.input.addEventListener('input', update));
    const period = name => ({ avail: mk(`${name}: room nights available`), sold: mk(`${name}: room nights sold`), rev: mk(`${name}: room revenue`) });
    const A = period('Period A'), B = period('Period B'), cmp = h('div', { class: 'result', 'aria-live': 'polite' });
    function compare() {
      const ka = hotelKpis({ roomsAvailable: num(A.avail.input), roomsSold: num(A.sold.input), revenue: num(A.rev.input) }), kb = hotelKpis({ roomsAvailable: num(B.avail.input), roomsSold: num(B.sold.input), revenue: num(B.rev.input) });
      cmp.replaceChildren();
      if (ka.occupancy === null || kb.occupancy === null) { cmp.append(h('p', { class: 'hint' }, 'Enter figures for both periods to compare them.')); return; }
      const ch = (a, b) => { const c = pctChange(a, b); return c === null ? 'Not available' : (c >= 0 ? '+' : '') + c.toFixed(1) + '%'; };
      const pts = ka.occupancy !== null && kb.occupancy !== null ? ((kb.occupancy - ka.occupancy) >= 0 ? '+' : '') + (kb.occupancy - ka.occupancy).toFixed(1) + ' points' : 'Not available';
      cmp.append(kv([['Occupancy', `${pc(ka.occupancy)} to ${pc(kb.occupancy)} (${pts})`], ['ADR', `${money(ka.adr)} to ${money(kb.adr)} (${ch(ka.adr, kb.adr)})`], ['RevPAR', `${money(ka.revpar)} to ${money(kb.revpar)} (${ch(ka.revpar, kb.revpar)})`]]));
    }
    [...Object.values(A), ...Object.values(B)].forEach(f => f.input.addEventListener('input', compare));
    root.append(intro('Occupancy = rooms sold ÷ rooms available. ADR = room revenue ÷ rooms sold. RevPAR = room revenue ÷ rooms available, which equals ADR × occupancy. Use the same revenue definition (room revenue only, or including other income) for every figure you compare.'),
      cur.wrap, h('h3', { class: 'calc-title' }, 'One period'), h('div', { class: 'grid-2' }, rooms.wrap, days.wrap), helper, h('div', { class: 'grid-3' }, avail.wrap, sold.wrap, rev.wrap), out,
      h('h3', { class: 'calc-title' }, 'Compare two periods'), h('div', { class: 'grid-3' }, A.avail.wrap, A.sold.wrap, A.rev.wrap), h('div', { class: 'grid-3' }, B.avail.wrap, B.sold.wrap, B.rev.wrap), cmp);
    update(); compare();
  }
};
