/* meta.js - the single source of truth for tools and reports. Read by the browser (workspace, tool pages) and by build.mjs (nav, indexes, sitemap). */
export const GROUPS = [
  { id: 'agent', label: 'Agent tools' },
  { id: 'travel', label: 'Travel and lodging' }
];

/** hash: the deep link used by portal/#hash. The first seven match the original portal exactly. */
export const TOOLS = [
  { id: 'call-scratchpad', hash: 'notes', group: 'agent', title: 'Call Scratchpad', icon: 'note', summary: 'Note templates, word counts and a card-number check. Notes stay in your browser.' },
  { id: 'aht-timer', hash: 'timer', group: 'agent', title: 'AHT Timer', icon: 'timer', summary: 'A stopwatch that compares your call against a handle-time target.' },
  { id: 'aht-calculator', hash: 'ahtcalc', group: 'agent', title: 'AHT Calculator', icon: 'calc', summary: 'Handle time for one call, or your average for a shift.' },
  { id: 'phrase-bank', hash: 'phrases', group: 'agent', title: 'Phrase Bank', icon: 'chat', summary: 'Sixty click-to-copy phrases, including lodging and B2B wording.' },
  { id: 'nato-phonetic', hash: 'phonetic', group: 'agent', title: 'NATO Phonetic Chart', icon: 'abc', summary: 'Spell names, emails and codes the way callers can write them down.' },
  { id: 'text-formatter', hash: 'formatter', group: 'agent', title: 'Text Formatter', icon: 'text', summary: 'Change case, trim spaces and join lines, with undo.' },
  { id: 'callback-time-zones', hash: 'timezones', group: 'agent', title: 'Callback Time Zones', icon: 'globe', summary: 'Convert a callback time and see whether it falls in business hours.' },
  { id: 'cancellation-deadline', nav: 'Cancellation Deadline', hash: 'cancel', group: 'travel', title: 'Cancellation Deadline Checker', icon: 'clock', summary: 'Find the free-cancellation cutoff in the hotel\'s local time and what the penalty is after it.' },
  { id: 'booking-price', nav: 'Booking Price', hash: 'price', group: 'travel', title: 'Booking Price and Change Calculator', icon: 'tag', summary: 'Break a stay into room, fees and taxes, and compare it with the original booking.' },
  { id: 'commission-net-rate', nav: 'Commission and Net Rate', hash: 'commission', group: 'travel', title: 'Commission and Net Rate Calculator', icon: 'percent', summary: 'Gross to net, net to gross, and markup against margin, for agency and partner queries.' },
  { id: 'group-block', nav: 'Group Block', hash: 'group', group: 'travel', title: 'Group Block and Rooming List', icon: 'group', summary: 'Size a room block, then check a pasted or uploaded rooming list in your browser.' },
  { id: 'lodging-case-notes', nav: 'Case Note Builder', hash: 'casenotes', group: 'travel', title: 'Lodging Case Note Builder', icon: 'clipboard', summary: 'Twelve guest and B2B case types with required fields and a sensitive-data check.' },
  { id: 'sla-due-time', nav: 'SLA Due Time', hash: 'sla', group: 'travel', title: 'Partner SLA Due-Time Calculator', icon: 'hourglass', summary: 'Work out when a response is due in calendar or business hours, across time zones.' },
  { id: 'hotel-kpis', nav: 'Hotel KPIs', hash: 'kpis', group: 'travel', title: 'Hotel KPI Calculator', icon: 'chart', summary: 'Occupancy, ADR and RevPAR, and how they change between two periods.' },
  { id: 'guest-name', nav: 'Guest Names', hash: 'names', group: 'travel', title: 'Guest Name Formatter', icon: 'person', summary: 'Format names as SURNAME/GIVEN, remove titles and accents, and flag risky entries.' }
];

/** Report URLs and facts live in site.config.json. The ids and hashes here match the original portal. */
export const REPORT_HASHES = { 'champion-challenger': 'report1', productivity: 'report2', 'get-agent-performance': 'report5' };
