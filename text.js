/* text.js - formatters and small helpers carried over from the original Text Formatter and Scratchpad. */
export const padTwo = n => String(n).padStart(2, '0');
export const mmss = s => { s = Math.max(0, Math.floor(s)); return padTwo(Math.floor(s / 60)) + ':' + padTwo(s % 60); };
export const hhmmss = total => { total = Math.max(0, Math.floor(total)); return padTwo(Math.floor(total / 3600)) + ':' + padTwo(Math.floor((total % 3600) / 60)) + ':' + padTwo(total % 60); };
export const countLabel = t => (t.trim() ? t.trim().split(/\s+/).length : 0) + ' words, ' + t.length + ' characters';

export const formatters = {
  upper: t => t.toUpperCase(),
  lower: t => t.toLowerCase(),
  title: t => t.toLowerCase().replace(/(^|[\s\-(/])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()),
  sentence: t => t.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (m, a, b) => a + b.toUpperCase()),
  trim: t => t.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim(),
  join: t => t.replace(/\s*\n+\s*/g, ' ').trim()
};

export const NOTE_TEMPLATES = {
  standard: 'Reason for contact:\nVerified by:\nIssue details:\nActions taken:\nResolution:\nFollow-up needed:\n',
  callback: 'Callback requested for:\nBest number or channel:\nCustomer time zone:\nTopic:\nNotes for next agent:\n',
  escalation: 'Escalated to:\nReason for escalation:\nSteps already tried:\nCustomer expectation:\nReference no.:\n'
};
