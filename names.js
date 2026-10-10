/* names.js - normalise guest names for reservation systems. Heuristic: always check the result against the guest's ID. */
const TITLES = new Set(['mr', 'mrs', 'ms', 'miss', 'mx', 'dr', 'prof', 'sir', 'madam', 'mstr', 'master', 'rev', 'hon']);
const SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv']);
const PARTICLES = new Set(['de', 'del', 'della', 'di', 'da', 'dos', 'das', 'do', 'van', 'von', 'der', 'den', 'bin', 'binti', 'ibn', 'al', 'el', 'la', 'le', 'du', 'des', 'st']);
const SPECIAL = { 'ß': 'ss', 'æ': 'ae', 'Æ': 'AE', 'ø': 'o', 'Ø': 'O', 'ł': 'l', 'Ł': 'L', 'đ': 'd', 'Đ': 'D', 'þ': 'th', 'Þ': 'TH', 'œ': 'oe', 'Œ': 'OE', 'ı': 'i' };

export function stripDiacritics(s) {
  return s.replace(/[ßæÆøØłŁđĐþÞœŒı]/g, c => SPECIAL[c]).normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
}
const clean = t => t.replace(/\./g, '');
const isTitle = t => TITLES.has(clean(t).toLowerCase());
const isSuffix = t => SUFFIXES.has(clean(t).toLowerCase());

/**
 * opts: { format: 'slash' (SURNAME/GIVEN) | 'given-first' | 'comma', upper, stripAccents, dropTitles, dropSuffix, keepHyphen, keepApostrophe }
 * Returns { output, surname, given, warnings }.
 */
export function normalizeName(raw, opts = {}) {
  const o = { format: 'slash', upper: true, stripAccents: true, dropTitles: true, dropSuffix: true, keepHyphen: true, keepApostrophe: true, ...opts };
  const warnings = [];
  let text = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!text) return { output: '', surname: '', given: '', warnings: [] };
  let surname = '', given = '';
  const split = s => s.split(' ').filter(Boolean);
  const strip = tokens => tokens.filter(t => !(o.dropTitles && isTitle(t)) && !(o.dropSuffix && isSuffix(t)));

  if (text.includes('/') && !text.includes(',')) {
    const [s, ...g] = text.split('/');
    surname = strip(split(s)).join(' ');
    given = strip(split(g.join(' '))).join(' ');
  } else if (text.includes(',')) {
    const [s, ...g] = text.split(',');
    surname = strip(split(s)).join(' ');
    given = strip(split(g.join(' '))).join(' ');
  } else {
    const tokens = strip(split(text));
    if (tokens.length === 1) { surname = tokens[0]; warnings.push('Only one name was found, so there is no given name. Check the booking.'); }
    else if (tokens.length > 1) {
      let i = tokens.length - 1;
      while (i > 1 && PARTICLES.has(clean(tokens[i - 1]).toLowerCase())) i--;
      surname = tokens.slice(i).join(' ');
      given = tokens.slice(0, i).join(' ');
      if (tokens.length > 3) warnings.push('Several names found. Check where the surname starts, especially for double surnames.');
    }
  }
  const fix = s => {
    let t = clean(s);
    if (o.stripAccents) t = stripDiacritics(t);
    if (!o.keepApostrophe) t = t.replace(/['’`´]/g, '');
    if (!o.keepHyphen) t = t.replace(/-/g, ' ');
    t = t.replace(/\s+/g, ' ').trim();
    return o.upper ? t.toUpperCase() : t;
  };
  surname = fix(surname); given = fix(given);
  if (/\d/.test(surname + given)) warnings.push('The name contains digits.');
  if (/[^\u0000-\u024f\s'’`´.\-]/.test(surname + given)) warnings.push('The name contains non-Latin characters. Use the spelling on the guest ID.');
  if ((surname + given).length > 50) warnings.push('The name is longer than 50 characters. Some systems truncate names.');
  let output;
  if (!given) output = surname;
  else if (o.format === 'given-first') output = `${given} ${surname}`;
  else if (o.format === 'comma') output = `${surname}, ${given}`;
  else output = `${surname}/${given}`;
  return { output, surname, given, warnings };
}
