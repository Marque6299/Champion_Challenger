// Run: node scripts/preflight.mjs   (exits 1 on any failure)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const root = new URL('..', import.meta.url).pathname;
const walk = d => readdirSync(d).flatMap(f => f.startsWith('.') || f === 'node_modules' || f === 'scripts' ? [] : statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
const files = walk(root), html = files.filter(f => f.endsWith('.html'));
const rel = f => relative(root, f), fails = [];
const bad = (f, m) => fails.push(`${rel(f)}: ${m}`);
const bodies = new Map();
for (const f of html) {
  const s = readFileSync(f, 'utf8'), r = rel(f), portal = r.startsWith('portal');
  for (const re of [/\[Your name\]/, /yourdomain\.com/, /neflify/, /TODO/, /Reports Portal/, /mailto:"/]) if (re.test(s)) bad(f, `leftover ${re}`);
  if (portal && /adsbygoogle|pagead2|googlesyndication/.test(s)) bad(f, 'ad code in the workspace');
  if (!portal && r !== 'index.html' && /pagead2/.test(s)) bad(f, 'AdSense loader outside index.html');
  if (!/<title>[^<]{10,}/.test(s)) bad(f, 'missing title');
  if (!portal) {
    if (!/<meta name="description" content="[^"]{50,}/.test(s)) bad(f, 'missing or short description');
    const c = s.match(/<link rel="canonical" href="([^"]+)"/);
    if (!c || !c[1].startsWith('https://overwatchcc.netlify.app/')) bad(f, 'bad canonical');
  } else if (!/noindex/.test(s)) bad(f, 'portal must be noindex');
  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  if (!portal && h1 !== 1) bad(f, `expected 1 h1, found ${h1}`);
  for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/ alt="/.test(m[0]) || !/ width="/.test(m[0])) bad(f, 'img needs alt, width, height');
  const ids = new Set([...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  for (const m of s.matchAll(/href="#([^"]+)"/g)) if (m[1] && !ids.has(m[1])) bad(f, `dead anchor #${m[1]}`);
  for (const m of s.matchAll(/href="([a-z0-9\-]+\.html)(#[^"]*)?"/g)) {
    const t = join(root, m[1]); if (!existsSync(t)) { bad(f, `missing page ${m[1]}`); continue; }
    if (m[2] && !new RegExp(`id="${m[2].slice(1)}"`).test(readFileSync(t, 'utf8'))) bad(f, `dead anchor ${m[1]}${m[2]}`);
  }
  if (!portal) { const h = createHash('md5').update(s.replace(/<head>[\s\S]*<\/head>/, '')).digest('hex'); if (bodies.has(h)) bad(f, `same body as ${bodies.get(h)}`); bodies.set(h, r); }
}
if (/localStorage\.(get|set|remove)Item/.test(readFileSync(join(root, 'portal/index.html'), 'utf8').replace(/function safe[\s\S]*?\n/g, ''))) bad(join(root, 'portal/index.html'), 'unguarded localStorage');
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : `PASS (${html.length} pages checked)`);
process.exit(fails.length ? 1 : 0);
