import test from 'node:test';
import assert from 'node:assert/strict';
import * as tz from '../src/assets/js/lib/tz.js';
import * as money from '../src/assets/js/lib/money.js';
import { priceBreakdown } from '../src/assets/js/lib/price.js';
import * as com from '../src/assets/js/lib/commission.js';
import { cancellationDeadline, cancellationStatus, penaltyCents } from '../src/assets/js/lib/cancel.js';
import { addBusinessHours, calendarDue } from '../src/assets/js/lib/sla.js';
import { hotelKpis, pctChange, availableRoomNights } from '../src/assets/js/lib/kpi.js';
import { parseDelimited, parseTable, detectDelimiter, toCsv } from '../src/assets/js/lib/csv.js';
import * as grp from '../src/assets/js/lib/group.js';
import { normalizeName, stripDiacritics } from '../src/assets/js/lib/names.js';
import { findSensitive, maskSensitive, luhnValid } from '../src/assets/js/lib/pii.js';
import { CASE_TYPES, fieldsFor, missingRequired, buildNote, scanValues } from '../src/assets/js/lib/casenotes.js';
import { spellingText, spellWord } from '../src/assets/js/lib/phonetic.js';
import { formatters, countLabel, mmss, hhmmss } from '../src/assets/js/lib/text.js';
import { timerState, compareText, parseTarget, shiftAverage, handleSeconds } from '../src/assets/js/lib/aht.js';

const iso = d => d.toISOString();
const W = (y, m, d, h = 0, mi = 0) => ({ year: y, month: m, day: d, hour: h, minute: mi });

test('tz: wall time to instant, fixed and daylight-saving zones', () => {
  assert.equal(iso(tz.wallToUtc(W(2026, 10, 5, 9), 'Asia/Manila').date), '2026-10-05T01:00:00.000Z');
  assert.equal(iso(tz.wallToUtc(W(2026, 10, 5, 12), 'America/New_York').date), '2026-10-05T16:00:00.000Z');
  assert.equal(iso(tz.wallToUtc(W(2026, 11, 10, 12), 'America/New_York').date), '2026-11-10T17:00:00.000Z');
  assert.equal(iso(tz.wallToUtc(W(2026, 7, 1, 12), 'America/Phoenix').date), '2026-07-01T19:00:00.000Z');
  assert.equal(iso(tz.wallToUtc(W(2026, 7, 1, 12), 'Europe/London').date), '2026-07-01T11:00:00.000Z');
  assert.equal(iso(tz.wallToUtc(W(2026, 12, 1, 12), 'Europe/London').date), '2026-12-01T12:00:00.000Z');
  assert.equal(iso(tz.wallToUtc(W(2026, 10, 3, 12), 'Australia/Sydney').date), '2026-10-03T02:00:00.000Z');
  assert.equal(iso(tz.wallToUtc(W(2026, 10, 5, 12), 'Australia/Sydney').date), '2026-10-05T01:00:00.000Z');
});
test('tz: spring-forward gap and fall-back ambiguity are flagged', () => {
  const gap = tz.wallToUtc(W(2026, 3, 8, 2, 30), 'America/New_York');
  assert.equal(gap.gap, true);
  assert.equal(iso(gap.date), '2026-03-08T07:30:00.000Z');
  const amb = tz.wallToUtc(W(2026, 11, 1, 1, 30), 'America/New_York');
  assert.equal(amb.ambiguous, true);
  assert.equal(iso(amb.date), '2026-11-01T05:30:00.000Z');
  assert.equal(tz.wallToUtc(W(2026, 6, 1, 10), 'America/New_York').ambiguous, false);
});
test('tz: round trip across zones and dates', () => {
  for (const [id] of tz.PROPERTY_ZONES) for (const base of [Date.UTC(2026, 0, 15, 5), Date.UTC(2026, 6, 15, 17), Date.UTC(2026, 9, 5, 3)]) {
    const d = new Date(base), p = tz.zoneParts(d, id);
    const back = tz.wallToUtc(p, id);
    assert.equal(back.date.getTime(), d.getTime(), `${id} ${d.toISOString()}`);
  }
});
test('tz: date helpers', () => {
  assert.equal(tz.parseYmd('2026-02-30'), null);
  assert.deepEqual(tz.parseYmd('2028-02-29'), { year: 2028, month: 2, day: 29 });
  assert.deepEqual(tz.addDays({ year: 2026, month: 12, day: 30 }, 3), { year: 2027, month: 1, day: 2 });
  assert.equal(tz.daysBetween({ year: 2026, month: 10, day: 1 }, { year: 2026, month: 11, day: 1 }), 31);
  assert.equal(tz.parseHm('24:00'), null);
  assert.deepEqual(tz.parseLocalInput('2026-10-05T14:30'), W(2026, 10, 5, 14, 30));
  assert.equal(tz.humanDuration(90 * 60000), '1 hour 30 minutes');
  assert.equal(tz.humanDuration(26 * 3600000), '1 day 2 hours');
  assert.equal(tz.humanDuration(10000), 'less than a minute');
  assert.equal(tz.gmtLabel(new Date('2026-10-05T00:00:00Z'), 'Asia/Manila'), 'GMT+8');
  assert.equal(tz.fmtFullGmt(new Date('2026-10-05T12:00:00Z'), 'Asia/Manila'), 'Mon, Oct 5, 2026, 8:00 PM GMT+8');
  assert.equal(tz.fmtFullGmt(new Date('2026-11-09T04:59:00Z'), 'America/New_York'), 'Sun, Nov 8, 2026, 11:59 PM EST (GMT-5)');
});
test('tz: every zone in the lists is valid', () => {
  for (const [id] of [...tz.PROPERTY_ZONES, ...tz.CALLBACK_ZONES]) assert.ok(tz.isValidZone(id), id);
  assert.equal(tz.CALLBACK_ZONES.length, 10);
});

