import { h, field, btn, copyText, download, store, stamp, intro, callout, confirmButton, toast } from '../ui.js';
import { CASE_TYPES, fieldsFor, missingRequired, buildNote, scanValues } from '../lib/casenotes.js';
import { maskSensitive } from '../lib/pii.js';

export default {
  id: 'lodging-case-notes',
  mount(root) {
    const KEY = 'lodgingDraft:';
    let type = store.get('lodgingCaseType', CASE_TYPES[0].id);
    if (!CASE_TYPES.some(t => t.id === type)) type = CASE_TYPES[0].id;
    let values = {}, inputs = {};
    const sel = h('select', { id: 'case-type', class: 'input' }, ['Guest (B2C)', 'B2B'].map(g => h('optgroup', { label: g }, CASE_TYPES.filter(t => t.group === g).map(t => h('option', { value: t.id, selected: t.id === type }, t.label)))));
    const typeWrap = h('div', { class: 'field' }, h('label', { for: 'case-type' }, 'Case type'), sel);
    const form = h('div', { class: 'case-form' });
    const missing = h('div', { class: 'callout', role: 'status', 'aria-live': 'polite' });
    const guard = h('div', { class: 'callout warn', role: 'status', 'aria-live': 'polite', hidden: true });
    const preview = h('pre', { class: 'note-preview', 'aria-label': 'Note preview' });
    const storage = h('p', { class: 'hint', hidden: true }, 'Your browser is blocking storage, so this draft will not be remembered.');

    function loadDraft() { try { values = JSON.parse(store.get(KEY + type, '{}')) || {}; } catch (e) { values = {}; } }
    function build() {
      form.replaceChildren(); inputs = {};
      for (const fl of fieldsFor(type)) {
        const f = field({ id: `cn-${type}-${fl.id}`, label: fl.label + (fl.required ? ' (required)' : ''), type: fl.type, rows: fl.rows, hint: fl.hint, autocomplete: 'off',
          options: fl.type === 'select' ? [['', 'Select...'], ...fl.options] : undefined, value: values[fl.id] || '' });
        const ev = fl.type === 'select' ? 'change' : 'input';
        f.input.addEventListener(ev, () => { values[fl.id] = f.input.value; if (!store.set(KEY + type, JSON.stringify(values))) storage.hidden = false; refresh(); });
        inputs[fl.id] = f; form.append(f.wrap);
      }
      refresh();
    }
    function refresh() {
      const miss = missingRequired(type, values);
      missing.className = 'callout ' + (miss.length ? '' : 'ok'); missing.replaceChildren(miss.length ? h('span', null, h('strong', null, `Still needed (${miss.length}): `), miss.join(', ')) : 'All required fields are filled in.');
      const hits = scanValues(values); guard.hidden = !hits.length; guard.replaceChildren();
      if (hits.length) guard.append(h('strong', null, 'Remove before you copy: '), `a field may contain a ${[...new Set(hits.map(x => x.label))].join(', ')}. Card numbers and security codes do not belong in notes. Copying will mask them.`);
      preview.textContent = buildNote(type, values) || 'Your note will appear here as you fill in the form.';
    }
    function finalNote() { return buildNote(type, values, { loggedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) }); }
    const clear = confirmButton({ label: 'Clear this form', message: 'Clear every field for this case type? This cannot be undone.', confirmLabel: 'Clear form', onConfirm: () => { values = {}; store.remove(KEY + type); build(); } });

    sel.addEventListener('change', () => { type = sel.value; store.set('lodgingCaseType', type); loadDraft(); build(); });
    loadDraft(); build();
    root.append(intro('Pick the case type to get the fields a good note needs. Required fields are marked, and the note builds as you type. Drafts are kept in this browser, per case type. Never enter card numbers, security codes or passwords.'),
      typeWrap, form, storage, missing, guard, h('h3', { class: 'calc-title' }, 'Preview'), preview,
      h('div', { class: 'btn-row' },
        btn('Copy note', () => { const hits = scanValues(values), miss = missingRequired(type, values); const txt = finalNote(); copyText(hits.length ? maskSensitive(txt).text : txt, hits.length ? 'Copied with sensitive text removed' : miss.length ? `Copied. ${miss.length} required field${miss.length === 1 ? ' is' : 's are'} still empty` : 'Note copied'); }),
        btn('Download .txt', () => { const t = buildNote(type, values); if (!t) return; download(`lodging-note-${type}-${stamp()}.txt`, maskSensitive(finalNote()).text); }, 'secondary'), clear.button), clear.row);
  }
};
