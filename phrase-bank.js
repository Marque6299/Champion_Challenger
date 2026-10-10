import { h, btn, copyText, intro } from '../ui.js';
import { PHRASES, ORIGINAL_CATEGORIES } from '../lib/phrases.js';

export default {
  id: 'phrase-bank',
  mount(root) {
    const cats = Object.keys(PHRASES);
    let active = cats[0];
    const list = h('ul', { class: 'phrase-list' });
    const tabs = [];
    function draw() {
      list.replaceChildren(...PHRASES[active].map(text => h('li', null, h('button', { type: 'button', class: 'phrase-item', onclick: () => copyText(text, 'Phrase copied') }, h('span', null, text), h('span', { class: 'copy-tag' }, 'Copy')))));
    }
    const tab = cat => { const b = h('button', { type: 'button', class: 'tab-btn', 'aria-pressed': String(cat === active), onclick: () => { active = cat; tabs.forEach(t => t.setAttribute('aria-pressed', String(t.textContent === cat))); draw(); } }, cat); tabs.push(b); return b; };
    const general = cats.filter(c => ORIGINAL_CATEGORIES.includes(c)), travel = cats.filter(c => !ORIGINAL_CATEGORIES.includes(c));
    root.append(intro("Pick a category and click a phrase to copy it. Replace anything in [brackets] with your details, and always follow your company's approved scripts and compliance wording."),
      h('div', { class: 'tabs-row', role: 'group', 'aria-label': 'General phrase categories' }, general.map(tab)),
      h('div', { class: 'tabs-row', role: 'group', 'aria-label': 'Lodging and B2B phrase categories' }, travel.map(tab)), list);
    draw();
  }
};
