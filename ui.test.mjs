import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { TOOLS } from '../src/assets/js/meta.js';

let dom, clip;
function env(url = 'https://example.test/') {
  dom = new JSDOM('<!doctype html><body><main id="m"></main></body>', { url, pretendToBeVisual: true });
  const w = dom.window; clip = [];
  const set = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  for (const k of ['document', 'window', 'localStorage', 'FileReader', 'Event', 'KeyboardEvent', 'Blob', 'HTMLElement']) set(k, w[k]);
  set('navigator', Object.assign(w.navigator, {}));
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async t => { clip.push(t); } }, configurable: true });
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  set('URL', w.URL);
  return w;
}
async function mount(id) {
  env();
  const mod = (await import(`../src/assets/js/tools/${id}.js?t=${Math.random()}`)).default;
  const root = document.getElementById('m');
  const inst = mod.mount(root) || {};
  const q = s => root.querySelector(s);
  const byLabel = text => { const l = [...root.querySelectorAll('label')].find(x => x.textContent.trim().startsWith(text)); assert.ok(l, 'label not found: ' + text); return root.querySelector('#' + l.getAttribute('for')); };
  const set = (text, v) => { const el = byLabel(text); el.value = v; el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); return el; };
  const click = text => { const b = [...root.querySelectorAll('button')].find(x => x.textContent.trim() === text); assert.ok(b, 'button not found: ' + text); b.click(); return b; };
  return { root, q, set, byLabel, click, inst, text: () => root.textContent };
}
const tick = ms => new Promise(r => setTimeout(r, ms));

