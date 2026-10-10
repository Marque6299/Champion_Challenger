#!/usr/bin/env node
/* build.mjs - static site generator. Reads site.config.json, src/content/**.md, the tool metadata and the design tokens,
   and writes the complete site to dist/. No dependencies. Usage: node build.mjs */
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { render, frontMatter, esc, inline } from './scripts/md.mjs';
import { icon, facadeArt } from './scripts/icons.mjs';
import { primitives, light, dark } from './src/tokens.mjs';
import { TOOLS, GROUPS } from './src/assets/js/meta.js';

const ROOT = new URL('.', import.meta.url).pathname;
const DIST = process.env.AGENT_DESK_OUT || join(ROOT, 'dist');
const cfg = JSON.parse(await readFile(process.env.AGENT_DESK_CONFIG || join(ROOT, 'site.config.json'), 'utf8'));
const ADS = cfg.adsense, STAGE = ADS.stage;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const prettyDate = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : d || ''; };
const authorName = cfg.author?.name?.trim() || cfg.name;
const AD_TYPES = new Set(['tool', 'report', 'guide', 'glossary']);

/* ---------- content ---------- */
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else if (e.name.endsWith('.md')) out.push(p);
  }
  return out.sort();
}
const pages = [];
for (const file of await walk(join(ROOT, 'src/content'))) {
  const { meta, body } = frontMatter(await readFile(file, 'utf8'));
  if (!meta.path) throw new Error(`${file}: front matter needs a path`);
  const { html, headings } = render(body);
  pages.push({ ...meta, html, headings, file, updated: meta.updated || cfg.updated, type: meta.type || 'page' });
}
const byPath = new Map(pages.map(p => [p.path, p]));
const toolPage = id => byPath.get(`/tools/${id}/`);
for (const t of TOOLS) if (!toolPage(t.id)) throw new Error(`Missing content page for tool ${t.id}`);
for (const r of cfg.reports) if (!byPath.get(`/reports/${r.id}/`)) throw new Error(`Missing content page for report ${r.id}`);

/* ---------- shared pieces ---------- */
const NAV = [['/reports/', 'Reports'], ['/tools/', 'Tools'], ['/guides/', 'Guides'], ['/glossary/', 'Glossary'], ['/about/', 'About']];
const FONT = '/assets/fonts/source-sans-3-latin-wght-normal.woff2';
const THEME_SCRIPT = `<script>try{var t=localStorage.getItem('theme'),r=document.documentElement;if(t==='dark'||t==='light')r.dataset.theme=t;else if(t==='system')delete r.dataset.theme}catch(e){}</script>`;
const adLoader = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.publisherId}" crossorigin="anonymous"></script>`;
const adSlot = () => ADS.slots?.inArticle ? `<div class="ad-slot" hidden><ins class="adsbygoogle" style="display:block" data-ad-client="${ADS.publisherId}" data-ad-slot="${ADS.slots.inArticle}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>` : '';
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const loaderFor = p => (p.path === '/' ? true : STAGE >= 1 && AD_TYPES.has(p.type));

