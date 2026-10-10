/* tz.js - time-zone maths on top of Intl. Pure functions, no DOM. */
const dtfCache = new Map();
function dtf(tz) {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
    dtfCache.set(tz, f);
  }
  return f;
}

export function isValidZone(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; }
}

/** Wall-clock parts of an instant in a zone. */
export function zoneParts(date, tz) {
  const o = {};
  for (const p of dtf(tz).formatToParts(date)) if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10);
  return { year: o.year, month: o.month, day: o.day, hour: o.hour % 24, minute: o.minute, second: o.second };
}

/** Zone offset from UTC at an instant, in milliseconds (positive east of UTC). */
export function offsetMs(date, tz) {
  const p = zoneParts(date, tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000;
}

/**
 * Convert a wall-clock time in a zone to an instant.
 * gap: the wall time does not exist (spring-forward); the result is shifted forward by the jump.
 * ambiguous: the wall time happens twice (fall-back); the earlier instant is returned.
 */
export function wallToUtc(w, tz) {
  const hour = w.hour || 0, minute = w.minute || 0, second = w.second || 0;
  const guess = Date.UTC(w.year, w.month - 1, w.day, hour, minute, second);
  const offs = new Set([offsetMs(new Date(guess - 864e5), tz), offsetMs(new Date(guess + 864e5), tz)]);
  const valid = [];
  for (const off of offs) {
    const d = new Date(guess - off);
    const p = zoneParts(d, tz);
    if (p.year === w.year && p.month === w.month && p.day === w.day && p.hour === hour && p.minute === minute) valid.push(d);
  }
  valid.sort((a, b) => a - b);
  if (valid.length === 0) {
    const before = offsetMs(new Date(guess - 864e5), tz);
    return { date: new Date(guess - before), gap: true, ambiguous: false };
  }
  return { date: valid[0], gap: false, ambiguous: valid.length > 1 };
}

export const pad2 = n => String(n).padStart(2, '0');
export const ymd = p => `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
export const weekdayOf = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

export function parseYmd(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  const year = +m[1], month = +m[2], day = +m[3];
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) return null;
  return { year, month, day };
}
export function parseHm(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
  if (!m) return null;
  const hour = +m[1], minute = +m[2];
  return hour > 23 || minute > 59 ? null : { hour, minute };
}
/** Parse a datetime-local value ("2026-10-05T14:30") into wall parts. */
export function parseLocalInput(v) {
  const bits = (v || '').split('T');
  if (bits.length !== 2) return null;
  const d = parseYmd(bits[0]), t = parseHm(bits[1]);
  return d && t ? { ...d, ...t } : null;
}
export function addDays(p, n) {
  const dt = new Date(Date.UTC(p.year, p.month - 1, p.day + n));
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}
export const daysBetween = (a, b) => Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 864e5);

const fmtCache = new Map();
function fmt(key, tz, opts) {
  const k = key + '|' + tz;
  let f = fmtCache.get(k);
  if (!f) { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }); fmtCache.set(k, f); }
  return f;
}
export const fmtTime = (d, tz) => fmt('t', tz, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(d);
export const fmtDate = (d, tz) => fmt('d', tz, { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
export const fmtDateLong = (d, tz) => fmt('dl', tz, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).format(d);
export const fmtFull = (d, tz) => `${fmtDateLong(d, tz)}, ${fmtTime(d, tz)}`;
/** Full date and time with the zone, adding a GMT offset only when the short zone name is not already one (EST gets one, GMT+8 does not). */
export function fmtFullGmt(d, tz) {
  const base = fmtFull(d, tz);
  return /GMT|UTC/.test(base.split(',').pop()) ? base : `${base} (${gmtLabel(d, tz)})`;
}
export function gmtLabel(d, tz) {
  const p = fmt('o', tz, { timeZoneName: 'shortOffset' }).formatToParts(d).find(x => x.type === 'timeZoneName');
  return p ? p.value : '';
}
export function localZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; }
}
export function humanDuration(ms) {
  const total = Math.floor(Math.abs(ms) / 60000);
  if (total < 1) return 'less than a minute';
  const d = Math.floor(total / 1440), h = Math.floor((total % 1440) / 60), m = total % 60;
  const parts = [];
  if (d) parts.push(d + (d === 1 ? ' day' : ' days'));
  if (h) parts.push(h + (h === 1 ? ' hour' : ' hours'));
  if (m && !d) parts.push(m + (m === 1 ? ' minute' : ' minutes'));
  return parts.join(' ');
}

/** The ten zones the original Callback Time Zones tool used, in the same order. */
export const CALLBACK_ZONES = [
  ['Asia/Manila', 'Philippines (Manila)'], ['America/New_York', 'US Eastern'], ['America/Chicago', 'US Central'],
  ['America/Denver', 'US Mountain'], ['America/Los_Angeles', 'US Pacific'], ['Europe/London', 'United Kingdom'],
  ['Europe/Berlin', 'Central Europe'], ['Asia/Dubai', 'UAE (Dubai)'], ['Asia/Singapore', 'Singapore'],
  ['Australia/Sydney', 'Australia (Sydney)']
];

/** Property and customer zones for lodging work. */
export const PROPERTY_ZONES = [
  ['Pacific/Honolulu', 'Hawaii'], ['America/Anchorage', 'Alaska'], ['America/Los_Angeles', 'US Pacific'],
  ['America/Denver', 'US Mountain'], ['America/Phoenix', 'Arizona (no daylight saving)'], ['America/Chicago', 'US Central'],
  ['America/New_York', 'US Eastern'], ['America/Toronto', 'Toronto'], ['America/Mexico_City', 'Mexico City'],
  ['America/Cancun', 'Cancun'], ['America/Bogota', 'Bogota'], ['America/Lima', 'Lima'], ['America/Sao_Paulo', 'Sao Paulo'],
  ['America/Argentina/Buenos_Aires', 'Buenos Aires'], ['Atlantic/Reykjavik', 'Reykjavik'], ['Europe/London', 'London'],
  ['Europe/Lisbon', 'Lisbon'], ['Europe/Paris', 'Paris'], ['Europe/Madrid', 'Madrid'], ['Europe/Rome', 'Rome'],
  ['Europe/Berlin', 'Berlin'], ['Europe/Athens', 'Athens'], ['Europe/Istanbul', 'Istanbul'], ['Asia/Dubai', 'Dubai'],
  ['Africa/Cairo', 'Cairo'], ['Africa/Johannesburg', 'Johannesburg'], ['Africa/Nairobi', 'Nairobi'], ['Asia/Kolkata', 'India'],
  ['Asia/Colombo', 'Sri Lanka'], ['Asia/Bangkok', 'Bangkok'], ['Asia/Singapore', 'Singapore'], ['Asia/Kuala_Lumpur', 'Kuala Lumpur'],
  ['Asia/Manila', 'Manila'], ['Asia/Hong_Kong', 'Hong Kong'], ['Asia/Shanghai', 'China'], ['Asia/Tokyo', 'Tokyo'],
  ['Asia/Seoul', 'Seoul'], ['Asia/Makassar', 'Bali (WITA)'], ['Australia/Sydney', 'Sydney'], ['Pacific/Auckland', 'Auckland'],
  ['Pacific/Fiji', 'Fiji']
];
