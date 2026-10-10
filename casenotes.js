/* casenotes.js - structured case notes for lodging work, guest (B2C) and B2B. Field schema, builder and completeness check. */
import { findSensitive } from './pii.js';

const f = (id, label, o = {}) => ({ id, label, type: 'text', required: false, ...o });
const area = (id, label, o = {}) => f(id, label, { type: 'textarea', rows: 2, ...o });
const pick = (id, label, options, o = {}) => f(id, label, { type: 'select', options, ...o });

export const HEAD = [
  f('bookingRef', 'Booking reference', { required: true, hint: 'Itinerary or confirmation number. Never a card number.' }),
  f('property', 'Property name', { required: true }),
  f('contactWho', 'Spoke with (role or first name)', { required: true }),
  pick('channel', 'Channel', ['Phone', 'Chat', 'Email', 'Partner portal'], { required: true })
];
export const TAIL = [
  area('summary', 'Reason for contact', { required: true }),
  area('actions', 'Actions taken', { required: true, rows: 3 }),
  area('outcome', 'Outcome', { required: true }),
  area('followUp', 'Follow-up needed (owner and date)')
];

export const CASE_TYPES = [
  { id: 'cancel', group: 'Guest (B2C)', label: 'Cancellation request', fields: [
    f('stayDates', 'Stay dates', { required: true, hint: 'Check-in to check-out as the property sees them.' }),
    area('policy', 'Cancellation policy cited', { required: true, hint: 'Include the deadline in property local time.' }),
    pick('deadline', 'Deadline status', ['Within the free cancellation window', 'After the deadline', 'Non-refundable rate', 'Exception requested'], { required: true }),
    f('penalty', 'Penalty or fee applied'), f('refund', 'Refund amount and method'), f('guestReason', 'Guest reason, if shared')] },
  { id: 'modify', group: 'Guest (B2C)', label: 'Modification (dates, room, name)', fields: [
    f('original', 'Original stay', { required: true }), f('requested', 'Requested change', { required: true }),
    f('availability', 'Availability confirmed by (property contact)'), f('rateDiff', 'Rate difference'), f('changeFee', 'Change fee')] },
  { id: 'noshow', group: 'Guest (B2C)', label: 'No-show or late arrival', fields: [
    f('expected', 'Expected arrival', { required: true }), area('propertyReport', 'What the property reports', { required: true }),
    area('evidence', 'Evidence (call times, messages, check-in log)'), f('chargeApplied', 'Charge applied'), pick('dispute', 'Dispute status', ['No dispute', 'Guest disputes the charge', 'Under review with property'])] },
  { id: 'refund', group: 'Guest (B2C)', label: 'Refund inquiry', fields: [
    f('chargeType', 'Charge in question', { required: true }), f('amountPaid', 'Amount paid'), f('amountDisputed', 'Amount in question', { required: true }),
    f('cardLast4', 'Card, last four digits only', { hint: 'Last four digits only. Never the full number or the security code.' }), f('timeline', 'Refund timeline given')] },
  { id: 'overbook', group: 'Guest (B2C)', label: 'Overbooking or relocation', fields: [
    f('guests', 'Guests affected', { required: true }), f('relocation', 'Relocation property and room type'), area('compensation', 'Compensation offered by the property'),
    f('transport', 'Transport arranged'), pick('agreed', 'Guest response', ['Accepted', 'Declined', 'Undecided'])] },
  { id: 'complaint', group: 'Guest (B2C)', label: 'Property complaint', fields: [
    pick('issue', 'Issue', ['Cleanliness', 'Noise', 'Room not as described', 'Facilities unavailable', 'Staff conduct', 'Safety', 'Other'], { required: true }),
    area('details', 'What the guest reports', { required: true }), f('evidence', 'Photos or evidence received'), area('propertyResponse', 'Property response'), f('compensation', 'Compensation or goodwill offered')] },
  { id: 'billing', group: 'Guest (B2C)', label: 'Charge or fee dispute', fields: [
    f('charge', 'Charge description', { required: true }), f('amount', 'Amount', { required: true }),
    pick('disclosed', 'Fee disclosed at booking?', ['Yes', 'No', 'Unclear'], { required: true }), area('resolution', 'Resolution agreed')] },
  { id: 'special', group: 'Guest (B2C)', label: 'Special request', fields: [
    pick('requestType', 'Request', ['Early check-in', 'Late check-out', 'Bed type', 'Accessibility', 'Celebration', 'Other'], { required: true }),
    area('requestDetails', 'Details', { required: true }), f('propertyConfirm', 'Property confirmation (name and time)'), pick('guaranteed', 'Guaranteed?', ['Guaranteed', 'Subject to availability', 'Not confirmed'])] },
  { id: 'b2b-property', group: 'B2B', label: 'Property call (verification)', fields: [
    pick('purpose', 'Purpose of the call', ['Verify reservation', 'Confirm rate and inclusions', 'Special request', 'Payment or virtual card', 'Inventory or availability'], { required: true }),
    f('propertyConf', "Property's confirmation number"), f('propertyContact', 'Property contact and time of call', { required: true }),
    area('confirmed', 'What was confirmed', { required: true }), f('paymentNote', 'Payment instruction (no card numbers)')] },
  { id: 'b2b-agency', group: 'B2B', label: 'Travel agency query', fields: [
    f('agency', 'Agency name and ID', { required: true }),
    pick('queryType', 'Query', ['Commission', 'Net rate', 'Invoice or payment', 'Booking amendment', 'Other'], { required: true }),
    f('ratePlan', 'Rate plan or code'), f('commissionPct', 'Commission terms on file'), area('resolution', 'Resolution given')] },
  { id: 'b2b-supplier', group: 'B2B', label: 'Supplier or property escalation', fields: [
    f('supplier', 'Supplier or property', { required: true }),
    pick('mismatch', 'Mismatch type', ['Rate', 'Inventory', 'Policy', 'Content', 'Payment'], { required: true }),
    f('expected', 'Expected', { required: true }), f('actual', 'Actual', { required: true }), f('ticket', 'Ticket reference'), f('slaDue', 'Response due (with time zone)')] },
  { id: 'b2b-group', group: 'B2B', label: 'Group request', fields: [
    f('groupName', 'Group or event name', { required: true }), f('blockSize', 'Rooms and nights requested', { required: true }),
    f('dates', 'Dates', { required: true }), f('cutoff', 'Cutoff or release date'), f('compAttrition', 'Comp ratio and attrition terms'),
    pick('contractStatus', 'Contract status', ['Enquiry', 'Rates requested', 'Contract sent', 'Signed', 'Rooming list due'])] }
];

export const caseType = id => CASE_TYPES.find(t => t.id === id);
export const fieldsFor = id => { const t = caseType(id); return t ? [...HEAD, ...t.fields, ...TAIL] : []; };

export function missingRequired(id, values) {
  return fieldsFor(id).filter(fl => fl.required && !String(values[fl.id] || '').trim()).map(fl => fl.label);
}

export function buildNote(id, values, { loggedAt } = {}) {
  const t = caseType(id);
  if (!t) return '';
  const lines = [`LODGING CASE NOTE: ${t.label}`];
  if (loggedAt) lines.push(`Logged: ${loggedAt}`);
  for (const fl of fieldsFor(id)) {
    const v = String(values[fl.id] || '').trim();
    if (!v) continue;
    if (v.includes('\n')) lines.push(`${fl.label}:`, ...v.split('\n').map(l => '  ' + l));
    else lines.push(`${fl.label}: ${v}`);
  }
  return lines.join('\n');
}

/** Scan every field for card numbers, security codes, ID numbers and passwords. */
export function scanValues(values) {
  const hits = [];
  for (const [k, v] of Object.entries(values)) for (const h of findSensitive(String(v || ''))) hits.push({ field: k, ...h });
  return hits;
}