function head(p, { robots, extraCss = [] } = {}) {
  const url = cfg.url + p.path;
  const title = p.path === '/' ? `${cfg.name}: ${cfg.tagline}` : `${p.title} | ${cfg.name}`;
  const css = ['tokens', 'base', 'tools', 'shell', ...extraCss].map(n => `<link rel="stylesheet" href="/assets/css/${n}.css">`).join('\n');
  let jsonld = '';
  if (p.path === '/') jsonld = ld({ '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.name, url: cfg.url + '/', description: cfg.tagline });
  else if (p.type === 'guide') jsonld = ld({ '@context': 'https://schema.org', '@type': 'Article', headline: p.h1 || p.title, description: p.description, dateModified: p.updated, author: { '@type': 'Person', name: authorName }, publisher: { '@type': 'Organization', name: cfg.name }, mainEntityOfPage: url });
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.description || cfg.tagline)}">
${robots ? `<meta name="robots" content="${robots}">` : ''}
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(p.description || cfg.tagline)}"><meta property="og:type" content="website"><meta property="og:url" content="${url}">
<meta name="theme-color" content="#0B2A4A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${FONT}" as="font" type="font/woff2" crossorigin>
${THEME_SCRIPT}
${css}
${p.path === '/' ? `<meta name="google-adsense-account" content="${ADS.publisherId}">` : ''}
${loaderFor(p) ? adLoader : ''}
${jsonld}`;
}

function header(p) {
  const cur = href => (p.path === href || (href !== '/' && p.path.startsWith(href)) ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header on-dark"><div class="wrap wide">
  <a class="brand" href="/">${esc(cfg.name)}</a>
  <nav aria-label="Main"><ul class="nav-links">${NAV.map(([h, l]) => `<li><a href="${h}"${cur(h)}>${l}</a></li>`).join('')}</ul></nav>
  <a class="btn-workspace" href="/portal/">Open the workspace</a>
</div></header>`;
}
const footer = () => `<footer class="site-footer on-dark"><div class="wrap wide">
  <ul><li><a href="/about/">About</a></li><li><a href="/contact/">Contact</a></li><li><a href="/guides/">Guides</a></li><li><a href="/privacy-policy.html">Privacy Policy</a></li><li><a href="/terms.html">Terms of Service</a></li><li><a href="/cookie-policy.html">Cookie Policy</a></li><li><button type="button" class="link-btn" data-theme-toggle>Theme: System</button></li></ul>
  <p class="footnote">${esc(cfg.name)} is an independent project. It is not affiliated with, endorsed by or sponsored by any employer, client or software vendor. Power BI is a trademark of Microsoft Corporation. The tools run in your browser and send nothing you type to any server.</p>
</div></footer>`;

function crumbs(p) {
  if (p.path === '/') return '';
  const parts = [['/', 'Home']];
  const sec = NAV.find(([h]) => h !== '/about/' && p.path.startsWith(h) && p.path !== h);
  if (sec) parts.push([sec[0], sec[1]]);
  return `<nav class="crumbs" aria-label="Breadcrumb">${parts.map(([h, l]) => `<a href="${h}">${l}</a>`).join(' / ')} / <span aria-current="page">${esc(p.crumb || p.title)}</span></nav>`;
}
function pageHead(p) {
  const showBy = ['tool', 'report', 'guide'].includes(p.type);
  const meta = showBy ? `By ${esc(authorName)} · Page updated ${prettyDate(p.updated)}` : p.type === 'legal' ? `Last updated ${prettyDate(p.updated)}` : '';
  return `<header class="page-head"><h1>${esc(p.h1 || p.title)}</h1>${p.lede ? `<p class="lede">${inline(p.lede)}</p>` : ''}${meta ? `<p class="meta">${meta}</p>` : ''}</header>`;
}
function cards(items) { return `<ul class="cards">${items.map(i => `<li><a class="card" href="${i.href}"><h3>${esc(i.title)}</h3><p>${esc(i.summary)}</p></a></li>`).join('')}</ul>`; }
const toolCards = group => cards(TOOLS.filter(t => t.group === group).map(t => ({ href: `/tools/${t.id}/`, title: t.title, summary: t.summary })));
const reportCards = () => cards(cfg.reports.map(r => ({ href: `/reports/${r.id}/`, title: r.title, summary: r.summary })));
const guideList = () => pages.filter(p => p.type === 'guide').sort((a, b) => (+a.order || 99) - (+b.order || 99));

function toc(p) {
  const h2 = p.headings.filter(h => h.level === 2);
  return h2.length >= 4 && ['guide', 'legal'].includes(p.type) ? `<nav class="callout" aria-label="On this page"><strong>On this page</strong><ul>${h2.map(h => `<li><a href="#${h.id}">${inline(h.text)}</a></li>`).join('')}</ul></nav>` : '';
}
function withAd(html) {
  if (STAGE < 1) return html;
  const slot = adSlot(); if (!slot) return html;
  const idx = [...html.matchAll(/<h2[ >]/g)].map(m => m.index)[2];
  return idx === undefined ? html + slot : html.slice(0, idx) + slot + html.slice(idx);
}
function related(p) {
  const list = (p.related || '').split(',').map(s => s.trim()).filter(Boolean).map(h => byPath.get(h)).filter(Boolean);
  if (p.type === 'tool') { const t = TOOLS.find(x => x.id === p.tool); list.unshift({ path: `/portal/#${t.hash}`, title: `Open ${t.title} in the workspace` }); }
  return list.length ? `<aside class="related" aria-labelledby="rel-h"><h2 id="rel-h">Related</h2><ul>${list.map(x => `<li><a href="${x.path}">${esc(x.crumb || x.title)}</a></li>`).join('')}</ul></aside>` : '';
}

