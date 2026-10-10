/* commission.js - B2B rate maths: commission, net rates, markup versus margin. Money in cents. */
import { toCents, roundHalfUp } from './money.js';

const pct = x => Math.max(0, Number(x) || 0);

/** Commission is a percentage of the gross (commissionable) amount. */
export function grossToNet(gross, commissionPct) {
  const g = toCents(gross), commission = roundHalfUp(g * pct(commissionPct) / 100);
  return { gross: g, commission, net: g - commission };
}
/** Gross needed so that, after commissionPct of gross, the hotel nets the given amount. */
export function netToGross(net, commissionPct) {
  const c = pct(commissionPct);
  if (c >= 100) return { error: 'Commission must be below 100%' };
  const n = toCents(net), gross = roundHalfUp(n / (1 - c / 100));
  return { net: n, gross, commission: gross - n };
}
export const markupToMargin = m => { m = pct(m); return (m / (100 + m)) * 100; };
export function marginToMarkup(mg) {
  mg = pct(mg);
  return mg >= 100 ? null : (mg / (100 - mg)) * 100;
}
/** Sell price from a net rate and a markup percentage on cost. */
export function netToSell(net, markupPct) {
  const n = toCents(net), sell = roundHalfUp(n * (1 + pct(markupPct) / 100)), profit = sell - n;
  return { net: n, sell, profit, marginPct: sell ? (profit / sell) * 100 : 0 };
}
/**
 * One stay on a commissionable rate. Taxes pass through and are not commissionable.
 * The customer pays room revenue plus taxes; the agency keeps commission; the hotel receives room revenue less commission plus taxes.
 */
export function stayCommission({ nightlyRoom, nights, rooms, taxPct, commissionPct }) {
  const n = Math.max(0, Math.floor(Number(nights) || 0)), r = Math.max(0, Math.floor(Number(rooms) || 0));
  const roomRevenue = toCents(nightlyRoom) * n * r;
  const taxes = roundHalfUp(roomRevenue * pct(taxPct) / 100);
  const commission = roundHalfUp(roomRevenue * pct(commissionPct) / 100);
  return { roomRevenue, taxes, commission, customerTotal: roomRevenue + taxes, netToHotel: roomRevenue - commission + taxes, roomNights: n * r };
}
