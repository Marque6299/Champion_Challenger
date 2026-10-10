import { h, field, btn, toast, copyText, download, store, stamp, intro, callout } from '../ui.js';
import { NOTE_TEMPLATES, countLabel } from '../lib/text.js';
import { findSensitive, maskSensitive } from '../lib/pii.js';

export default {
  id: 'call-scratchpad',
  mount(root) {
    const KEY = 'agentNotes';
    const notes = field({ label: 'Notes', type: 'textarea', rows: 12, placeholder: 'Type customer info, reference numbers, or shorthand notes...' });
    const area = notes.input;
    const count = h('div', { class: 'counts' });
    const guard = h('div', { class: 'callout warn', role: 'status', 'aria-live': 'polite', hidden: true });
    const storage = h('p', { class: 'hint', hidden: true }, 'Your browser is blocking storage, so notes will not be remembered after you close this tab.');
    const confirmRow = h('div', { class: 'confirm', hidden: true }, h('span', null, 'Delete all notes on this device? This cannot be undone.'),
      btn('Delete notes', () => { area.value = ''; store.remove(KEY); refresh(); confirmRow.hidden = true; clearBtn.focus(); }, 'danger'),
      btn('Keep notes', () => { confirmRow.hidden = true; clearBtn.focus(); }, 'secondary'));
    const clearBtn = btn('Clear notes', () => { confirmRow.hidden = false; confirmRow.querySelector('button').focus(); }, 'danger');

    function refresh() {
      count.textContent = countLabel(area.value);
      const hits = findSensitive(area.value);
      guard.hidden = hits.length === 0;
      guard.replaceChildren();
      if (hits.length) {
        const kinds = [...new Set(hits.map(x => x.label))].join(', ');
        guard.append(h('strong', null, 'Remove before you save or copy: '), `these notes may contain a ${kinds}. Card numbers and security codes do not belong in notes.`, ' ',
          btn('Mask sensitive text', () => { area.value = maskSensitive(area.value).text; area.dispatchEvent(new Event('input')); toast('Sensitive text masked'); }, 'secondary'));
      }
    }
    function insert(text) {
      const multi = text.includes('\n');
      const gap = multi && area.value.trim() ? (area.value.endsWith('\n') ? '\n' : '\n\n') : '';
      const pos = multi ? area.value.length : area.selectionStart;
      area.setRangeText(gap + text, pos, pos, 'end'); area.focus(); area.dispatchEvent(new Event('input'));
    }
    area.value = store.get(KEY, '');
    area.addEventListener('input', () => { if (!store.set(KEY, area.value)) storage.hidden = false; refresh(); });

    root.append(
      intro('Notes save in this browser as you type.'),
      callout('warn', h('strong', null, 'Keep it safe: '), "don't store card numbers, passwords or full ID numbers here. Notes stay in this browser, but a shared computer is not private."),
      h('div', { class: 'btn-row' }, [['Standard template', 'standard'], ['Callback template', 'callback'], ['Escalation template', 'escalation']].map(([t, k]) => btn(t, () => insert(NOTE_TEMPLATES[k]), 'secondary')),
        btn('Insert time', () => insert('[' + new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) + '] '), 'secondary')),
      notes.wrap, count, guard, storage,
      h('div', { class: 'btn-row' },
        btn('Copy notes', () => { const hits = findSensitive(area.value); copyText(hits.length ? maskSensitive(area.value).text : area.value, hits.length ? 'Copied with sensitive text removed' : 'Notes copied'); }),
        btn('Download .txt', () => { if (!area.value.trim()) { toast('Nothing to download yet'); return; } download(`call-notes-${stamp()}.txt`, maskSensitive(area.value).text); }, 'secondary'),
        clearBtn), confirmRow);
    refresh();
  }
};
