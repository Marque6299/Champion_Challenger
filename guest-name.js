import { h, field, check, btn, table, copyText, intro, toast } from '../ui.js';
import { normalizeName } from '../lib/names.js';

export default {
  id: 'guest-name',
  mount(root) {
    const input = field({ label: 'Names, one per line', type: 'textarea', rows: 6, placeholder: 'Mr. John A. Smith\nGarcía, José\nMaria de la Cruz', hint: 'Any of these layouts works: First Last, Last, First, or LAST/FIRST.' });
    const fmt = field({ label: 'Output layout', type: 'select', value: 'slash', options: [['slash', 'SURNAME/GIVEN (reservation style)'], ['given-first', 'GIVEN SURNAME'], ['comma', 'SURNAME, GIVEN']] });
    const opt = { upper: check({ label: 'Capital letters', checked: true }), stripAccents: check({ label: 'Remove accents (é becomes e)', checked: true }), dropTitles: check({ label: 'Remove titles (Mr, Mrs, Dr)', checked: true }), dropSuffix: check({ label: 'Remove Jr, Sr, II, III', checked: true }), keepHyphen: check({ label: 'Keep hyphens', checked: true }), keepApostrophe: check({ label: "Keep apostrophes (O'Brien)", checked: true }) };
    const fs = h('fieldset', { class: 'fieldset' }, h('legend', null, 'Options'), h('div', { class: 'radio-row' }, Object.values(opt).map(o => o.wrap)));
    const out = h('div', { class: 'result', 'aria-live': 'polite' });
    let formatted = [];
    function render() {
      const lines = input.input.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 500);
      out.replaceChildren(); formatted = [];
      if (!lines.length) { out.append(h('p', { class: 'hint' }, 'Enter one or more names to format them.')); return; }
      const o = { format: fmt.input.value }; for (const [k, v] of Object.entries(opt)) o[k] = v.input.checked;
      const rows = lines.map(l => { const r = normalizeName(l, o); formatted.push(r.output); return [l, r.output, r.warnings.length ? r.warnings.join(' ') : 'OK']; });
      const flagged = rows.filter(r => r[2] !== 'OK').length;
      out.append(h('p', { class: 'hint' }, `${rows.length} name${rows.length === 1 ? '' : 's'} formatted${flagged ? `, ${flagged} to check` : ''}.`), table(['You entered', 'Formatted', 'Check'], rows, 'Formatted names'),
        h('div', { class: 'btn-row' }, btn('Copy formatted names', () => copyText(formatted.join('\n'), 'Names copied'))));
    }
    input.input.addEventListener('input', render); fmt.input.addEventListener('change', render); Object.values(opt).forEach(o => o.input.addEventListener('change', render));
    root.append(intro("Hotels and booking systems match names to the guest's ID. This tool tidies the format, but it cannot know where a surname starts in every culture, so check the flagged lines against the passport or booking."),
      input.wrap, h('div', { class: 'grid-2' }, fmt.wrap, h('div')), fs, out);
    render();
  }
};
