/* theme.js - System, Dark and Light, remembered per device. The workspace defaults to Dark; public pages default to System. */
const KEY = 'theme', ORDER = ['dark', 'light', 'system'], LABEL = { dark: 'Dark', light: 'Light', system: 'System' };
export function storedTheme() { try { const v = localStorage.getItem(KEY); return ORDER.includes(v) ? v : ''; } catch (e) { return ''; } }
export function applyTheme(t) {
  const r = document.documentElement;
  if (t === 'dark' || t === 'light') r.dataset.theme = t; else delete r.dataset.theme;
}
export function initThemeToggle(btn, fallback = 'system') {
  let t = storedTheme() || fallback;
  const paint = () => { btn.textContent = 'Theme: ' + LABEL[t]; btn.setAttribute('aria-label', `Theme: ${LABEL[t]}. Activate to change.`); };
  applyTheme(t); paint();
  btn.addEventListener('click', () => {
    t = ORDER[(ORDER.indexOf(t) + 1) % ORDER.length];
    try { localStorage.setItem(KEY, t); } catch (e) { /* storage blocked: the choice lasts for this visit */ }
    applyTheme(t); paint();
  });
}
