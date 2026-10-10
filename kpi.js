/* kpi.js - hotel performance metrics. */
export const availableRoomNights = (rooms, days) => Math.max(0, Math.floor(Number(rooms) || 0)) * Math.max(0, Math.floor(Number(days) || 0));
export function hotelKpis({ roomsAvailable, roomsSold, revenue }) {
  const avail = Number(roomsAvailable) || 0, sold = Number(roomsSold) || 0, rev = Number(revenue) || 0;
  return {
    occupancy: avail > 0 ? (sold / avail) * 100 : null,
    adr: sold > 0 ? rev / sold : null,
    revpar: avail > 0 ? rev / avail : null,
    soldExceedsAvailable: sold > avail && avail > 0
  };
}
export const pctChange = (from, to) => (Number(from) ? ((Number(to) - Number(from)) / Math.abs(Number(from))) * 100 : null);
