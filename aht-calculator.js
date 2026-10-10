import { h, field, num, store, intro } from '../ui.js';
import { mmss } from '../lib/text.js';
import { parseTarget, compareText, handleSeconds, shiftAverage, DEFAULT_TARGET } from '../lib/aht.js';

export default {
  id: 'aht-calculator',
  mount(root) {
    const target = field({ label: 'Target handling threshold (seconds)', type: 'number', min: 30, max: 7200, step: 10, inputmode: 'numeric', value: store.get('ahtTarget', String(DEFAULT_TARGET)) });
    const mk = (label, extra = {}) => field({ label, type: 'number', min: 0, inputmode: 'numeric', placeholder: '0', ...extra });
    const talk = mk('Talk (seconds)'), hold = mk('Hold (seconds)'), acw = mk('After-call work (seconds)');
    const hours = mk('Total handle time (hours)'), mins = mk('Plus minutes', { max: 59 }), calls = mk('Calls handled');
    const one = h('div', { class: 'result', 'aria-live': 'polite' }), day = h('div', { class: 'result', 'aria-live': 'polite' });
    const show = (el, secs) => { const t = parseTarget(target.input.value); el.replaceChildren('AHT: ', h('strong', null, mmss(secs)), h('div', null, `${Math.round(secs)} seconds. ${compareText(secs, t)}`)); };
    function update() {
      const total = handleSeconds(num(talk.input), num(hold.input), num(acw.input));
      if (total > 0) show(one, total); else one.textContent = 'Enter talk, hold and after-call work times to see the handle time.';
      const avg = shiftAverage(num(hours.input), num(mins.input), num(calls.input));
      if (avg > 0) show(day, avg); else day.textContent = 'Enter your total handle time and the number of calls to see your average.';
    }
    target.input.addEventListener('input', () => { store.set('ahtTarget', String(parseTarget(target.input.value))); update(); });
    [talk, hold, acw, hours, mins, calls].forEach(f => f.input.addEventListener('input', update));
    root.append(intro('Average handle time = (talk + hold + after-call work) ÷ calls. Some teams also count transfer or conference time, so confirm how yours is measured. Results are compared with the target below, which is shared with the AHT Timer.'),
      target.wrap, h('h3', { class: 'calc-title' }, 'One call'), h('div', { class: 'grid-3' }, talk.wrap, hold.wrap, acw.wrap), one,
      h('h3', { class: 'calc-title' }, 'Shift average'), h('div', { class: 'grid-3' }, hours.wrap, mins.wrap, calls.wrap), day);
    update();
  }
};
