/* ui.js - tiny DOM helpers shared by every tool. No framework. */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PROPS = new Set(['value', 'checked', 'selected', 'disabled', 'hidden', 'readOnly']);
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (PROPS.has(k)) el[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const kid of kids.flat(Infinity)) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}

let seq = 0;
export const uid = prefix => `${prefix}-${++seq}`;

/** A labelled control. Returns { wrap, input, id }. type: text | number | date | time | datetime-local | select | textarea | file. */
export function field({ label, type = 'text', value = '', hint, options, rows, id, className = '', ...attrs }) {
  id = id || uid('f');
  let input;
  if (type === 'select') {
    input = h('select', { id, class: 'input' }, options.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return h('option', { value: v, selected: String(v) === String(value) }, t); }));
  } else if (type === 'textarea') {
    input = h('textarea', { id, class: 'input', rows: rows || 4, ...attrs }); input.value = value;
  } else {
    input = h('input', { id, class: 'input', type, ...attrs }); if (type !== 'file') input.value = value;
  }
  if (hint) input.setAttribute('aria-describedby', id + '-hint');
  const wrap = h('div', { class: ('field ' + className).trim() }, h('label', { for: id }, label), input, hint ? h('p', { class: 'hint', id: id + '-hint' }, hint) : null);
  return { wrap, input, id };
}
export function check({ label, checked = false, type = 'checkbox', name, id, value }) {
  id = id || uid('c');
  const input = h('input', { id, type, name, value, checked });
  return { wrap: h('label', { class: 'check', for: id }, input, h('span', null, label)), input, id };
}
export const btn = (text, onclick, kind = 'primary', attrs = {}) => h('button', { type: 'button', class: 'btn ' + kind, onclick, ...attrs }, text);

export function kv(rows) {
  return h('dl', { class: 'kv' }, rows.filter(Boolean).map(([k, v, cls]) => [h('dt', null, k), h('dd', { class: cls || '' }, v)]));
}
export function table(headers, rows, caption) {
  return h('div', { class: 'table-wrap' }, h('table', null, caption ? h('caption', { class: 'sr-only' }, caption) : null,
    h('thead', null, h('tr', null, headers.map(x => h('th', { scope: 'col' }, x)))),
    h('tbody', null, rows.map(r => h('tr', null, r.map(c => h('td', null, c)))))));
}

/* Safe storage: some browsers and privacy modes block it. Every call reports whether it worked. */
export const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, value); return true; } catch (e) { return false; } },
  remove(key) { try { localStorage.removeItem(key); return true; } catch (e) { return false; } }
};

let toastEl, toastTimer;
export function toast(message) {
  if (!toastEl || !toastEl.isConnected) { toastEl = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(toastEl); }
  toastEl.textContent = message; toastEl.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}
export async function copyText(text, message) {
  if (!text) { toast('Nothing to copy yet'); return false; }
  try { await navigator.clipboard.writeText(text); toast(message || 'Copied'); return true; }
  catch (e) {
    const ta = h('textarea', { readonly: '', style: 'position:fixed;opacity:0;top:0;left:0' }); ta.value = text;
    document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove(); toast(ok ? (message || 'Copied') : 'Copy failed. Select the text and copy it manually.'); return ok;
  }
}
export function download(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
export const num = el => { const v = parseFloat(String(el.value).replace(/,/g, '')); return Number.isFinite(v) ? v : 0; };
export const intro = text => h('p', { class: 'tool-desc' }, text);
export const callout = (kind, ...kids) => h('div', { class: 'callout ' + kind }, ...kids);

/** Zone <option> list; adds the device zone if it is not already present. */
export function zoneOptions(list, deviceZone) {
  const opts = list.map(([id, label]) => [id, label]);
  if (deviceZone && !list.some(([id]) => id === deviceZone)) opts.unshift([deviceZone, `This device (${deviceZone})`]);
  return opts;
}

/** A destructive button that asks for confirmation inline instead of using window.confirm. */
export function confirmButton({ label, message, confirmLabel = 'Delete', cancelLabel = 'Keep', onConfirm, kind = 'danger' }) {
  const button = btn(label, () => { row.hidden = false; yes.focus(); }, kind);
  const yes = btn(confirmLabel, () => { row.hidden = true; onConfirm(); button.focus(); }, 'danger');
  const no = btn(cancelLabel, () => { row.hidden = true; button.focus(); }, 'secondary');
  const row = h('div', { class: 'confirm', hidden: true }, h('span', null, message), yes, no);
  return { button, row };
}
export function radios(name, legend, items, value) {
  const boxes = items.map(([v, label]) => check({ type: 'radio', name, value: v, label, checked: v === value }));
  const fs = h('fieldset', { class: 'fieldset' }, h('legend', null, legend), h('div', { class: 'radio-row' }, boxes.map(b => b.wrap)));
  return { fs, get value() { const c = boxes.find(b => b.input.checked); return c ? c.input.value : value; }, on(fn) { boxes.forEach(b => b.input.addEventListener('change', fn)); } };
}