test('money: rounding and conversion', () => {
  assert.equal(money.toCents('19.99'), 1999);
  assert.equal(money.toCents(1.005), 101);
  assert.equal(money.toCents('1,234.50'), 123450);
  assert.equal(money.toCents('abc'), 0);
  assert.equal(money.pctOf(76500, 12), 9180);
  assert.equal(money.convert(104180, 56.25, 'PHP'), 58601.25);
  assert.equal(money.convert(104180, 150.5, 'JPY'), 156791);
  assert.equal(money.formatCents(104180, 'USD'), '1,041.80 USD');
  assert.equal(money.formatAmount(156791, 'JPY'), '156,791');
});
test('price: breakdown, taxable fees, balance, cancel and delta', () => {
  const base = { lines: [{ rate: 150, nights: 3 }, { rate: 200, nights: 2 }], discountPct: 10, feePerNight: 25, feePerStay: 40, taxPct: 12, cityTaxPerPersonNight: 2, persons: 2 };
  const a = priceBreakdown(base);
  assert.equal(a.nights, 5); assert.equal(a.roomSubtotal, 85000); assert.equal(a.discount, 8500); assert.equal(a.roomNet, 76500);
  assert.equal(a.fees, 16500); assert.equal(a.tax, 9180); assert.equal(a.cityTax, 2000); assert.equal(a.total, 104180);
  assert.equal(a.averageNight, 20836);
  assert.equal(priceBreakdown({ ...base, feesTaxable: true }).total, 106160);
  const b = priceBreakdown({ ...base, prepaid: 1000, penalty: 150, originalTotal: 1000 });
  assert.equal(b.balanceDue, 4180); assert.equal(b.refundOnCancel, 85000); assert.equal(b.delta, 4180);
  assert.equal(priceBreakdown({ ...base, prepaid: 2000, penalty: 150 }).overpaid, 95820);
  assert.equal(priceBreakdown({ ...base, penalty: 500 }).owedOnCancel, 50000);
  assert.equal(priceBreakdown({ lines: [{ rate: 100, nights: 1 }], discountAmt: 99999 }).discount, 10000);
  assert.equal(priceBreakdown({ lines: [] }).total, 0);
  assert.equal(priceBreakdown({ lines: [{ rate: 100, nights: 1 }] }).delta, null);
});
test('commission: gross, net, markup and margin', () => {
  assert.deepEqual(com.grossToNet(100, 10), { gross: 10000, commission: 1000, net: 9000 });
  assert.deepEqual(com.netToGross(90, 10), { net: 9000, gross: 10000, commission: 1000 });
  assert.ok(com.netToGross(90, 100).error);
  assert.equal(com.markupToMargin(25), 20);
  assert.equal(com.marginToMarkup(20), 25);
  assert.equal(com.marginToMarkup(100), null);
  assert.deepEqual(com.netToSell(80, 25), { net: 8000, sell: 10000, profit: 2000, marginPct: 20 });
  const s = com.stayCommission({ nightlyRoom: 120, nights: 3, rooms: 2, taxPct: 10, commissionPct: 10 });
  assert.deepEqual(s, { roomRevenue: 72000, taxes: 7200, commission: 7200, customerTotal: 79200, netToHotel: 72000, roomNights: 6 });
});
test('cancel: deadlines in property local time, across daylight saving', () => {
  const ny = 'America/New_York';
  assert.equal(iso(cancellationDeadline({ checkInDate: '2026-11-10', tz: ny, mode: 'days', days: 2, cutoffTime: '23:59' }).deadline), '2026-11-09T04:59:00.000Z');
  assert.equal(iso(cancellationDeadline({ checkInDate: '2026-11-10', tz: ny, mode: 'hours', hours: 48, checkInTime: '15:00' }).deadline), '2026-11-08T20:00:00.000Z');
  assert.equal(iso(cancellationDeadline({ checkInDate: '2026-11-02', tz: ny, mode: 'hours', hours: 72, checkInTime: '15:00' }).deadline), '2026-10-30T20:00:00.000Z');
  assert.equal(iso(cancellationDeadline({ checkInDate: '2026-11-02', tz: ny, mode: 'days', days: 3, cutoffTime: '23:59' }).deadline), '2026-10-31T03:59:00.000Z');
  assert.equal(iso(cancellationDeadline({ checkInDate: '2026-12-01', tz: 'Asia/Manila', mode: 'days', days: 1, cutoffTime: '18:00' }).deadline), '2026-11-30T10:00:00.000Z');
  assert.throws(() => cancellationDeadline({ checkInDate: 'nope', tz: ny, mode: 'days' }));
  assert.throws(() => cancellationDeadline({ checkInDate: '2026-11-10', tz: ny, mode: 'days', cutoffTime: '25:00' }));
  const gapCase = cancellationDeadline({ checkInDate: '2026-03-10', tz: ny, mode: 'days', days: 2, cutoffTime: '02:30' });
  assert.equal(gapCase.gap, true);
});
test('cancel: status and penalties', () => {
  const dl = new Date('2026-11-09T04:59:00Z');
  assert.equal(cancellationStatus(dl, new Date('2026-11-09T04:59:00Z')).open, true);
  assert.equal(cancellationStatus(dl, new Date('2026-11-09T05:00:00Z')).open, false);
  assert.equal(cancellationStatus(dl, new Date('2026-11-09T05:00:00Z')).ms, 60000);
  const base = { nightlyRate: 150, nights: 3, total: 450 };
  assert.equal(penaltyCents({ ...base, type: 'none' }), 0);
  assert.equal(penaltyCents({ ...base, type: 'firstNight' }), 15000);
  assert.equal(penaltyCents({ ...base, type: 'nights', penaltyNights: 2 }), 30000);
  assert.equal(penaltyCents({ ...base, type: 'nights', penaltyNights: 9 }), 45000);
  assert.equal(penaltyCents({ ...base, type: 'percent', percent: 20 }), 9000);
  assert.equal(penaltyCents({ ...base, type: 'full' }), 45000);
});
test('sla: business hours across weekends, holidays and daylight saving', () => {
  const m = { tz: 'Asia/Manila' };
  const at = (s, z = 'Asia/Manila') => { const [d, t] = s.split(' '); const [y, mo, da] = d.split('-').map(Number); const [h, mi] = t.split(':').map(Number); return tz.wallToUtc({ year: y, month: mo, day: da, hour: h, minute: mi }, z).date; };
  assert.equal(iso(addBusinessHours(at('2026-10-09 16:00'), 4, m)), '2026-10-12T03:00:00.000Z');
  assert.equal(iso(addBusinessHours(at('2026-10-12 10:00'), 8, m)), '2026-10-12T10:00:00.000Z');
  assert.equal(iso(addBusinessHours(at('2026-10-10 10:00'), 1, m)), '2026-10-12T02:00:00.000Z');
  assert.equal(iso(addBusinessHours(at('2026-10-09 16:00'), 4, { ...m, holidays: ['2026-10-12'] })), '2026-10-13T03:00:00.000Z');
  assert.equal(iso(addBusinessHours(at('2026-03-09 08:00', 'America/New_York'), 1, { tz: 'America/New_York' })), '2026-03-09T14:00:00.000Z');
  assert.equal(iso(addBusinessHours(at('2026-10-09 19:00'), 1, m)), '2026-10-12T02:00:00.000Z');
  assert.throws(() => addBusinessHours(new Date(), 1, { tz: 'Asia/Manila', windowStart: '18:00', windowEnd: '09:00' }));
  assert.throws(() => addBusinessHours(new Date(), 1, { tz: 'Asia/Manila', days: [] }));
  assert.equal(iso(calendarDue(new Date('2026-10-05T00:00:00Z'), 24)), '2026-10-06T00:00:00.000Z');
});
test('kpi: occupancy, ADR, RevPAR', () => {
  const k = hotelKpis({ roomsAvailable: 100, roomsSold: 70, revenue: 10500 });
  assert.equal(k.occupancy, 70); assert.equal(k.adr, 150); assert.equal(k.revpar, 105);
  assert.equal(hotelKpis({ roomsAvailable: 100, roomsSold: 0, revenue: 0 }).adr, null);
  assert.equal(hotelKpis({ roomsAvailable: 0, roomsSold: 0, revenue: 0 }).occupancy, null);
  assert.equal(hotelKpis({ roomsAvailable: 10, roomsSold: 12, revenue: 1 }).soldExceedsAvailable, true);
  assert.equal(pctChange(100, 110), 10); assert.equal(pctChange(0, 5), null); assert.equal(availableRoomNights(100, 30), 3000);
});

