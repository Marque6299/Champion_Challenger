/* sla.js - due times for partner or supplier SLAs, in calendar or business hours, in any time zone. */
import { zoneParts, wallToUtc, weekdayOf, pad2, addDays, parseHm } from './tz.js';

export const calendarDue = (start, hours) => new Date(start.getTime() + hours * 3600000);

/**
 * Walk forward through business windows, spending `hours` of business time.
 * opts: { tz, windowStart:'09:00', windowEnd:'18:00', days:[1..5] (0 = Sunday), holidays:['YYYY-MM-DD'] }
 */
export function addBusinessHours(start, hours, opts) {
  const { tz, windowStart = '09:00', windowEnd = '18:00', days = [1, 2, 3, 4, 5], holidays = [] } = opts;
  const ws = parseHm(windowStart), we = parseHm(windowEnd);
  if (!ws || !we) throw new Error('Enter the business hours as HH:MM.');
  const wsMin = ws.hour * 60 + ws.minute, weMin = we.hour * 60 + we.minute;
  if (weMin <= wsMin) throw new Error('Business hours must end after they start.');
  if (!days.length) throw new Error('Choose at least one business day.');
  const holiday = new Set(holidays);
  let remaining = Math.max(0, hours) * 3600000;
  const p0 = zoneParts(start, tz);
  let day = { year: p0.year, month: p0.month, day: p0.day };
  let cursor = start.getTime();
  for (let i = 0; i < 4000; i++) {
    const key = `${day.year}-${pad2(day.month)}-${pad2(day.day)}`;
    if (days.includes(weekdayOf(day.year, day.month, day.day)) && !holiday.has(key)) {
      const s = wallToUtc({ ...day, hour: ws.hour, minute: ws.minute }, tz).date.getTime();
      const e = wallToUtc({ ...day, hour: we.hour, minute: we.minute }, tz).date.getTime();
      if (cursor < e) {
        const from = Math.max(cursor, s), avail = e - from;
        if (remaining <= avail) return new Date(from + remaining);
        remaining -= avail;
      }
    }
    day = addDays(day, 1);
    cursor = Math.max(cursor, wallToUtc({ ...day, hour: 0, minute: 0 }, tz).date.getTime());
  }
  throw new Error('No business time was found within 4000 days. Check the business days and holidays.');
}
