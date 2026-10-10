import { h, field, btn, intro, zoneOptions } from '../ui.js';
import { CALLBACK_ZONES, zoneParts, wallToUtc, parseLocalInput, fmtTime, fmtDate, pad2, weekdayOf } from '../lib/tz.js';

export default {
  id: 'callback-time-zones',
  mount(root) {
    const source = field({ label: 'Time entered in', type: 'select', options: zoneOptions(CALLBACK_ZONES), value: 'Asia/Manila' });
    const when = field({ label: 'Date and time', type: 'datetime-local' });
    const list = h('ul', { class: 'tz-list', 'aria-live': 'polite' });
    const toInput = p => `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
    function render() {
      list.replaceChildren();
      const w = parseLocalInput(when.input.value);
      if (!w) { list.append(h('li', null, 'Pick a date and time to see the conversion.')); return; }
      const instant = wallToUtc(w, source.input.value).date, src = zoneParts(instant, source.input.value);
      const srcDay = Date.UTC(src.year, src.month - 1, src.day);
      for (const [id, label] of CALLBACK_ZONES) {
        const p = zoneParts(instant, id), diff = Math.round((Date.UTC(p.year, p.month - 1, p.day) - srcDay) / 864e5);
        const wd = weekdayOf(p.year, p.month, p.day), weekend = wd === 0 || wd === 6, open = !weekend && p.hour >= 9 && p.hour < 18;
        list.append(h('li', null, h('div', { class: 'tz-name' }, label), h('div', { class: 'tz-time' }, fmtTime(instant, id)),
          h('div', null, fmtDate(instant, id) + (diff === 0 ? '' : diff > 0 ? ' (next day)' : ' (previous day)')),
          h('div', { class: 'tz-flag ' + (open ? 'open' : 'closed') }, h('i', { 'aria-hidden': 'true' }), h('span', null, weekend ? 'Weekend' : open ? 'Business hours' : 'Outside 9 to 6'))));
      }
    }
    const setNow = () => { when.input.value = toInput(zoneParts(new Date(), source.input.value)); render(); };
    when.input.addEventListener('input', render); source.input.addEventListener('change', render);
    root.append(intro('Enter a date and time in one zone to see the same moment elsewhere, and whether it falls in typical business hours (9:00 AM to 6:00 PM on a weekday). Confirm the customer\'s own time zone before you promise a callback.'),
      h('div', { class: 'tz-controls' }, source.wrap, when.wrap, btn('Use current time', setNow, 'primary', { id: 'tzNow' })), list);
    setNow();
  }
};