function reportBlock(r) {
  const page = `/reports/${r.id}/`;
  const facts = [['Format', 'Interactive Power BI report'], ['Audience', r.audience], ['Data refresh', r.cadence], ['Last refreshed', r.refreshed ? prettyDate(r.refreshed) : ''], ['Works with', 'Filters, slicers and cross-highlighting inside the frame']].filter(x => x[1]);
  const art = r.snapshot ? `<img src="${esc(r.snapshot)}" width="800" height="450" loading="lazy" alt="${esc(r.snapshotAlt || r.title + ' report snapshot')}">` : facadeArt;
  return `<section class="report-frame glass" data-report-frame data-state="idle" data-src="${esc(r.url)}" data-title="${esc(r.title)} report" aria-labelledby="rf-h">
  <h2 id="rf-h" class="sr-only">Interactive report</h2>
  <div class="report-toolbar">
    <button type="button" class="btn secondary" data-fullscreen>Open full screen</button>
    <a href="${esc(r.url)}" target="_blank" rel="noopener">Open in a new tab</a>
    <a href="/portal/#${r.hash}">Open in the workspace</a>
    <label class="check"><input type="checkbox" data-autoload><span>Load reports automatically on this device</span></label>
  </div>
  <div data-stage><div class="facade">${art}<p>This report is hosted by Microsoft Power BI. It loads only when you ask, so this page stays fast.</p><button type="button" class="btn" data-load>Load interactive report</button><noscript><p>The interactive report needs JavaScript. <a href="${esc(r.url)}">Open it in Power BI</a>.</p></noscript></div></div>
  <p class="report-status" data-status role="status"></p>
  <div class="report-help" data-help hidden><p><strong>The report is taking longer than usual.</strong> Power BI may be blocked on this network, or the connection is slow. Try again, or open the report in a new tab.</p><button type="button" class="btn secondary" data-retry>Try again</button> <a href="${esc(r.url)}" target="_blank" rel="noopener">Open in a new tab</a></div>
</section>
<dl class="report-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

/* ---------- page bodies by type ---------- */
function bodyFor(p) {
  const prose = body => `<div class="prose">${AD_TYPES.has(p.type) ? withAd(body) : body}</div>`;
  switch (p.type) {
    case 'home': return `<section class="hero hero-grid"><div><h1>${esc(p.h1)}</h1><p class="lede">${inline(p.lede)}</p><div class="cta"><a class="btn" href="/portal/">Open the workspace</a><a class="btn secondary" href="/tools/">Browse the tools</a></div></div><aside class="hero-panel glass" aria-label="At a glance"><dl class="stats"><div><dt>Power BI reports</dt><dd>${cfg.reports.length}</dd></div><div><dt>Free tools</dt><dd>${TOOLS.length}</dd></div><div><dt>Guides</dt><dd>${pages.filter(x => x.type === 'guide').length}</dd></div><div><dt>Glossary terms</dt><dd>${(byPath.get('/glossary/')?.html.match(/<dt /g) || []).length}</dd></div></dl><p class="hero-note">Runs in your browser. No account, no sign-in, and nothing you type is sent anywhere.</p></aside></section>
<h2 class="section-title">Power BI reports</h2>${reportCards()}
<h2 class="section-title">Tools for travel and lodging teams</h2>${toolCards('travel')}
<h2 class="section-title">Everyday agent tools</h2>${toolCards('agent')}
<div class="prose">${p.html}</div>`;
    case 'hub-tools': return `<div class="prose">${p.html}</div>${GROUPS.map(g => `<h2 class="section-title">${g.label}</h2>${toolCards(g.id)}`).join('')}`;
    case 'hub-reports': return `<div class="prose">${p.html}</div><h2 class="section-title">Choose a report</h2>${reportCards()}`;
    case 'hub-guides': return `<div class="prose">${p.html}</div><h2 class="section-title">All guides</h2>${cards(guideList().map(g => ({ href: g.path, title: g.crumb || g.title, summary: g.description })))}`;
    case 'tool': {
      const t = TOOLS.find(x => x.id === p.tool);
      return `<section class="tool-panel glass" aria-labelledby="tool-h"><h2 id="tool-h" class="sr-only">Use the tool</h2><div data-tool="${t.id}"><p class="tool-boot">Loading the tool.</p><noscript><p>This tool needs JavaScript. Nothing you enter is sent anywhere.</p></noscript></div></section>
${prose(toc(p) + p.html)}${related(p)}`;
    }
    case 'report': { const r = cfg.reports.find(x => x.id === p.report); return `${reportBlock(r)}${prose(toc(p) + p.html)}${related(p)}`; }
    case 'glossary': return `<div class="prose">${withAd(p.html)}</div>${related(p)}`;
    default: return `${prose(toc(p) + p.html)}${p.type === 'guide' ? related(p) : ''}`;
  }
}
const contactExtra = p => (p.path === '/contact/' ? `<p class="callout"><strong>Email:</strong> <a href="mailto:${esc(cfg.contact.email)}">${esc(cfg.contact.email)}</a></p>` : '');

function renderPage(p) {
  const wide = p.type === 'report' || p.type === 'home';
  const html = `<!doctype html>
<html lang="en">
<head>
${head(p)}
</head>
<body class="content-page">
${header(p)}
<main id="main" class="wrap${wide ? ' wide' : ''}" data-type="${p.type}" tabindex="-1">
${crumbs(p)}
${p.type === 'home' ? '' : pageHead(p)}
${p.path === '/contact/' ? contactExtra(p) : ''}
${bodyFor(p)}
</main>
${footer()}
<script src="/assets/js/report-frame.js" defer></script>
<script type="module" src="/assets/js/site.js"></script>
</body>
</html>
`;
  return html;
}

function renderPortal() {
  const reports = cfg.reports.map(r => ({ id: r.id, hash: r.hash, title: r.title, url: r.url, page: `/reports/${r.id}/` }));
  const navItem = (hash, title, ic) => `<a class="nav-btn" href="#${hash}" data-hash="${hash}">${icon(ic)}<span>${esc(title)}</span></a>`;
  const first = reports[0];
  const p = { path: '/portal/', title: 'Workspace', description: 'The Agent Desk workspace: Power BI reports and agent tools in one place.', type: 'portal' };
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
${head(p, { robots: 'noindex, follow' })}
</head>
<body class="workspace">
<a class="skip" href="#main">Skip to content</a>
<div class="app" id="app" data-focus="false">
  <header class="topbar on-dark"><button type="button" class="nav-btn" id="menuBtn" aria-expanded="false" aria-controls="sidebar">Menu</button><span class="brand">${esc(cfg.name)}</span></header>
  <nav class="sidebar on-dark" id="sidebar" aria-label="Workspace">
    <a class="brand" href="/">${esc(cfg.name)}</a>
    <div class="nav-section">Dashboards</div>
    ${cfg.reports.map(r => navItem(r.hash, r.title, 'dash')).join('\n    ')}
    ${GROUPS.map(g => `<div class="nav-section">${g.label}</div>\n    ${TOOLS.filter(t => t.group === g.id).map(t => navItem(t.hash, t.nav || t.title, t.icon)).join('\n    ')}`).join('\n    ')}
    <div class="sidebar-foot">
      <button type="button" class="toggle" data-focus-toggle aria-pressed="false">Focus mode (report only)</button>
      <button type="button" class="toggle" data-theme-toggle>Theme: Dark</button>
      <a href="/">Home</a><a href="/guides/">Guides</a><a href="/contact/">Contact</a><a href="/privacy-policy.html">Privacy Policy</a><a href="/terms.html">Terms</a><a href="/cookie-policy.html">Cookies</a>
    </div>
  </nav>
  <main id="main" class="stage" data-type="portal">
    <header class="stage-head"><h1 id="stageTitle" tabindex="-1">${esc(first.title)}</h1>
      <div class="stage-actions"><a id="aboutLink" href="/reports/${first.id}/">About this report</a><a id="newTab" href="${esc(first.url)}" target="_blank" rel="noopener">Open in a new tab</a><button type="button" class="btn secondary" id="fsBtn">Full screen</button></div></header>
    <section class="report-frame glass" data-report-frame data-state="idle" data-src="" data-title="${esc(first.title)} report" aria-label="Report">
      <div data-stage><div class="facade"><p>Choose a report or tool from the menu.</p></div></div>
      <button type="button" data-fullscreen hidden>Full screen</button>
      <p class="report-status" data-status role="status"></p>
      <div class="report-help" data-help hidden><p><strong>The report is taking longer than usual.</strong> Power BI may be blocked on this network, or the connection is slow. Try again, or open the report in a new tab.</p><button type="button" class="btn secondary" data-retry>Try again</button> <a id="helpTab" href="${esc(first.url)}" target="_blank" rel="noopener">Open in a new tab</a></div>
    </section>
    <section class="tool-host glass" id="toolHost" aria-label="Tool" hidden></section>
    <noscript><p class="callout">The workspace needs JavaScript. You can open each report from its page: ${cfg.reports.map(r => `<a href="/reports/${r.id}/">${esc(r.title)}</a>`).join(', ')}.</p></noscript>
  </main>
</div>
<script type="application/json" id="portal-data">${JSON.stringify({ reports }).replace(/</g, '\\u003c')}</script>
<script src="/assets/js/report-frame.js" defer></script>
<script src="/assets/js/shell.js" defer></script>
<script type="module" src="/assets/js/portal.js"></script>
</body>
</html>
`;
}

