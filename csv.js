/* csv.js - RFC 4180 style parser and serialiser. Handles quotes, escaped quotes, embedded newlines, BOM, CRLF, and comma, tab or semicolon delimiters.
   Everything runs in the browser; nothing is uploaded. */
export function detectDelimiter(text) {
  const first = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).find(l => l.trim()) || '';
  const counts = { ',': 0, '\t': 0, ';': 0 };
  let inQuotes = false;
  for (const ch of first) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes && ch in counts) counts[ch]++;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : ',';
}

export function parseDelimited(text, delimiter) {
  const src = text.replace(/^\uFEFF/, '');
  const d = delimiter || detectDelimiter(src);
  const rows = [];
  let row = [], field = '', inQuotes = false, i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"' && field === '') { inQuotes = true; i++; continue; }
    if (ch === d) { row.push(field); field = ''; i++; continue; }
    if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = ''; i++; continue;
    }
    field += ch; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

/** First row is the header. Returns records keyed by the header text. */
export function parseTable(text, delimiter) {
  const d = delimiter || detectDelimiter(text);
  const rows = parseDelimited(text, d);
  if (!rows.length) return { delimiter: d, headers: [], records: [] };
  const headers = rows[0].map(h => h.trim());
  const records = rows.slice(1).map(r => {
    const rec = {};
    headers.forEach((h, idx) => { rec[h] = (r[idx] || '').trim(); });
    return rec;
  });
  return { delimiter: d, headers, records };
}

/** Serialise rows. With safe=true, cells that a spreadsheet could read as a formula get a leading apostrophe. */
export function toCsv(rows, { safe = true, delimiter = ',' } = {}) {
  const cell = v => {
    let s = v === null || v === undefined ? '' : String(v);
    if (safe && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /["\n\r]/.test(s) || s.includes(delimiter) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return rows.map(r => r.map(cell).join(delimiter)).join('\r\n') + '\r\n';
}
