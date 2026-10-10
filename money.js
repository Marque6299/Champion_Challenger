/* money.js - integer-cents arithmetic so totals never drift. */
export const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'XOF', 'XAF', 'UGX', 'PYG', 'RWF']);

/** Round half away from zero, immune to binary float noise such as 1.005 * 100. */
export function roundHalfUp(x) {
  if (!Number.isFinite(x)) return 0;
  const clean = Number(Math.abs(x).toPrecision(15));
  return Math.sign(x) * Math.round(clean);
}
export function toCents(x) {
  const n = typeof x === 'string' ? parseFloat(x.replace(/,/g, '')) : Number(x);
  return Number.isFinite(n) ? roundHalfUp(n * 100) : 0;
}
export const pctOf = (cents, pct) => roundHalfUp(cents * (Number(pct) || 0) / 100);
export const decimalsFor = currency => (ZERO_DECIMAL.has(String(currency || '').toUpperCase()) ? 0 : 2);

/** Convert a cents amount at a rate (target units per 1 source unit); returns a decimal rounded for the target currency. */
export function convert(cents, rate, currency) {
  const d = decimalsFor(currency), f = 10 ** d;
  return roundHalfUp((cents / 100) * (Number(rate) || 0) * f) / f;
}
export function formatAmount(value, currency) {
  const d = decimalsFor(currency);
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(value);
}
export function formatCents(cents, currency = '') {
  const s = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
  return currency ? `${s} ${currency}` : s;
}
