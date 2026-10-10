import { h, field, check, btn, kv, copyText, intro, num } from '../ui.js';
import { priceBreakdown } from '../lib/price.js';
import { formatCents, convert, formatAmount } from '../lib/money.js';
import { parseYmd, daysBetween, weekdayOf } from '../lib/tz.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export default {
  id: 'booking-price',
  mount(root) {
    const cur = field({ label: 'Currency', maxlength: 3, value: 'USD', autocomplete: 'off' });
    const rowsBox = h('div', { class: 'lines' }), rows = [];
    const addRowBtn = btn('Add a rate line', () => addRow(), 'secondary');
    function renumber() {
      rows.forEach((r, i) => { r.rate.wrap.querySelector('label').textContent = `Rate per night, line ${i + 1}`; r.nights.wrap.querySelector('label').textContent = `Nights, line ${i + 1}`; r.remove.setAttribute('aria-label', `Remove line ${i + 1}`); r.remove.hidden = rows.length === 1; });
      addRowBtn.hidden = rows.length >= 6;
    }
    function addRow(rate = '', n = '') {
      const r = { rate: field({ label: 'Rate per night', type: 'number', min: 0, step: '0.01', inputmode: 'decimal', value: rate }), nights: field({ label: 'Nights', type: 'number', min: 0, inputmode: 'numeric', value: n }) };
      r.remove = btn('Remove', () => { rows.splice(rows.indexOf(r), 1); r.el.remove(); renumber(); render(); }, 'secondary');
      r.el = h('div', { class: 'line-row' }, r.rate.wrap, r.nights.wrap, r.remove);
      [r.rate, r.nights].forEach(f => f.input.addEventListener('input', render));
      rows.push(r); rowsBox.append(r.el); renumber();
    }
    const ci = field({ label: 'Check-in (optional)', type: 'date' }), co = field({ label: 'Check-out (optional)', type: 'date' });
    const datesInfo = h('p', { class: 'hint', 'aria-live': 'polite' });
    const useNights = btn('Use these nights on line 1', () => { const n = nightsFromDates(); if (n > 0) { rows[0].nights.input.value = n; render(); } }, 'secondary');
    function nightsFromDates() { const a = parseYmd(ci.input.value), b = parseYmd(co.input.value); return a && b ? daysBetween(a, b) : 0; }
    const mkn = (label, extra = {}) => field({ label, type: 'number', min: 0, step: '0.01', inputmode: 'decimal', ...extra });
    const dPct = mkn('Discount (%)', { max: 100 }), dAmt = mkn('Discount (amount)'), feeN = mkn('Resort or service fee per night'), feeS = mkn('Fee per stay (cleaning, etc.)');
    const feesTax = check({ label: 'The sales tax also applies to fees' });
    const taxPct = mkn('Sales or VAT tax (%)', { max: 100 }), city = mkn('Local tax per person per night'), persons = field({ label: 'Persons paying local tax', type: 'number', min: 0, value: 2, inputmode: 'numeric' });
    const prepaid = mkn('Already paid'), penalty = mkn('Cancellation penalty (if cancelling)'), original = mkn('Original booking total (to compare)');
    const fx = field({ label: 'Rate to the customer\'s currency (optional)', type: 'number', min: 0, step: 'any', inputmode: 'decimal', hint: 'Units of the target currency per 1 unit of the booking currency. Use your account\'s approved rate.' });
    const fxCur = field({ label: 'Customer currency', maxlength: 3, autocomplete: 'off' });
    const out = h('div', { class: 'result', 'aria-live': 'polite' });
    let summary = '';

    function render() {
      const n = nightsFromDates();
      datesInfo.textContent = n > 0 ? `${n} night${n === 1 ? '' : 's'}, ${DAYS[weekdayOf(...Object.values(parseYmd(ci.input.value)))]} to ${DAYS[weekdayOf(...Object.values(parseYmd(co.input.value)))]}.` : (ci.input.value && co.input.value ? 'Check-out must be after check-in.' : '');
      useNights.hidden = n <= 0;
      const c = (cur.input.value || '').toUpperCase();
      const b = priceBreakdown({ lines: rows.map(r => ({ rate: r.rate.input.value, nights: r.nights.input.value })), discountPct: num(dPct.input), discountAmt: dAmt.input.value, feePerNight: feeN.input.value, feePerStay: feeS.input.value, feesTaxable: feesTax.input.checked, taxPct: num(taxPct.input), cityTaxPerPersonNight: city.input.value, persons: persons.input.value, prepaid: prepaid.input.value, penalty: penalty.input.value, originalTotal: original.input.value === '' ? undefined : original.input.value });
      out.replaceChildren(); summary = '';
      if (!b.nights || !b.roomSubtotal) { out.append(h('p', { class: 'hint' }, 'Enter a nightly rate and the number of nights to see the breakdown.')); return; }
      const m = x => formatCents(x, c);
      const items = [['Nights', String(b.nights)], ['Room subtotal', m(b.roomSubtotal)], b.discount ? ['Discount', '−' + m(b.discount)] : null, ['Room after discount', m(b.roomNet)], b.fees ? ['Fees', m(b.fees)] : null,
        b.tax ? [`Tax on ${b.taxBase === b.roomNet ? 'room' : 'room and fees'}`, m(b.tax)] : null, b.cityTax ? ['Local taxes', m(b.cityTax)] : null, ['Total', m(b.total), 'strong'], ['Average per night', m(b.averageNight)]];
      if (b.prepaid) items.push(['Already paid', m(b.prepaid)], b.balanceDue ? ['Balance still due', m(b.balanceDue), 'strong'] : null, b.overpaid ? ['Paid more than the total', m(b.overpaid), 'strong'] : null);
      if (b.penalty) items.push(['Penalty if cancelled', m(b.penalty)], b.prepaid ? (b.refundOnCancel ? ['Refund after penalty', m(b.refundOnCancel), 'strong'] : ['Still owed after penalty', m(b.owedOnCancel), 'strong']) : null);
      let deltaText = '';
      if (b.delta !== null) { deltaText = b.delta > 0 ? `${m(b.delta)} more than the original booking` : b.delta < 0 ? `${m(-b.delta)} less than the original booking` : 'No change from the original booking'; items.push(['Compared with the original', deltaText, 'strong']); }
      const rate = parseFloat(fx.input.value), fc = (fxCur.input.value || '').toUpperCase();
      if (rate > 0 && fc) items.push([`Total in ${fc}`, `${formatAmount(convert(b.total, rate, fc), fc)} ${fc} at ${rate}`]);
      out.append(kv(items), h('div', { class: 'btn-row' }, btn('Copy summary', () => copyText(summary, 'Summary copied'))));
      summary = `Stay of ${b.nights} night${b.nights === 1 ? '' : 's'}: room ${m(b.roomNet)}` + (b.discount ? ` after a ${m(b.discount)} discount` : '') + (b.fees ? `, fees ${m(b.fees)}` : '') + (b.tax ? `, tax ${m(b.tax)}` : '') + (b.cityTax ? `, local taxes ${m(b.cityTax)}` : '') +
        `. Total ${m(b.total)}, average ${m(b.averageNight)} per night.` + (b.prepaid ? ` Paid ${m(b.prepaid)}; ${b.balanceDue ? `balance due ${m(b.balanceDue)}` : 'nothing further due'}.` : '') + (deltaText ? ` This is ${deltaText.toLowerCase()}.` : '');
    }
    [cur, ci, co, dPct, dAmt, feeN, feeS, taxPct, city, persons, prepaid, penalty, original, fx, fxCur].forEach(f => f.input.addEventListener('input', render));
    feesTax.input.addEventListener('change', render);
    addRow();
    root.append(intro('Enter what the booking shows. The tool works in whole cents, so totals never drift by a rounding error. Fees and taxes differ by property and country, so use the amounts and rules on the booking itself.'),
      h('div', { class: 'grid-3' }, cur.wrap, ci.wrap, co.wrap), datesInfo, useNights, rowsBox, addRowBtn,
      h('div', { class: 'grid-2' }, dPct.wrap, dAmt.wrap), h('div', { class: 'grid-2' }, feeN.wrap, feeS.wrap), feesTax.wrap,
      h('div', { class: 'grid-3' }, taxPct.wrap, city.wrap, persons.wrap), h('div', { class: 'grid-3' }, prepaid.wrap, penalty.wrap, original.wrap), h('div', { class: 'grid-2' }, fx.wrap, fxCur.wrap), out);
    render();
  }
};
