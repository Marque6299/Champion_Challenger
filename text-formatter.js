import { h, field, btn, toast, copyText } from '../ui.js';
import { formatters, countLabel } from '../lib/text.js';

export default {
  id: 'text-formatter',
  mount(root) {
    const f = field({ label: 'Input text', type: 'textarea', rows: 7, placeholder: 'Paste customer text or notes here...' });
    const area = f.input, count = h('div', { class: 'counts' });
    let prev = null;
    const refresh = () => { count.textContent = countLabel(area.value); };
    const apply = type => { if (!area.value || !formatters[type]) return; prev = area.value; area.value = formatters[type](area.value); refresh(); };
    area.addEventListener('input', refresh);
    root.append(f.wrap, count, h('div', { class: 'btn-row' },
      [['UPPERCASE', 'upper'], ['lowercase', 'lower'], ['Title Case', 'title'], ['Sentence case', 'sentence'], ['Trim spaces', 'trim'], ['Join lines', 'join']].map(([t, k]) => btn(t, () => apply(k))),
      btn('Copy', () => copyText(area.value, 'Text copied'), 'primary'),
      btn('Undo', () => { if (prev === null) { toast('Nothing to undo'); return; } area.value = prev; prev = null; refresh(); }, 'secondary'),
      btn('Clear', () => { prev = area.value || null; area.value = ''; refresh(); }, 'danger')));
    refresh();
  }
};
