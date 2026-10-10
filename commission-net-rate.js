import { h, field, kv, table, intro, num } from '../ui.js';
import { grossToNet, netToGross, markupToMargin, marginToMarkup, netToSell, stayCommission } from '../lib/commission.js';
import { formatCents } from '../lib/money.js';

export default {
  id: 'commission-net-rate',
  mount(root) {
    const cur = field({ label: 'Currency (optional)', maxlength: 3, autocomplete: 'off', hint: 'Shown beside amounts only.' });
    const money = label => field({ label, type: 'number', min: 0, step: '0.01', inputmode: 'decimal' });
    const pct = (label, extra = {}) => field({ label, type: 'number', min: 0, step: 'any', inputmode: 'decimal', ...extra });
    const cc = () => (cur.input.value || '').toUpperCase();
    const m = x => formatCents(x, cc());
    const card = (title, text, ...kids) => h('section', { class: 'card' }, h('h3', { class: 'calc-title' }, title), h('p', { class: 'hint' }, text), ...kids);
    const res = () => h('div', { class: 'result', 'aria-live': 'polite' });
    const empty = (el, msg) => { el.replaceChildren(h('p', { class: 'hint' }, msg)); };

    const g1 = money('Gross (commissionable) rate'), c1 = pct('Commission (%)'), r1 = res();
    const u1 = () => { if (!g1.input.value) return empty(r1, 'Enter a gross rate and a commission percentage.'); const x = grossToNet(g1.input.value, num(c1.input)); r1.replaceChildren(kv([['Commission', m(x.commission)], ['Net rate to the hotel', m(x.net), 'strong']])); };
    const n2 = money('Net rate the hotel must receive'), c2 = pct('Commission (% of the gross)'), r2 = res();
    const u2 = () => { if (!n2.input.value) return empty(r2, 'Enter the net rate and the commission percentage.'); const x = netToGross(n2.input.value, num(c2.input)); r2.replaceChildren(x.error ? h('p', { class: 'hint', role: 'alert' }, x.error) : kv([['Gross rate to charge', m(x.gross), 'strong'], ['Commission', m(x.commission)]])); };
    const n3 = money('Net (cost) rate'), mk3 = pct('Markup on cost (%)'), r3 = res();
    const u3 = () => { if (!n3.input.value) return empty(r3, 'Enter a net rate and a markup.'); const x = netToSell(n3.input.value, num(mk3.input)); r3.replaceChildren(kv([['Selling price', m(x.sell), 'strong'], ['Profit', m(x.profit)], ['Margin on selling price', x.marginPct.toFixed(2) + '%']])); };
    const mode4 = field({ label: 'I know the', type: 'select', options: [['markup', 'Markup (on cost)'], ['margin', 'Margin (on selling price)']] }), v4 = pct('Percent'), r4 = res();
    const u4 = () => { if (!v4.input.value) return empty(r4, 'Enter a percentage to convert.'); if (mode4.input.value === 'markup') r4.replaceChildren(kv([['Margin', markupToMargin(num(v4.input)).toFixed(2) + '%', 'strong']])); else { const k = marginToMarkup(num(v4.input)); r4.replaceChildren(k === null ? h('p', { class: 'hint', role: 'alert' }, 'A margin of 100% or more is not possible.') : kv([['Markup', k.toFixed(2) + '%', 'strong']])); } };
    const rate5 = money('Room rate per night (before tax)'), n5 = field({ label: 'Nights', type: 'number', min: 0, inputmode: 'numeric' }), rooms5 = field({ label: 'Rooms', type: 'number', min: 1, value: 1, inputmode: 'numeric' }), tax5 = pct('Tax on the room (%)', { max: 100 }), c5 = pct('Commission (% of room revenue)'), r5 = res();
    const u5 = () => { if (!rate5.input.value || !num(n5.input)) return empty(r5, 'Enter a room rate and the number of nights.'); const s = stayCommission({ nightlyRoom: rate5.input.value, nights: n5.input.value, rooms: rooms5.input.value, taxPct: num(tax5.input), commissionPct: num(c5.input) });
      r5.replaceChildren(table(['Item', 'Amount'], [['Room revenue (' + s.roomNights + ' room nights)', m(s.roomRevenue)], ['Taxes (pass through, not commissionable)', m(s.taxes)], ['Customer pays', m(s.customerTotal)], ['Agency commission', m(s.commission)], ['Hotel receives', m(s.netToHotel)]], 'Full stay breakdown')); };
    [[g1, c1, u1], [n2, c2, u2], [n3, mk3, u3], [v4, mode4, u4], [rate5, n5, u5], [rooms5, tax5, u5], [c5, c5, u5]].forEach(([a, b, fn]) => { a.input.addEventListener('input', fn); b.input.addEventListener('input', fn); b.input.addEventListener('change', fn); });
    cur.input.addEventListener('input', () => { u1(); u2(); u3(); u5(); });
    root.append(intro('Commission is normally a percentage of the commissionable room rate, and taxes pass through. Markup is a percentage of cost; margin is a percentage of the selling price, so the same price gives two different numbers. Always check the rate plan and the partner agreement for the basis that applies.'),
      cur.wrap,
      card('Gross to net', 'The hotel pays commission on the gross rate; find what the hotel keeps.', h('div', { class: 'grid-2' }, g1.wrap, c1.wrap), r1),
      card('Net to gross', 'Work back from the amount the hotel must receive.', h('div', { class: 'grid-2' }, n2.wrap, c2.wrap), r2),
      card('Net rate to selling price', 'Add a markup to a net (cost) rate.', h('div', { class: 'grid-2' }, n3.wrap, mk3.wrap), r3),
      card('Markup and margin', 'Convert one into the other.', h('div', { class: 'grid-2' }, mode4.wrap, v4.wrap), r4),
      card('Full stay', 'Room revenue, tax and commission for a whole booking.', h('div', { class: 'grid-3' }, rate5.wrap, n5.wrap, rooms5.wrap), h('div', { class: 'grid-2' }, tax5.wrap, c5.wrap), r5));
    u1(); u2(); u3(); u4(); u5();
  }
};
