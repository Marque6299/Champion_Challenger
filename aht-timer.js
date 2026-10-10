import { h, field, btn, store } from '../ui.js';
import { hhmmss } from '../lib/text.js';
import { parseTarget, timerState, DEFAULT_TARGET } from '../lib/aht.js';

export default {
  id: 'aht-timer',
  mount(root) {
    const target = field({ label: 'Target handling threshold (seconds)', type: 'number', min: 30, max: 7200, step: 10, inputmode: 'numeric', value: store.get('ahtTarget', String(DEFAULT_TARGET)) });
    const display = h('div', { class: 'timer-display', role: 'timer', 'aria-label': 'Elapsed time' }, '00:00:00');
    const status = h('div', { class: 'timer-status', role: 'status' }, 'Ready');
    let elapsed = 0, startedAt = null, interval = null;
    const seconds = () => elapsed + (startedAt !== null ? (performance.now() - startedAt) / 1000 : 0);
    function update() {
      const total = Math.floor(seconds()), st = timerState(total, parseTarget(target.input.value), startedAt !== null);
      display.textContent = hhmmss(total);
      display.dataset.tone = st.tone;
      if (status.textContent !== st.label) status.textContent = st.label;
    }
    const start = () => { if (startedAt !== null) return; startedAt = performance.now(); interval = setInterval(update, 250); update(); };
    const pause = () => { if (startedAt === null) return; elapsed = seconds(); startedAt = null; clearInterval(interval); interval = null; update(); };
    const reset = () => { clearInterval(interval); interval = null; elapsed = 0; startedAt = null; update(); };
    target.input.addEventListener('input', () => { store.set('ahtTarget', String(parseTarget(target.input.value))); update(); });
    root.append(target.wrap, display, status, h('div', { class: 'btn-row' }, btn('Start', start), btn('Pause', pause, 'secondary'), btn('Reset', reset, 'danger')));
    update();
    return { destroy() { clearInterval(interval); } };
  }
};