test('csv: quotes, newlines, delimiters, BOM, safe export', () => {
  assert.deepEqual(parseDelimited('a,b\n"x, y","He said ""hi"""\n'), [['a', 'b'], ['x, y', 'He said "hi"']]);
  assert.deepEqual(parseDelimited('a,b\r\n"line1\nline2",c\r\n'), [['a', 'b'], ['line1\nline2', 'c']]);
  assert.equal(detectDelimiter('a\tb\tc\n1\t2\t3'), '\t');
  assert.equal(detectDelimiter('a;b;c\n1;2;3'), ';');
  assert.deepEqual(parseDelimited('\uFEFFname\tdate\nAnna\t2026-10-05'), [['name', 'date'], ['Anna', '2026-10-05']]);
  assert.deepEqual(parseDelimited('a,b\n\n,\n1,2'), [['a', 'b'], ['1', '2']]);
  const t = parseTable('Name, Room\nAnna ,Suite');
  assert.deepEqual(t.headers, ['Name', 'Room']); assert.deepEqual(t.records[0], { Name: 'Anna', Room: 'Suite' });
  assert.equal(toCsv([['a', '=SUM(A1)'], ['x,y', 'q"r']]), "a,'=SUM(A1)\r\n\"x,y\",\"q\"\"r\"\r\n");
  assert.equal(toCsv([['=1']], { safe: false }), '=1\r\n');
});
test('group: block maths and cutoff', () => {
  assert.equal(grp.compRooms(100, 25), 4); assert.equal(grp.compRooms(49, 25), 1); assert.equal(grp.compRooms(24, 25), 0); assert.equal(grp.compRooms(50, 0), 0);
  assert.equal(grp.roomsNeeded(45, 2), 23);
  const s = grp.blockSummary({ lines: [{ type: 'Standard', rooms: 40, rate: 150 }, { type: 'Suite', rooms: 10, rate: 300 }], nights: 3, compRatio: 25, attritionPct: 10, arrival: '2026-11-10', cutoffDaysBefore: 30 });
  assert.equal(s.paidRooms, 50); assert.equal(s.roomNights, 150); assert.equal(s.revenue, 2700000); assert.equal(s.comps, 2);
  assert.equal(s.avgRate, 18000); assert.equal(s.compValue, 108000); assert.equal(s.minPaidRooms, 45); assert.equal(s.releasableRooms, 5);
  assert.equal(s.minRevenue, 2430000); assert.equal(s.cutoff, '2026-10-11');
});
test('group: date parsing', () => {
  assert.equal(grp.normalizeDate('2026-11-03'), '2026-11-03');
  assert.equal(grp.normalizeDate('11/03/2026', 'mdy'), '2026-11-03');
  assert.equal(grp.normalizeDate('11/03/2026', 'dmy'), '2026-03-11');
  assert.equal(grp.normalizeDate('13/01/2026', 'mdy'), null);
  assert.equal(grp.normalizeDate('3 Nov 2026'), '2026-11-03');
  assert.equal(grp.normalizeDate('03-Nov-2026'), '2026-11-03');
  assert.equal(grp.normalizeDate('Nov 3, 2026'), '2026-11-03');
  assert.equal(grp.normalizeDate('2026-02-30'), null);
  assert.equal(grp.normalizeDate(''), null);
});
test('group: rooming list validation', () => {
  const table = parseTable('Guest Name,Room Type,Check-in,Check-out\nAnna Cruz,Standard,2026-11-10,2026-11-12\nBen Tan,standard,2026-11-10,2026-11-12\nCy Lee,Standard,2026-11-10,2026-11-13\n,Suite,2026-11-10,2026-11-12\nDee Ong,Penthouse,2026-11-10,2026-11-12\nEli Roe,Suite,2026-13-45,2026-11-12\nFay Dow,Suite,2026-11-12,2026-11-10\nAnna Cruz,Standard,2026-11-10,2026-11-12\nGus Pil,Suite,2026-11-09,2026-11-12');
  const r = grp.validateRoomingList(table.records, table.headers, { arrival: '2026-11-10', departure: '2026-11-13', roomTypes: { Standard: 2, Suite: 1 }, dateFormat: 'mdy' });
  assert.equal(r.ok, true);
  assert.equal(r.summary.total, 9);
  assert.deepEqual(r.rows.map(x => x.errors.length > 0), [false, false, false, true, true, true, true, false, false]);
  assert.match(r.rows[3].errors[0], /name is missing/);
  assert.match(r.rows[4].errors[0], /Penthouse/);
  assert.match(r.rows[6].errors.join(' '), /after arrival/);
  assert.match(r.rows[7].warnings.join(' '), /duplicate of row 1/);
  assert.match(r.rows[8].warnings.join(' '), /before the block starts/);
  assert.ok(r.overAllocated.some(o => o.type === 'Standard' && o.date === '2026-11-10' && o.count === 4 && o.block === 2));
  assert.equal(r.summary.perType.Standard, 4);
  const clean = grp.cleanRowsForExport(r.rows);
  assert.equal(clean.length, 1 + 4 + 1);
  assert.deepEqual(clean[0], ['Guest name', 'Room type', 'Arrival', 'Departure', 'Email', 'Notes']);
  const miss = grp.validateRoomingList([], ['Name', 'Foo'], { roomTypes: {} });
  assert.equal(miss.ok, false); assert.deepEqual(miss.missing, ['type', 'arrival', 'departure']);
});

