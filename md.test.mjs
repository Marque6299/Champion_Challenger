import test from 'node:test';
import assert from 'node:assert/strict';
import { render, inline, slug, frontMatter } from '../scripts/md.mjs';

test('inline: bold, italic, code, links, escaping', () => {
  assert.equal(inline('a **b** and *c* and `d<e>`'), 'a <strong>b</strong> and <em>c</em> and <code>d&lt;e&gt;</code>');
  assert.equal(inline('[Tools](/tools/) & <b>'), '<a href="/tools/">Tools</a> &amp; &lt;b&gt;');
  assert.equal(inline('2 * 3 * 4 and ADR × occupancy'), '2 * 3 * 4 and ADR × occupancy');
});
test('front matter and slugs', () => {
  const f = frontMatter('---\ntitle: Hello: world\ntype: tool\n---\nBody');
  assert.deepEqual(f.meta, { title: 'Hello: world', type: 'tool' }); assert.equal(f.body, 'Body');
  assert.equal(slug('What is ADR & RevPAR?'), 'what-is-adr-revpar');
});
test('blocks: headings, lists, tables, quotes, code, hr', () => {
  const { html, headings } = render('## Title\n\nPara one\ncontinues.\n\n- a\n- b with `code`\n\n1. one\n2. two\n   more\n\n| A | B |\n|---|---|\n| 1 | **2** |\n\n> quote\n\n```\n<x>\n```\n\n---');
  assert.match(html, /<h2 id="title">Title<\/h2>/); assert.match(html, /<p>Para one continues\.<\/p>/); assert.match(html, /<ul><li>a<\/li><li>b with <code>code<\/code><\/li><\/ul>/);
  assert.match(html, /<ol><li>one<\/li><li>two more<\/li><\/ol>/); assert.match(html, /<th scope="col">A<\/th>/); assert.match(html, /<td><strong>2<\/strong><\/td>/);
  assert.match(html, /<blockquote><p>quote<\/p>/); assert.match(html, /<pre><code>&lt;x&gt;<\/code><\/pre>/); assert.match(html, /<hr>/);
  assert.deepEqual(headings, [{ level: 2, text: 'Title', id: 'title' }]);
});
test('containers: callouts, faq, glossary', () => {
  assert.match(render('::: warn\nCareful **now**.\n:::').html, /<div class="callout warn"><p>Careful <strong>now<\/strong>\.<\/p>/);
  assert.match(render('::: faq\nQ: Why?\nA: Because.\nQ: How?\nA: Like so\nand so.\n:::').html, /<details><summary>Why\?<\/summary><p>Because\.<\/p><\/details><details><summary>How\?<\/summary><p>Like so and so\.<\/p>/);
  const g = render('::: glossary\nADR :: Average daily rate.\nBAR :: Best available rate.\nAttrition :: Rooms released.\n:::').html;
  assert.match(g, /<ul class="az"[^>]*><li><a href="#adr">A<\/a><\/li><li><a href="#bar">B<\/a><\/li><\/ul>/); assert.match(g, /<dt id="attrition">Attrition<\/dt><dd>Rooms released\.<\/dd>/);
});
test('a list directly after a paragraph line ends the paragraph', () => {
  const h = render('Intro line\n- item').html; assert.match(h, /<p>Intro line<\/p>/); assert.match(h, /<ul><li>item<\/li><\/ul>/);
});
