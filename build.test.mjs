import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cfg = JSON.parse(readFileSync('site.config.json', 'utf8'));
const tmp = mkdtempSync(join(tmpdir(), 'agent-desk-'));
const build = (stage, slot) => {
  const out = join(tmp, `dist-${stage}`), conf = join(tmp, `config-${stage}.json`);
  writeFileSync(conf, JSON.stringify({ ...cfg, adsense: { ...cfg.adsense, stage, slots: { inArticle: slot } } }));
  const env = { ...process.env, AGENT_DESK_OUT: out, AGENT_DESK_CONFIG: conf };
  execFileSync('node', ['build.mjs'], { env, stdio: 'pipe' });
  const pre = spawnSync('node', ['scripts/preflight.mjs', out], { env, encoding: 'utf8' });
  const links = spawnSync('node', ['scripts/check-links.mjs', out], { env, encoding: 'utf8' });
  const pages = {};
  (function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.html')) pages[p.slice(out.length)] = readFileSync(p, 'utf8'); } })(out);
  return { out, env, pre, links, pages };
};
const loader = h => /pagead2\.googlesyndication\.com/.test(h), unit = h => /<ins[^>]+adsbygoogle/.test(h), slot = h => /class="ad-slot"/.test(h);

test('stage 0 (before approval): loader on the home page only, no ad units anywhere, gates pass', () => {
  const b = build(0, '');
  assert.equal(b.pre.status, 0, b.pre.stdout); assert.equal(b.links.status, 0, b.links.stdout);
  const withLoader = Object.entries(b.pages).filter(([, h]) => loader(h)).map(([p]) => p);
  assert.deepEqual(withLoader, ['/index.html']);
  assert.ok(Object.values(b.pages).every(h => !unit(h) && !slot(h)));
  assert.match(b.pages['/index.html'], /<meta name="google-adsense-account" content="ca-pub-\d+">/);
  assert.match(readFileSync(join(b.out, 'ads.txt'), 'utf8'), /^google\.com, pub-\d+, DIRECT, f08c47fec0942fa0\n$/);
  assert.ok(!existsSync(join(b.out, 'portal', 'ads.txt')));
});
test('stage 1 (after approval): ads only on content pages, after the second section, never in the workspace', () => {
  const b = build(1, '1234567890');
  assert.equal(b.pre.status, 0, b.pre.stdout);
  const mainType = h => (/<main[^>]*data-type="([^"]+)"/.exec(h) || [])[1];
  for (const [path, h] of Object.entries(b.pages)) {
    const t = mainType(h), eligible = ['tool', 'report', 'guide', 'glossary'].includes(t);
    if (path === '/index.html') { assert.ok(loader(h) && !unit(h), 'home keeps the loader only'); continue; }
    assert.equal(loader(h), eligible, `${path} (${t}) loader`);
    assert.equal(slot(h), eligible, `${path} (${t}) slot`);
    if (eligible) { const slotAt = h.indexOf('class="ad-slot"'), proseAt = h.lastIndexOf('<div class="prose">', slotAt); assert.ok(proseAt > -1, `${path}: slot is not inside the prose`); const sections = [...h.slice(proseAt, slotAt).matchAll(/<h2[ >]/g)].length; assert.ok(sections >= 2, `${path}: slot after only ${sections} prose sections`); }
  }
  for (const p of ['/portal/index.html', '/privacy-policy.html', '/terms.html', '/cookie-policy.html', '/contact/index.html', '/about/index.html', '/tools/index.html', '/404.html']) assert.ok(!loader(b.pages[p]) && !unit(b.pages[p]) && !slot(b.pages[p]), `${p} must carry no ad code`);
  assert.match(b.pages['/tools/cancellation-deadline/index.html'], /data-ad-slot="1234567890" data-ad-format="auto" data-full-width-responsive="true"/);
  assert.ok(!/data-tool[^>]*>[\s\S]{0,400}ad-slot/.test(b.pages['/tools/cancellation-deadline/index.html']), 'no ad directly beside the tool');
});
test('stage 1 without a slot id renders the loader but no ad markup', () => {
  const b = build(1, '');
  assert.ok(Object.values(b.pages).every(h => !unit(h) && !slot(h)));
});
test('the gate fails when a rule is broken', () => {
  const b = build(0, '');
  const bad = join(tmp, 'dist-bad'); cpSync(b.out, bad, { recursive: true });
  const p = join(bad, 'portal/index.html'); writeFileSync(p, readFileSync(p, 'utf8').replace('</body>', '<ins class="adsbygoogle"></ins><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script></body>'));
  const g = join(bad, 'guides/aht-explained/index.html'); writeFileSync(g, readFileSync(g, 'utf8').replace('<title>', '<title>[Your name] ').replace(/<canonical>/, ''));
  const r = spawnSync('node', ['scripts/preflight.mjs', bad], { env: b.env, encoding: 'utf8' });
  assert.equal(r.status, 1); assert.match(r.stdout, /ad code present in the ad-free workspace/); assert.match(r.stdout, /placeholder or house-ad code/);
  const thin = join(bad, 'tools/hotel-kpis/index.html'); writeFileSync(thin, readFileSync(thin, 'utf8').replace(/<main[\s\S]*<\/main>/, '<main id="main" class="wrap" data-type="tool"><h1>x</h1><p>tiny</p></main>'));
  assert.match(spawnSync('node', ['scripts/preflight.mjs', bad], { env: b.env, encoding: 'utf8' }).stdout, /only \d+ words of main content for a tool page/);
  const l = join(bad, 'about/index.html'); writeFileSync(l, readFileSync(l, 'utf8').replace('</main>', '<a href="/nope/">x</a><a href="/glossary/#missing">y</a></main>'));
  const lr = spawnSync('node', ['scripts/check-links.mjs', bad], { env: b.env, encoding: 'utf8' });
  assert.equal(lr.status, 1); assert.match(lr.stdout, /\/nope\/ does not exist/); assert.match(lr.stdout, /no element with id "missing"/);
});
test('every legacy hash and old URL from the original site still has a destination', () => {
  const b = build(0, '');
  const hashes = ['report1', 'report2', 'report5', 'notes', 'timer', 'ahtcalc', 'phrases', 'phonetic', 'formatter', 'timezones'];
  const portalData = JSON.parse(/<script type="application\/json" id="portal-data">([\s\S]*?)<\/script>/.exec(b.pages['/portal/index.html'])[1]);
  const meta = readFileSync('src/assets/js/meta.js', 'utf8');
  for (const h of hashes) assert.ok(portalData.reports.some(r => r.hash === h) || new RegExp(`hash: '${h}'`).test(meta), `portal hash #${h}`);
  const anchors = ['call-scratchpad', 'aht-timer', 'aht-calculator', 'phrase-bank', 'phonetic-speller', 'text-formatter', 'time-zones'];
  for (const a of anchors) assert.match(b.pages['/guides/how-it-works/index.html'], new RegExp(`<h2 id="${a}">`), `how-it-works anchor #${a}`);
  const toml = readFileSync('netlify.toml', 'utf8');
  for (const from of ['/how-it-works.html', '/about.html', '/contact.html']) assert.ok(toml.includes(`from = "${from}"`), `redirect for ${from}`);
});