test('names: formats, titles, particles, accents', () => {
  const n = (s, o) => normalizeName(s, o);
  assert.deepEqual([n('Mr. John A. Smith').surname, n('Mr. John A. Smith').given, n('Mr. John A. Smith').output], ['SMITH', 'JOHN A', 'SMITH/JOHN A']);
  assert.equal(n('SMITH/JOHN MR').output, 'SMITH/JOHN');
  assert.equal(n('García, José').output, 'GARCIA/JOSE');
  assert.equal(n('Maria de la Cruz').output, 'DE LA CRUZ/MARIA');
  assert.equal(n("Seán O'Brien Jr").output, "O'BRIEN/SEAN");
  assert.equal(n("Seán O'Brien", { keepApostrophe: false }).output, 'OBRIEN/SEAN');
  assert.equal(n('Jean-Luc Picard').output, 'PICARD/JEAN-LUC');
  assert.equal(n('Jean-Luc Picard', { keepHyphen: false }).output, 'PICARD/JEAN LUC');
  assert.equal(n('John Smith', { format: 'given-first' }).output, 'JOHN SMITH');
  assert.equal(n('John Smith', { format: 'comma' }).output, 'SMITH, JOHN');
  assert.equal(n('John Smith', { upper: false }).output, 'Smith/John');
  assert.equal(n('Ørsted, Søren').output, 'ORSTED/SOREN');
  assert.equal(n('Straße, Anna').output, 'STRASSE/ANNA');
  assert.equal(stripDiacritics('Łukasz Đorđe'), 'Lukasz Dorde');
  assert.equal(n('Madonna').warnings.length, 1);
  assert.ok(n('Juan Carlos Pérez García Ruiz').warnings.some(w => /Several names/.test(w)));
  assert.ok(n('田中 太郎').warnings.some(w => /non-Latin/.test(w)));
  assert.ok(n('John Smith 3rd').warnings.some(w => /digits/.test(w)));
  assert.deepEqual(n('   '), { output: '', surname: '', given: '', warnings: [] });
});
test('pii: card numbers, codes, ids, passwords, masking', () => {
  assert.equal(luhnValid('4111111111111111'), true);
  assert.equal(luhnValid('4111111111111112'), false);
  assert.equal(findSensitive('card 4111 1111 1111 1111 ok')[0].last4, '1111');
  assert.equal(findSensitive('4111-1111-1111-1111')[0].kind, 'card');
  assert.equal(findSensitive('5500 0000 0000 0004').length, 1);
  assert.equal(findSensitive('4111-1111-1111-1112').length, 0);
  assert.equal(findSensitive('booking 1000000000000').length, 0);
  assert.equal(findSensitive('41111111111111111111').length, 0);
  assert.equal(findSensitive('cvv 123')[0].kind, 'cvv');
  assert.equal(findSensitive('CVC: 4567')[0].kind, 'cvv');
  assert.equal(findSensitive('id 123-45-6789')[0].kind, 'ssn');
  assert.equal(findSensitive('password: hunter2')[0].kind, 'password');
  assert.equal(findSensitive('Confirmation LB-48213 for 2 guests').length, 0);
  assert.equal(maskSensitive('Card 4111 1111 1111 1111 cvv 123').text, 'Card [card ending 1111 removed] [card security code removed]');
  assert.equal(maskSensitive('nothing here').text, 'nothing here');
});
test('casenotes: schema, completeness, builder, scan', () => {
  assert.equal(CASE_TYPES.length, 12);
  assert.equal(CASE_TYPES.filter(t => t.group === 'B2B').length, 4);
  for (const t of CASE_TYPES) { const ids = fieldsFor(t.id).map(x => x.id); assert.equal(new Set(ids).size, ids.length, t.id); assert.ok(fieldsFor(t.id).some(x => x.required)); }
  assert.deepEqual(missingRequired('cancel', { bookingRef: 'LB-1' }).slice(0, 3), ['Property name', 'Spoke with (role or first name)', 'Channel']);
  assert.equal(missingRequired('cancel', Object.fromEntries(fieldsFor('cancel').filter(x => x.required).map(x => [x.id, 'x']))).length, 0);
  const note = buildNote('cancel', { bookingRef: 'LB-1', property: 'Sea View', actions: 'Line one\nLine two', outcome: '', stayDates: '10 to 12 Nov' }, { loggedAt: 'Mon 5 Oct, 14:05' });
  assert.match(note, /^LODGING CASE NOTE: Cancellation request\nLogged: Mon 5 Oct, 14:05\nBooking reference: LB-1\nProperty name: Sea View/);
  assert.match(note, /Actions taken:\n {2}Line one\n {2}Line two/);
  assert.ok(!/Outcome/.test(note));
  assert.equal(buildNote('nope', {}), '');
  assert.equal(scanValues({ summary: 'paid with 4111 1111 1111 1111', actions: 'ok' })[0].field, 'summary');
});
test('original tools: spelling, formatters, aht, phrases', () => {
  assert.equal(spellingText('a1@ '), 'a - Alpha, 1 - One, @ - At, (space)');
  assert.equal(spellWord('9'), 'Niner'); assert.equal(spellWord('j'), 'Juliett'); assert.equal(spellWord('~'), '');
  assert.equal(formatters.title('mARIA dE la-cruz'), 'Maria De La-Cruz');
  assert.equal(formatters.sentence('hello world. how ARE you?\nnew line'), 'Hello world. How are you?\nNew line');
  assert.equal(formatters.trim('  a   b \n  c  '), 'a b\nc');
  assert.equal(formatters.join('a\n\n b\nc'), 'a b c');
  assert.equal(countLabel(' two words '), '2 words, 11 characters');
  assert.equal(mmss(125), '02:05'); assert.equal(hhmmss(3725), '01:02:05');
  assert.equal(parseTarget('abc'), 490); assert.equal(parseTarget('300'), 300);
  assert.equal(compareText(500, 490), '10 seconds over the target of 490 seconds.');
  assert.equal(compareText(490, 490), 'Exactly on the target of 490 seconds.');
  assert.equal(compareText(400, 490), '90 seconds under the target of 490 seconds.');
  assert.equal(handleSeconds(120, 30, 60), 210); assert.equal(shiftAverage(7, 30, 54), 500); assert.equal(shiftAverage(0, 0, 5), 0);
  assert.deepEqual(timerState(0, 490, false), { label: 'Ready', tone: 'idle' });
  assert.deepEqual(timerState(10, 490, false), { label: 'Paused', tone: 'idle' });
  assert.deepEqual(timerState(10, 490, true), { label: 'On pace', tone: 'ok' });
  assert.deepEqual(timerState(368, 490, true), { label: 'Approaching target', tone: 'warn' });
  assert.deepEqual(timerState(491, 490, true), { label: 'Over target', tone: 'bad' });
});
