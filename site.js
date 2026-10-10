/* site.js - runs on every public content page: theme toggle, tool mounting, and (after approval only) the ad gate. */
import { initThemeToggle } from './theme.js';

document.querySelectorAll('[data-theme-toggle]').forEach(b => initThemeToggle(b, 'system'));

const host = document.querySelector('[data-tool]');
if (host) {
  const id = host.dataset.tool;
  host.setAttribute('aria-busy', 'true');
  import(`./tools/${id}.js`).then(m => { host.replaceChildren(); m.default.mount(host); host.removeAttribute('aria-busy'); })
    .catch(err => { console.error(err); host.textContent = 'This tool could not load. Reload the page, or open it in the workspace.'; host.removeAttribute('aria-busy'); });
}
if (document.querySelector('.ad-slot')) import('./ads-gate.js').catch(() => {});
