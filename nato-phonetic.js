import { h, field, btn, copyText, intro } from '../ui.js';
import { NATO, spellWord, spellingText } from '../lib/phonetic.js';

export default {
  id: 'nato-phonetic',
  mount(root) {
    const input = field({ label: 'Spell it out', maxlength: 80, autocomplete: 'off', placeholder: 'For example: maria.santos@example.com' });
    const out = h('div', { class: 'spell-out', 'aria-live': 'polite' });
    function render() {
      out.replaceChildren();
      const v = input.input.value;
      if (!v.trim()) { out.append(h('span', { class: 'hint' }, 'Type a name, email address or reference code to see it spelled out.')); return; }
      for (const ch of v) out.append(ch === ' ' ? h('div', { class: 'spell-chip gap' }) : h('div', { class: 'spell-chip' }, h('b', null, ch), h('span', null, spellWord(ch) || '?')));
    }
    input.input.addEventListener('input', render);
    root.append(intro('Standard telephony spelling reference for customer account verification.'), input.wrap, out,
      h('div', { class: 'btn-row' }, btn('Copy spelling', () => copyText(spellingText(input.input.value), 'Spelling copied'))),
      h('hr', { class: 'divider' }), h('div', { class: 'phonetic-grid' }, NATO.map(([l, w]) => h('div', { class: 'phonetic-card' }, h('span', null, l), ' ', h('span', null, w)))));
    render();
  }
};
