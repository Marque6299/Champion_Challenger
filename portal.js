/* portal.js - the workspace controller: hash routing between reports and tools, with the same deep links as the original portal. */
import { TOOLS } from './meta.js';
import { initThemeToggle } from './theme.js';

const data = JSON.parse(document.getElementById('portal-data').textContent);
const $ = s => document.querySelector(s);
const frame = $('[data-report-frame]'), host = $('#toolHost'), title = $('#stageTitle'), about = $('#aboutLink'), newTab = $('#newTab'), helpTab = $('#helpTab'), fsBtn = $('#fsBtn'), nav = [...document.querySelectorAll('.nav-btn[data-hash]')];
let current = null, currentKey = '', first = true;
initThemeToggle($('[data-theme-toggle]'), 'dark');

function setNav(hash) { nav.forEach(a => (a.dataset.hash === hash ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'))); }

async function route() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, '')) || data.reports[0].hash;
  const report = data.reports.find(r => r.hash === raw || r.id === raw);
  const tool = report ? null : TOOLS.find(t => t.hash === raw || t.id === raw);
  const item = report || tool || data.reports[0];
  const hash = item.hash, key = (report ? 'r:' : 't:') + item.id;
  setNav(hash);
  if (key === currentKey) return;
  currentKey = key;
  if (current && current.destroy) { current.destroy(); } current = null;
  title.textContent = item.title;
  document.title = `${item.title} | Agent Desk workspace`;
  if (report) {
    host.hidden = true; frame.hidden = false; fsBtn.hidden = false;
    about.hidden = !report.page; about.href = report.page || '#'; about.textContent = 'About this report';
    newTab.hidden = false; newTab.href = report.url; helpTab.href = report.url;
    frame.reportFrameApi.switchTo(report.url, report.title + ' report', true);
  } else {
    frame.hidden = true; fsBtn.hidden = true; newTab.hidden = true; host.hidden = false;
    about.hidden = false; about.href = `/tools/${tool.id}/`; about.textContent = 'About this tool';
    host.replaceChildren(Object.assign(document.createElement('p'), { className: 'tool-boot', textContent: 'Loading the tool.' }));
    try {
      const m = await import(`./tools/${tool.id}.js`);
      if (currentKey !== key) return;
      host.replaceChildren(); current = m.default.mount(host) || null;
    } catch (e) { console.error(e); host.textContent = 'This tool could not load. Reload the page and try again.'; }
  }
  if (!first) title.focus({ preventScroll: true });
  first = false;
}
fsBtn.addEventListener('click', () => frame.querySelector('[data-fullscreen]').click());
addEventListener('hashchange', route);
route();
