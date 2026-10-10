/* group.js - group block maths and rooming list validation. Money in cents. */
import { parseYmd, ymd, addDays, daysBetween } from './tz.js';
import { toCents, roundHalfUp } from './money.js';

export const roomsNeeded = (guests, perRoom) => (guests > 0 && perRoom > 0 ? Math.ceil(guests / perRoom) : 0);
/** One complimentary room per `ratio` paid rooms, rounded down. A ratio of 0 means no comps. */
export const compRooms = (paid, ratio) => (ratio > 0 ? Math.floor(paid / ratio) : 0);

/**
 * lines: [{type, rooms, rate}] where rooms is rooms per night.
 * nights: stay length. attritionPct: share of the block that can be released without penalty.
 */
export function blockSummary({ lines, nights, compRatio, attritionPct, arrival, cutoffDaysBefore }) {
  const n = Math.max(0, Math.floor(Number(nights) || 0));
  const clean = (lines || []).map(l => ({ type: String(l.type || '').trim() || 'Room', rooms: Math.max(0, Math.floor(Number(l.rooms) || 0)), rate: toCents(l.rate) }));
  const paidRooms = clean.reduce((s, l) => s + l.rooms, 0);
  const roomNights = paidRooms * n;
  const revenue = clean.reduce((s, l) => s + l.rooms * l.rate * n, 0);
  const comps = compRooms(paidRooms, Number(compRatio) || 0);
  const avgRate = roomNights ? Math.round(revenue / roomNights) : 0;
  const attr = Math.min(100, Math.max(0, Number(attritionPct) || 0));
  const minPaidRooms = Math.ceil(paidRooms * (1 - attr / 100));
  const minRevenue = paidRooms ? roundHalfUp(revenue * (minPaidRooms / paidRooms)) : 0;
  const a = parseYmd(arrival);
  const cutoff = a ? ymd(addDays(a, -Math.max(0, Math.floor(Number(cutoffDaysBefore) || 0)))) : null;
  return {
    lines: clean, paidRooms, roomNights, revenue, avgRate, comps, compNights: comps * n, compValue: comps * n * avgRate,
    minPaidRooms, releasableRooms: paidRooms - minPaidRooms, minRevenue, cutoff
  };
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
const make = (y, m, d) => { const p = parseYmd(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`); return p ? ymd(p) : null; };

/** Returns YYYY-MM-DD or null. fmt decides how a numeric 03/11/2026 reads: "mdy" (default) or "dmy". */
export function normalizeDate(input, fmt = 'mdy') {
  const s = String(input || '').trim();
  if (!s) return null;
  let m;
  if ((m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(s))) return make(+m[1], +m[2], +m[3]);
  if ((m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s))) return fmt === 'dmy' ? make(+m[3], +m[2], +m[1]) : make(+m[3], +m[1], +m[2]);
  if ((m = /^(\d{1,2})[ -]([A-Za-z]{3,9})\.?,?[ -](\d{4})$/.exec(s)) && MONTHS[m[2].toLowerCase()]) return make(+m[3], MONTHS[m[2].toLowerCase()], +m[1]);
  if ((m = /^([A-Za-z]{3,9})\.? (\d{1,2}),? (\d{4})$/.exec(s)) && MONTHS[m[1].toLowerCase()]) return make(+m[3], MONTHS[m[1].toLowerCase()], +m[2]);
  return null;
}

const ALIASES = {
  name: ['guest name', 'guest', 'name', 'full name', 'passenger', 'traveler', 'traveller'],
  type: ['room type', 'room', 'type', 'category', 'room category'],
  arrival: ['arrival', 'check-in', 'check in', 'checkin', 'arrive', 'arrival date', 'check-in date', 'from'],
  departure: ['departure', 'check-out', 'check out', 'checkout', 'depart', 'departure date', 'check-out date', 'to'],
  email: ['email', 'e-mail', 'email address'],
  notes: ['notes', 'note', 'comments', 'special requests', 'requests']
};
export function mapColumns(headers) {
  const norm = headers.map(h => h.trim().toLowerCase());
  const out = {};
  for (const [key, names] of Object.entries(ALIASES)) {
    const idx = norm.findIndex(h => names.includes(h));
    out[key] = idx >= 0 ? headers[idx] : null;
  }
  return out;
}

/**
 * Validate parsed rooming-list records against a block.
 * ctx: { arrival, departure (YYYY-MM-DD or empty), roomTypes: {typeName: roomsInBlock}, dateFormat: 'mdy'|'dmy' }
 */
export function validateRoomingList(records, headers, ctx) {
  const cols = mapColumns(headers);
  const missing = ['name', 'type', 'arrival', 'departure'].filter(k => !cols[k]);
  if (missing.length) return { ok: false, missing, columns: cols };
  const types = new Map(Object.keys(ctx.roomTypes || {}).map(t => [t.trim().toLowerCase(), t.trim()]));
  const blockStart = parseYmd(ctx.arrival || ''), blockEnd = parseYmd(ctx.departure || '');
  const seen = new Map();
  const nightly = {}; // type -> date -> count
  const rows = records.map((rec, i) => {
    const errors = [], warnings = [];
    const name = (rec[cols.name] || '').trim();
    const rawType = (rec[cols.type] || '').trim();
    const arrival = normalizeDate(rec[cols.arrival], ctx.dateFormat);
    const departure = normalizeDate(rec[cols.departure], ctx.dateFormat);
    if (!name) errors.push('Guest name is missing');
    if (!rawType) errors.push('Room type is missing');
    else if (types.size && !types.has(rawType.toLowerCase())) errors.push(`Room type "${rawType}" is not in the block`);
    if (!arrival) errors.push('Arrival date is not a valid date');
    if (!departure) errors.push('Departure date is not a valid date');
    let nights = 0;
    if (arrival && departure) {
      nights = daysBetween(parseYmd(arrival), parseYmd(departure));
      if (nights <= 0) errors.push('Departure must be after arrival');
      else if (nights > 365) errors.push('Stay is longer than 365 nights');
      if (blockStart && daysBetween(blockStart, parseYmd(arrival)) < 0) warnings.push('Arrives before the block starts');
      if (blockEnd && daysBetween(parseYmd(departure), blockEnd) < 0) warnings.push('Departs after the block ends');
    }
    const typeName = types.get(rawType.toLowerCase()) || rawType;
    const key = [name.toLowerCase(), typeName.toLowerCase(), arrival, departure].join('|');
    if (name && arrival && departure) {
      if (seen.has(key)) warnings.push(`Possible duplicate of row ${seen.get(key)}`); else seen.set(key, i + 1);
    }
    if (!errors.length) {
      const bucket = nightly[typeName] || (nightly[typeName] = {});
      for (let k = 0; k < nights; k++) { const dt = ymd(addDays(parseYmd(arrival), k)); bucket[dt] = (bucket[dt] || 0) + 1; }
    }
    return { index: i + 1, name, type: typeName, arrival, departure, nights, email: cols.email ? (rec[cols.email] || '') : '', notes: cols.notes ? (rec[cols.notes] || '') : '', errors, warnings };
  });
  const over = [];
  for (const [type, perDate] of Object.entries(nightly)) {
    const cap = ctx.roomTypes && ctx.roomTypes[type];
    if (!cap) continue;
    for (const [date, count] of Object.entries(perDate).sort()) if (count > cap) over.push({ type, date, count, block: cap });
  }
  const valid = rows.filter(r => !r.errors.length);
  const perType = {};
  valid.forEach(r => { perType[r.type] = (perType[r.type] || 0) + 1; });
  return {
    ok: true, columns: cols, rows, overAllocated: over, nightly,
    summary: { total: rows.length, valid: valid.length, withErrors: rows.length - valid.length, withWarnings: rows.filter(r => r.warnings.length).length, perType }
  };
}

export function cleanRowsForExport(rows) {
  const out = [['Guest name', 'Room type', 'Arrival', 'Departure', 'Email', 'Notes']];
  rows.filter(r => !r.errors.length).forEach(r => out.push([r.name, r.type, r.arrival, r.departure, r.email, r.notes]));
  return out;
}
