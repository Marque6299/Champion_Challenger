import { h, field, check, btn, kv, copyText, intro, callout, zoneOptions, num, radios, uid } from '../ui.js';
import { PROPERTY_ZONES, localZone, parseLocalInput, wallToUtc, fmtFull, fmtFullGmt, humanDuration } from '../lib/tz.js';
import { cancellationDeadline, cancellationStatus, penaltyCents } from '../lib/cancel.js';
import { formatCents } from '../lib/money.js';

export default {
  id: 'cancellation-deadline',
  mount(root) {
    const device = localZone(), zones = zoneOptions(PROPERTY_ZONES, device);
    const checkIn = field({ label: 'Check-in date', type: 'date' });
    const propTz = field({ label: "Hotel's time zone", type: 'select', options: zones, value: 'America/New_York', hint: 'Policy times are in the hotel\'s local time, not yours.' });
    const mode = radios(uid('mode'), 'How the policy is worded', [['days', 'Days before check-in, at a set time'], ['hours', 'Hours before the check-in time']], 'days');
    const days = field({ label: 'Days before check-in', type: 'number', min: 0, max: 60, value: 2, inputmode: 'numeric' });
    const cutoff = field({ label: 'Cutoff time on that day', type: 'time', value: '23:59' });
    const hours = field({ label: 'Hours before check-in', type: 'number', min: 0, max: 720, value: 48, inputmode: 'numeric' });
    const ciTime = field({ label: 'Check-in time', type: 'time', value: '15:00' });
    const daysBox = h('div', { class: 'grid-2' }, days.wrap, cutoff.wrap), hoursBox = h('div', { class: 'grid-2', hidden: true }, hours.wrap, ciTime.wrap);
    const asOf = radios(uid('asof'), 'When is the customer cancelling?', [['now', 'Now'], ['set', 'At a specific time']], 'now');
    const asOfAt = field({ label: 'Date and time', type: 'datetime-local' }), asOfTz = field({ label: 'Entered in', type: 'select', options: zones, value: device });
    const asOfBox = h('div', { class: 'grid-2', hidden: true }, asOfAt.wrap, asOfTz.wrap);
    const custTz = field({ label: "Also show in the customer's time zone (optional)", type: 'select', options: [['', 'Not needed'], ...zones], value: '' });
    const pType = field({ label: 'Penalty after the deadline', type: 'select', value: 'none', options: [['none', 'No penalty to calculate'], ['firstNight', 'First night'], ['nights', 'A number of nights'], ['percent', 'A percentage of the total'], ['full', 'Full stay (non-refundable)']] });
    const rate = field({ label: 'Nightly rate', type: 'number', min: 0, step: '0.01', inputmode: 'decimal' }), nights = field({ label: 'Nights', type: 'number', min: 0, inputmode: 'numeric' });
    const total = field({ label: 'Total booking value (optional)', type: 'number', min: 0, step: '0.01', inputmode: 'decimal', hint: 'Leave blank to use rate × nights.' });
    const pNights = field({ label: 'Nights charged', type: 'number', min: 0, value: 1, inputmode: 'numeric' }), pPct = field({ label: 'Percent of total', type: 'number', min: 0, max: 100, value: 100, inputmode: 'decimal' });
    const cur = field({ label: 'Currency', maxlength: 3, value: 'USD', autocomplete: 'off' });
    const penaltyBox = h('div', { class: 'grid-3', hidden: true }, rate.wrap, nights.wrap, total.wrap, pNights.wrap, pPct.wrap, cur.wrap);
    const out = h('div', { class: 'result', 'aria-live': 'polite' });
    let summary = '', timer = null;

    function render() {
      const m = mode.value, p = pType.input.value, byNights = p === 'nights', byPct = p === 'percent';
      daysBox.hidden = m !== 'days'; hoursBox.hidden = m !== 'hours';
      asOfBox.hidden = asOf.value !== 'set'; penaltyBox.hidden = p === 'none';
      pNights.wrap.hidden = !byNights; pPct.wrap.hidden = !byPct;
      out.replaceChildren(); summary = '';
      const tz = propTz.input.value;
      let r;
      try { r = cancellationDeadline({ checkInDate: checkIn.input.value, tz, mode: m, days: num(days.input), cutoffTime: cutoff.input.value, hours: num(hours.input), checkInTime: ciTime.input.value }); }
      catch (e) { out.append(h('p', { class: 'hint' }, checkIn.input.value ? e.message : 'Enter the check-in date to see the deadline.')); return; }
      let now = new Date();
      if (asOf.value === 'set') {
        const w = parseLocalInput(asOfAt.input.value);
        if (!w) { out.append(h('p', { class: 'hint' }, 'Enter the date and time of the cancellation.')); return; }
        now = wallToUtc(w, asOfTz.input.value).date;
      }
      const st = cancellationStatus(r.deadline, now), dur = humanDuration(st.ms), local = propTz.input.value !== device;
      const cc = (cur.input.value || '').toUpperCase();
      const cents = penaltyCents({ type: p, nightlyRate: rate.input.value, nights: nights.input.value, penaltyNights: pNights.input.value, percent: pPct.input.value, total: total.input.value });
      const verdict = st.open ? `Free cancellation is still available. ${dur} left.` : `The free cancellation deadline passed ${dur} ago.`;
      const rows = [
        ['Deadline, hotel time', fmtFullGmt(r.deadline, tz)],
        local ? ['Deadline, this device', fmtFullGmt(r.deadline, device)] : null,
        custTz.input.value ? ["Deadline, customer's time", fmtFullGmt(r.deadline, custTz.input.value)] : null,
        r.checkIn ? ['Check-in', fmtFull(r.checkIn, tz)] : null,
        ['Cancellation time, hotel time', fmtFull(now, tz)],
        p !== 'none' ? ['Penalty after the deadline', cents ? formatCents(cents, cc) : 'None calculated'] : null,
        p !== 'none' ? ['Penalty if cancelled at that time', st.open ? 'None' : formatCents(cents, cc), st.open ? '' : 'strong'] : null
      ];
      out.append(h('p', { class: 'verdict ' + (st.open ? 'ok' : 'bad') }, verdict), kv(rows));
      if (r.gap) out.append(callout('warn', 'That cutoff time does not exist on that date because clocks move forward. The result is the nearest valid time. Confirm with the property.'));
      if (r.ambiguous) out.append(callout('warn', 'That local time happens twice because clocks move back. The earlier time is used. Confirm with the property.'));
      summary = `Free cancellation ends ${fmtFullGmt(r.deadline, tz)}, hotel local time.` +
        (local ? ` On this device that is ${fmtFull(r.deadline, device)}.` : '') +
        ` At ${fmtFull(now, tz)} hotel time, ${st.open ? `there are ${dur} left to cancel free of charge.` : `the deadline passed ${dur} ago.`}` +
        (!st.open && cents ? ` The cancellation penalty is ${formatCents(cents, cc)}.` : '');
      out.append(h('div', { class: 'btn-row' }, btn('Copy summary', () => copyText(summary, 'Summary copied'))));
    }
    [checkIn, days, cutoff, hours, ciTime, asOfAt, rate, nights, total, pNights, pPct, cur].forEach(f => f.input.addEventListener('input', render));
    [propTz, asOfTz, custTz, pType].forEach(f => f.input.addEventListener('change', render));
    mode.on(render); asOf.on(render);
    root.append(intro('Cancellation deadlines are set in the hotel\'s local time. Enter the policy as the booking shows it and this tool finds the exact cutoff, converts it, and works out the penalty if the deadline has passed. Always confirm against the booking\'s own policy text.'),
      h('div', { class: 'grid-2' }, checkIn.wrap, propTz.wrap), mode.fs, daysBox, hoursBox, asOf.fs, asOfBox, custTz.wrap, pType.wrap, penaltyBox, out);
    render();
    timer = setInterval(() => { if (asOf.value === 'now') render(); }, 30000);
    return { destroy() { clearInterval(timer); } };
  }
};
