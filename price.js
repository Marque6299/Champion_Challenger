/* price.js - booking price breakdown and modification delta. All inputs are plain numbers; all money is integer cents. */
import { toCents, pctOf } from './money.js';

/**
 * @param {object} o
 * @param {{rate:number, nights:number}[]} o.lines          nightly rate lines, e.g. weekday and weekend rates
 * @param {number} [o.discountPct] [o.discountAmt]          discount on the room subtotal
 * @param {number} [o.feePerNight] [o.feePerStay]           resort or cleaning fees
 * @param {boolean} [o.feesTaxable]                         whether the sales tax applies to fees too
 * @param {number} [o.taxPct]                               percentage tax on room (and fees if taxable)
 * @param {number} [o.cityTaxPerPersonNight] [o.persons]    fixed local tax per person per night
 * @param {number} [o.prepaid] [o.penalty] [o.originalTotal]
 */
export function priceBreakdown(o) {
  const lines = (o.lines || []).map(l => ({ rate: toCents(l.rate), nights: Math.max(0, Math.floor(Number(l.nights) || 0)) }));
  const nights = lines.reduce((s, l) => s + l.nights, 0);
  const roomSubtotal = lines.reduce((s, l) => s + l.rate * l.nights, 0);
  const discount = Math.min(roomSubtotal, pctOf(roomSubtotal, o.discountPct) + toCents(o.discountAmt));
  const roomNet = roomSubtotal - discount;
  const fees = toCents(o.feePerNight) * nights + toCents(o.feePerStay);
  const taxBase = roomNet + (o.feesTaxable ? fees : 0);
  const tax = pctOf(taxBase, o.taxPct);
  const persons = Math.max(0, Math.floor(Number(o.persons) || 0));
  const cityTax = toCents(o.cityTaxPerPersonNight) * persons * nights;
  const total = roomNet + fees + tax + cityTax;
  const prepaid = toCents(o.prepaid);
  const penalty = toCents(o.penalty);
  const hasOriginal = o.originalTotal !== undefined && o.originalTotal !== '' && o.originalTotal !== null;
  const original = hasOriginal ? toCents(o.originalTotal) : null;
  return {
    nights, roomSubtotal, discount, roomNet, fees, taxBase, tax, cityTax, total,
    averageNight: nights ? Math.round(total / nights) : 0,
    prepaid,
    balanceDue: Math.max(0, total - prepaid),
    overpaid: Math.max(0, prepaid - total),
    penalty,
    refundOnCancel: Math.max(0, prepaid - penalty),
    owedOnCancel: Math.max(0, penalty - prepaid),
    original,
    delta: original === null ? null : total - original
  };
}
