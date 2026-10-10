/* pii.js - a safety net for notes. It spots things that should not be written in a notes field and can mask them.
   It is a heuristic: it will miss some cases and may flag some false positives, so it never replaces your account's policy. */
export function luhnValid(digits) {
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return digits.length > 0 && sum % 10 === 0;
}

/** Finds card-like numbers: 13 to 19 digits, optional spaces or dashes, and a valid Luhn check digit. */
export function findSensitive(text) {
  const found = [];
  const t = String(text || '');
  const cardRe = /\d(?:[ -]?\d){12,18}/g;
  let m;
  while ((m = cardRe.exec(t))) {
    const before = t[m.index - 1], after = t[m.index + m[0].length];
    if ((before && /\d/.test(before)) || (after && /\d/.test(after))) continue;
    const digits = m[0].replace(/\D/g, '');
    if (digits.length >= 13 && digits.length <= 19 && luhnValid(digits)) {
      found.push({ kind: 'card', index: m.index, length: m[0].length, label: 'card number', last4: digits.slice(-4) });
    }
  }
  const add = (re, kind, label) => { let x; while ((x = re.exec(t))) found.push({ kind, index: x.index, length: x[0].length, label }); };
  add(/\b(?:cvv2?|cvc2?|cid|security code|card code)\s*[:=#-]?\s*\d{3,4}\b/gi, 'cvv', 'card security code');
  add(/\b\d{3}-\d{2}-\d{4}\b/g, 'ssn', 'national ID number');
  add(/\b(?:password|passcode|pwd|pin)\s*(?:is|:|=)\s*\S+/gi, 'password', 'password or PIN');
  return found.sort((a, b) => a.index - b.index);
}

export function maskSensitive(text) {
  const t = String(text || '');
  const found = findSensitive(t);
  let out = '', pos = 0;
  for (const f of found) {
    if (f.index < pos) continue;
    out += t.slice(pos, f.index);
    out += f.kind === 'card' ? `[card ending ${f.last4} removed]` : `[${f.label} removed]`;
    pos = f.index + f.length;
  }
  return { text: out + t.slice(pos), found };
}
