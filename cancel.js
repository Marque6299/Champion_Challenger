/* cancel.js - cancellation deadlines in the property's local time, and penalties. */
import { parseYmd, parseHm, addDays, wallToUtc } from './tz.js';
import { toCents, pctOf } from './money.js';

/**
 * mode "days":  N calendar days before check-in at a fixed local time (e.g. 2 days before at 23:59).
 * mode "hours": N elapsed hours before the check-in time (e.g. 48 hours before 15:00).
 */
export function cancellationDeadline(o) {
  const ci = parseYmd(o.checkInDate);
  if (!ci) throw new Error('Enter a valid check-in date.');
  if (o.mode === 'hours') {
    const t = parseHm(o.checkInTime || '15:00');
    if (!t) throw new Error('Enter the check-in time as HH:MM.');
    const r = wallToUtc({ ...ci, hour: t.hour, minute: t.minute }, o.tz);
    return { deadline: new Date(r.date.getTime() - (Number(o.hours) || 0) * 3600000), checkIn: r.date, gap: r.gap, ambiguous: r.ambiguous };
  }
  const t = parseHm(o.cutoffTime || '23:59');
  if (!t) throw new Error('Enter the cutoff time as HH:MM.');
  const day = addDays(ci, -Math.max(0, Math.floor(Number(o.days) || 0)));
  const r = wallToUtc({ ...day, hour: t.hour, minute: t.minute }, o.tz);
  return { deadline: r.date, checkIn: null, gap: r.gap, ambiguous: r.ambiguous };
}

/** open is true up to and including the deadline instant. */
export function cancellationStatus(deadline, now) {
  const diff = deadline.getTime() - now.getTime();
  return { open: diff >= 0, ms: Math.abs(diff) };
}

/** type: none | firstNight | nights | percent | full. Returns cents. */
export function penaltyCents({ type, nightlyRate, nights, penaltyNights, percent, total }) {
  const nightly = toCents(nightlyRate), n = Math.max(0, Math.floor(Number(nights) || 0)), tot = toCents(total);
  switch (type) {
    case 'firstNight': return Math.min(nightly, tot || nightly * n);
    case 'nights': return Math.min(nightly * Math.max(0, Math.floor(Number(penaltyNights) || 0)), tot || nightly * n);
    case 'percent': return pctOf(tot || nightly * n, percent);
    case 'full': return tot || nightly * n;
    default: return 0;
  }
}