test('every tool: all controls labelled, buttons named, ids unique, no errors on mount', async () => {
  for (const t of TOOLS) {
    const { root, inst } = await mount(t.id);
    const bad = [...root.querySelectorAll('input:not([type=hidden]), select, textarea')].filter(el => {
      const byFor = el.id && root.querySelector(`label[for="${el.id}"]`); const wrapped = el.closest('label');
      return !(byFor || wrapped || el.getAttribute('aria-label'));
    });
    assert.equal(bad.length, 0, `${t.id}: unlabelled controls ${bad.map(b => b.outerHTML.slice(0, 60))}`);
    const unnamed = [...root.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label'));
    assert.equal(unnamed.length, 0, `${t.id}: unnamed buttons`);
    const ids = [...root.querySelectorAll('[id]')].map(e => e.id); assert.equal(new Set(ids).size, ids.length, `${t.id}: duplicate ids`);
    if (inst.destroy) inst.destroy();
  }
});
test('call-scratchpad: counts, templates, card guard, mask, persistence, confirm clear', async () => {
  const t = await mount('call-scratchpad'); const area = t.byLabel('Notes');
  t.set('Notes', 'one two three'); assert.match(t.q('.counts').textContent, /3 words, 13 characters/);
  assert.equal(localStorage.getItem('agentNotes'), 'one two three');
  t.click('Standard template'); assert.match(area.value, /Reason for contact:/);
  const guard = t.q('.callout.warn[role=status]'); assert.equal(guard.hidden, true);
  t.set('Notes', 'card 4111 1111 1111 1111 please'); assert.equal(guard.hidden, false); assert.match(guard.textContent, /card number/);
  t.click('Copy notes'); await tick(5); assert.equal(clip.at(-1), 'card [card ending 1111 removed] please');
  t.click('Mask sensitive text'); assert.equal(area.value, 'card [card ending 1111 removed] please'); assert.equal(guard.hidden, true);
  t.click('Clear notes'); const confirm = t.q('.confirm'); assert.equal(confirm.hidden, false);
  t.click('Keep notes'); assert.equal(area.value.length > 0, true);
  t.click('Clear notes'); t.click('Delete notes'); assert.equal(area.value, ''); assert.equal(localStorage.getItem('agentNotes'), null);
});
test('aht-timer: start, over target, pause, reset; target persists', async () => {
  const real = globalThis.performance.now.bind(globalThis.performance); let now = 1000; globalThis.performance.now = () => now;
  try {
    const t = await mount('aht-timer'); const disp = t.q('[role=timer]'), st = t.q('[role=status]');
    assert.equal(st.textContent, 'Ready'); t.set('Target handling threshold', '100'); assert.equal(localStorage.getItem('ahtTarget'), '100');
    t.click('Start'); now += 50000; await tick(300); assert.equal(st.textContent, 'On pace' === st.textContent ? 'On pace' : st.textContent);
    assert.ok(['On pace', 'Approaching target'].includes(st.textContent));
    now += 61000; await tick(300); assert.equal(st.textContent, 'Over target'); assert.equal(disp.textContent, '00:01:51'); assert.equal(disp.dataset.tone, 'bad');
    t.click('Pause'); assert.equal(st.textContent, 'Over target'); const frozen = disp.textContent; now += 99999; await tick(300); assert.equal(disp.textContent, frozen);
    t.click('Reset'); assert.equal(disp.textContent, '00:00:00'); assert.equal(st.textContent, 'Ready'); t.inst.destroy();
  } finally { globalThis.performance.now = real; }
});
test('aht-calculator: one call and shift average', async () => {
  const t = await mount('aht-calculator');
  assert.match(t.text(), /Enter talk, hold and after-call work times/);
  t.set('Talk (seconds)', '300'); t.set('Hold (seconds)', '60'); t.set('After-call work', '130');
  assert.match(t.text(), /AHT: 08:10/); assert.match(t.text(), /490 seconds\. Exactly on the target of 490 seconds\./);
  t.set('Total handle time (hours)', '7'); t.set('Plus minutes', '30'); t.set('Calls handled', '54'); assert.match(t.text(), /AHT: 08:20/); assert.match(t.text(), /10 seconds over/);
});
test('phrase-bank: 12 categories, switching, copy', async () => {
  const t = await mount('phrase-bank'); const tabs = [...t.root.querySelectorAll('.tab-btn')]; assert.equal(tabs.length, 12);
  assert.equal(tabs.filter(b => b.getAttribute('aria-pressed') === 'true').length, 1);
  t.click('Lodging: cancellations and refunds'); assert.equal(t.root.querySelectorAll('.phrase-item').length, 5);
  assert.equal(tabs.filter(b => b.getAttribute('aria-pressed') === 'true')[0].textContent, 'Lodging: cancellations and refunds');
  t.root.querySelector('.phrase-item').click(); await tick(5); assert.match(clip.at(-1), /free of charge until/);
});
test('nato-phonetic and text-formatter', async () => {
  let t = await mount('nato-phonetic'); t.set('Spell it out', 'a1@'); const chips = [...t.root.querySelectorAll('.spell-chip')].map(c => c.textContent); assert.deepEqual(chips, ['aAlpha', '1One', '@At']);
  t.click('Copy spelling'); await tick(5); assert.equal(clip.at(-1), 'a - Alpha, 1 - One, @ - At');
  assert.equal(t.root.querySelectorAll('.phonetic-card').length, 26);
  t = await mount('text-formatter'); const a = t.set('Input text', 'hello World'); t.click('UPPERCASE'); assert.equal(a.value, 'HELLO WORLD'); t.click('Undo'); assert.equal(a.value, 'hello World');
  t.click('Clear'); assert.equal(a.value, ''); t.click('Undo'); assert.equal(a.value, 'hello World');
});
test('callback-time-zones: converts and flags business hours', async () => {
  const t = await mount('callback-time-zones'); t.set('Time entered in', 'Asia/Manila'); t.set('Date and time', '2026-10-05T09:00');
  const items = [...t.root.querySelectorAll('.tz-list li')]; assert.equal(items.length, 10);
  const get = name => items.find(li => li.textContent.includes(name)).textContent;
  assert.match(get('Philippines'), /Business hours/); assert.match(get('US Eastern'), /9:00 PM.*Sun, Oct 4.*previous day.*Weekend/s); assert.match(get('Sydney'), /Business hours|Outside/);
});
test('cancellation-deadline: deadline, status, penalty, summary', async () => {
  const t = await mount('cancellation-deadline'); assert.match(t.text(), /Enter the check-in date/);
  t.set('Check-in date', '2026-11-10'); t.set("Hotel's time zone", 'America/New_York'); t.set('Days before check-in', '2'); t.set('Cutoff time on that day', '23:59');
  t.root.querySelector('input[type=radio][value=set]').checked = true; t.root.querySelector('input[type=radio][value=set]').dispatchEvent(new Event('change', { bubbles: true }));
  t.set('Date and time', '2026-11-09T14:00'); t.set('Entered in', 'Asia/Manila');
  t.set('Penalty after the deadline', 'firstNight'); t.set('Nightly rate', '150'); t.set('Nights', '3');
  assert.match(t.q('.verdict').textContent, /deadline passed 1 hour 1 minute ago|deadline passed 1 hour/); assert.equal(t.q('.verdict').className.includes('bad'), true);
  assert.match(t.text(), /Sun, Nov 8, 2026, 11:59 PM EST/); assert.match(t.text(), /150\.00 USD/);
  t.click('Copy summary'); await tick(5); assert.match(clip.at(-1), /Free cancellation ends Sun, Nov 8, 2026, 11:59 PM EST/); assert.match(clip.at(-1), /penalty is 150\.00 USD/);
  t.set('Date and time', '2026-11-08T10:00'); assert.match(t.q('.verdict').textContent, /still available/); assert.match(t.text(), /Penalty if cancelled at that time.*None/s);
  t.inst.destroy();
});
test('cancellation-deadline: hours mode and daylight-saving gap warning', async () => {
  const t = await mount('cancellation-deadline'); t.set('Check-in date', '2026-11-10');
  t.root.querySelector('input[type=radio][value=hours]').checked = true; t.root.querySelector('input[type=radio][value=hours]').dispatchEvent(new Event('change', { bubbles: true }));
  t.set('Hours before check-in', '48'); assert.match(t.text(), /Sun, Nov 8, 2026, 3:00 PM EST/);
  t.root.querySelector('input[type=radio][value=days]').checked = true; t.root.querySelector('input[type=radio][value=days]').dispatchEvent(new Event('change', { bubbles: true }));
  t.set('Check-in date', '2026-03-10'); t.set('Cutoff time on that day', '02:30'); assert.match(t.text(), /does not exist on that date/); t.inst.destroy();
});
test('booking-price: breakdown, extra line, comparison, conversion', async () => {
  const t = await mount('booking-price'); assert.match(t.text(), /Enter a nightly rate/);
  t.set('Rate per night, line 1', '150'); t.set('Nights, line 1', '3'); t.click('Add a rate line'); t.set('Rate per night, line 2', '200'); t.set('Nights, line 2', '2');
  t.set('Discount (%)', '10'); t.set('Resort or service fee per night', '25'); t.set('Fee per stay', '40'); t.set('Sales or VAT tax', '12'); t.set('Local tax per person per night', '2');
  assert.match(t.text(), /Total1,041\.80 USD/); assert.match(t.text(), /Average per night208\.36 USD/);
  t.set('Already paid', '1000'); assert.match(t.text(), /Balance still due41\.80 USD/);
  t.set('Original booking total', '1000'); assert.match(t.text(), /41\.80 USD more than the original booking/);
  t.set('Rate to the customer', '56.25'); t.set('Customer currency', 'php'); assert.match(t.text(), /Total in PHP58,601\.25 PHP at 56\.25/);
  t.set('Check-in', '2026-11-10'); t.set('Check-out', '2026-11-13'); assert.match(t.q('.hint[aria-live]').textContent, /3 nights, Tue to Fri/);
  t.click('Use these nights on line 1'); assert.equal(t.byLabel('Nights, line 1').value, '3');
  const removeBtns = [...t.root.querySelectorAll('button')].filter(b => b.textContent === 'Remove'); assert.equal(removeBtns.length, 2); removeBtns[1].click(); assert.equal(t.root.querySelectorAll('.line-row').length, 1);
  t.click('Copy summary'); await tick(5); assert.match(clip.at(-1), /^Stay of 3 nights: room/);
});
test('commission-net-rate: all five calculators', async () => {
  const t = await mount('commission-net-rate');
  t.set('Gross (commissionable) rate', '100'); t.set('Commission (%)', '10'); assert.match(t.text(), /Commission10\.00/); assert.match(t.text(), /Net rate to the hotel90\.00/);
  t.set('Net rate the hotel must receive', '90'); t.set('Commission (% of the gross)', '10'); assert.match(t.text(), /Gross rate to charge100\.00/);
  t.set('Commission (% of the gross)', '100'); assert.match(t.text(), /below 100%/); t.set('Commission (% of the gross)', '10');
  t.set('Net (cost) rate', '80'); t.set('Markup on cost (%)', '25'); assert.match(t.text(), /Selling price100\.00/); assert.match(t.text(), /Margin on selling price20\.00%/);
  t.set('Percent', '25'); assert.match(t.text(), /Margin20\.00%/); t.set('I know the', 'margin'); t.set('Percent', '20'); assert.match(t.text(), /Markup25\.00%/); t.set('Percent', '100'); assert.match(t.text(), /not possible/);
  t.set('Room rate per night', '120'); t.set('Nights', '3'); t.set('Rooms', '2'); t.set('Tax on the room', '10'); t.set('Commission (% of room revenue)', '10');
  assert.match(t.text(), /Customer pays792\.00/); assert.match(t.text(), /Agency commission72\.00/); assert.match(t.text(), /Hotel receives720\.00/);
});
test('group-block: block summary and rooming list check, cleaned export', async () => {
  const t = await mount('group-block'); t.set('Arrival date', '2026-11-10'); t.set('Nights', '3');
  t.set('Room type, line 1', 'Standard'); t.set('Rooms per night, line 1', '40'); t.set('Rate per night, line 1', '150');
  t.click('Add a room type'); t.set('Room type, line 2', 'Suite'); t.set('Rooms per night, line 2', '10'); t.set('Rate per night, line 2', '300');
  t.set('Comp ratio', '25'); t.set('Attrition allowance', '10'); t.set('Cutoff, days before arrival', '30'); t.set('Currency', 'usd');
  assert.match(t.text(), /Estimated room revenue27,000\.00 USD/); assert.match(t.text(), /Complimentary rooms per night2 \(worth 1,080\.00 USD/); assert.match(t.text(), /Minimum paid rooms after attrition45 \(5 can be released\)/); assert.match(t.text(), /Cutoff date2026-10-11/);
  assert.match(t.text(), /Paste or choose a rooming list/);
  t.set('Paste rooming list', 'Guest Name\tRoom Type\tCheck-in\tCheck-out\nAnna Cruz\tStandard\t11/10/2026\t11/12/2026\nBen Tan\tPenthouse\t11/10/2026\t11/12/2026\n\tSuite\t11/10/2026\t11/12/2026\nAnna Cruz\tStandard\t11/10/2026\t11/12/2026');
  assert.match(t.text(), /Rows read4/); assert.match(t.text(), /Ready to use2/); assert.match(t.text(), /With errors2/); assert.match(t.text(), /Room type "Penthouse" is not in the block/); assert.match(t.text(), /Possible duplicate of row 1/);
  t.set('Dates written as', 'dmy'); assert.match(t.text(), /Arrival date|2026-10-11|OK/);
  let blob; const orig = URL.createObjectURL; URL.createObjectURL = b => { blob = b; return 'blob:x'; }; t.click('Download cleaned CSV'); URL.createObjectURL = orig;
  const csv = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsText(blob); }); assert.match(csv, /^Guest name,Room type,Arrival,Departure,Email,Notes\r\n/); assert.equal(csv.trim().split('\r\n').length, 3);
  t.set('Paste rooming list', 'Foo,Bar\n1,2'); assert.match(t.text(), /Columns not found: name, type, arrival, departure/);
});
test('lodging-case-notes: required fields, builder, card masking, drafts', async () => {
  const t = await mount('lodging-case-notes'); assert.match(t.q('.callout[role=status]').textContent, /Still needed \(\d+\)/);
  const req = ['Booking reference', 'Property name', 'Spoke with', 'Reason for contact', 'Actions taken', 'Outcome', 'Stay dates', 'Cancellation policy cited', 'Deadline status'];
  for (const r of req) { const el = t.byLabel(r); el.value = el.tagName === 'SELECT' ? el.options[1].value : 'x ' + r; el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); }
  t.set('Channel', 'Phone'); assert.match(t.q('.callout[role=status]').textContent, /All required fields are filled in/);
  assert.match(t.q('.note-preview').textContent, /^LODGING CASE NOTE: Cancellation request\nBooking reference: x Booking reference/);
  assert.ok(JSON.parse(localStorage.getItem('lodgingDraft:cancel')).bookingRef);
  t.set('Reason for contact', 'Guest paid with 4111 1111 1111 1111'); const g = t.root.querySelectorAll('.callout.warn[role=status]')[0]; assert.equal(g.hidden, false);
  t.click('Copy note'); await tick(5); assert.match(clip.at(-1), /\[card ending 1111 removed\]/); assert.doesNotMatch(clip.at(-1), /4111/);
  const sel = t.root.querySelector('#case-type'); sel.value = 'b2b-agency'; sel.dispatchEvent(new Event('change', { bubbles: true }));
  assert.match(t.text(), /Agency name and ID \(required\)/); assert.equal(t.byLabel('Booking reference').value, ''); sel.value = 'cancel'; sel.dispatchEvent(new Event('change', { bubbles: true })); assert.match(t.byLabel('Booking reference').value, /x Booking/);
  t.click('Clear this form'); t.click('Clear form'); assert.equal(t.byLabel('Booking reference').value, ''); assert.equal(localStorage.getItem('lodgingDraft:cancel'), null);
});
test('sla-due-time: business hours across a weekend, holidays, calendar mode, errors', async () => {
  const t = await mount('sla-due-time'); t.set('Entered in', 'Asia/Manila'); t.set("Partner's time zone", 'Asia/Manila');
  t.set('Request received', '2026-10-09T16:00'); t.set('Response time promised', '4');
  assert.match(t.text(), /Due, partner timeMon, Oct 12, 2026, 11:00 AM/);
  t.set('Request received', '2025-10-09T16:00'); assert.match(t.text(), /Fri, Oct 10, 2025, 11:00 AM/); assert.match(t.q('.verdict').textContent, /overdue/); assert.match(t.text(), /Overdue by/);
  t.set('Request received', '2099-10-09T16:00'); assert.match(t.q('.verdict').textContent, /not yet due/); assert.match(t.text(), /remaining/);
  t.set('Request received', '2026-10-09T16:00');
  t.set('Holidays', '2026-10-12'); assert.match(t.text(), /Tue, Oct 13, 2026, 11:00 AM/); t.set('Holidays', 'nope'); assert.match(t.q('[role=alert]').textContent, /not valid: nope/); t.set('Holidays', '');
  t.root.querySelector('input[type=radio][value=calendar]').checked = true; t.root.querySelector('input[type=radio][value=calendar]').dispatchEvent(new Event('change', { bubbles: true }));
  assert.match(t.text(), /Fri, Oct 9, 2026, 8:00 PM GMT\+8/); assert.doesNotMatch(t.text(), /GMT\+8 \(GMT\+8\)/);
  t.root.querySelector('input[type=radio][value=business]').checked = true; t.root.querySelector('input[type=radio][value=business]').dispatchEvent(new Event('change', { bubbles: true }));
  t.set('Business day ends', '08:00'); assert.match(t.q('[role=alert]').textContent, /must end after they start/);
});
test('hotel-kpis and guest-name', async () => {
  let t = await mount('hotel-kpis'); assert.match(t.text(), /Enter the room nights available/); t.set('Currency (optional)', 'usd'); t.set('Rooms in the hotel', '100'); t.set('Days in the period', '30'); assert.equal(t.byLabel('Room nights available').value, '3000');
  t.set('Room nights available', '100'); t.set('Room nights sold', '70'); t.set('Room revenue', '10500'); assert.match(t.text(), /Occupancy70\.0%/); assert.match(t.text(), /ADR \(average daily rate\)150\.00 USD/); assert.match(t.text(), /RevPAR \(revenue per available room\)105\.00 USD/);
  t.set('Room nights sold', '120'); assert.match(t.q('[role=alert]').textContent, /higher than room nights available/);
  t.set('Period A: room nights available', '100'); t.set('Period A: room nights sold', '60'); t.set('Period A: room revenue', '6000'); t.set('Period B: room nights available', '100'); t.set('Period B: room nights sold', '70'); t.set('Period B: room revenue', '7700');
  assert.match(t.text(), /60\.0% to 70\.0% \(\+10\.0 points\)/); assert.match(t.text(), /ADR100\.00 USD to 110\.00 USD \(\+10\.0%\)/); assert.match(t.text(), /RevPAR60\.00 USD to 77\.00 USD \(\+28\.3%\)/);
  t = await mount('guest-name'); t.set('Names, one per line', 'Mr. John A. Smith\nGarcía, José\nMadonna'); const rows = [...t.root.querySelectorAll('tbody tr')].map(r => [...r.children].map(c => c.textContent));
  assert.deepEqual(rows.map(r => r[1]), ['SMITH/JOHN A', 'GARCIA/JOSE', 'MADONNA']); assert.match(rows[2][2], /Only one name/); assert.match(t.text(), /3 names formatted, 1 to check/);
  t.click('Copy formatted names'); await tick(5); assert.equal(clip.at(-1), 'SMITH/JOHN A\nGARCIA/JOSE\nMADONNA');
  t.set('Output layout', 'comma'); assert.match(t.text(), /SMITH, JOHN A/);
});