function render404() {
  const p = { path: '/404.html', title: 'Page not found', description: 'That page does not exist.', type: 'error' };
  return `<!doctype html>
<html lang="en">
<head>
${head(p, { robots: 'noindex' })}
</head>
<body class="content-page">
${header(p)}
<main id="main" class="wrap" data-type="error" tabindex="-1"><header class="page-head"><h1>Page not found</h1><p class="lede">That address does not exist or has moved.</p></header>
<p><a class="btn" href="/">Go to the home page</a> <a class="btn secondary" href="/tools/">Browse the tools</a> <a class="btn secondary" href="/portal/">Open the workspace</a></p></main>
${footer()}
<script type="module" src="/assets/js/site.js"></script>
</body>
</html>
`;
}

/* ---------- tokens.css ---------- */
const decls = o => Object.entries(o).map(([k, v]) => `  ${k}: ${v};`).join('\n');
const tokensCss = `/* Generated by build.mjs from src/tokens.mjs. Do not edit by hand. */
:root {
${decls(primitives)}
${decls(light)}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${decls(dark)}
  }
}
:root[data-theme="dark"] {
${decls(dark)}
}
`;

/* ---------- write ---------- */
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await cp(join(ROOT, 'src/assets'), join(DIST, 'assets'), { recursive: true });
if (existsSync(join(ROOT, 'src/static'))) await cp(join(ROOT, 'src/static'), DIST, { recursive: true });
await writeFile(join(DIST, 'assets/css/tokens.css'), tokensCss);

const out = async (path, html) => {
  const file = path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, path);
  await mkdir(dirname(file), { recursive: true }); await writeFile(file, html);
};
for (const p of pages) await out(p.path, renderPage(p));
await out('/portal/', renderPortal());
await out('/404.html', render404());

const indexable = pages.filter(p => !p.noindex);
await writeFile(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(p => `  <url><loc>${cfg.url}${p.path}</loc><lastmod>${p.updated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
await writeFile(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${cfg.url}/sitemap.xml\n`);
await writeFile(join(DIST, 'ads.txt'), `google.com, ${ADS.publisherId.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
console.log(`Built ${pages.length + 2} pages (${indexable.length} in the sitemap), ${TOOLS.length} tools, ${cfg.reports.length} reports. Ad stage ${STAGE}. Output: dist/`);
