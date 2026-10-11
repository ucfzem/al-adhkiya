import fs from 'fs';

const raw = fs.readFileSync('/tmp/adhkiya.mARkdown', 'utf8');

function cleanText(s) {
  return s
    .replace(/PageV\d+P\d+/g, ' ')
    .replace(/\bms\d+g?\b/g, ' ')
    .replace(/~~/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const lines = raw.split('\n');
const groups = [];
let cur = null;
const push = () => { if (cur && cur.parts.some(p => p.trim())) groups.push(cur); };

for (const line of lines) {
  if (/^#META#/.test(line) || /^######/.test(line)) continue;
  const t = line.replace(/\r$/, '');
  if (t.startsWith('# | ')) { push(); cur = { type: 'heading', parts: [t.slice(4)] }; }
  else if (t.startsWith('# ')) { push(); cur = { type: 'para', parts: [t.slice(2)] }; }
  else if (t.startsWith('~~')) { if (cur) cur.parts.push(t.slice(2)); }
  else if (t.trim() === '') { /* ignore */ }
  else { if (cur) cur.parts.push(t); }
}
push();

for (const g of groups) g.text = cleanText(g.parts.join(' '));

const isBab = (s) => /^الباب\s/.test(s.replace(/^#\s*/, '').trim());

const chapters = [];
let intro = { id: 0, title: 'المقدمة وتراجم الأبواب', stories: [] };
let current = intro;
let sc = 0;

function addStory(chapter, g) {
  const text = g.text;
  if (!text) return;
  sc += 1;
  if (g.type === 'heading') {
    chapter.stories.push({ id: sc, type: 'heading', title: text, content: '' });
  } else {
    const words = text.split(' ');
    const title = words.slice(0, 7).join(' ') + (words.length > 7 ? '…' : '');
    chapter.stories.push({ id: sc, type: 'text', title, content: text });
  }
}

for (const g of groups) {
  if (g.type === 'heading' && isBab(g.text)) {
if (current.stories.length) chapters.push(current);
chapters.forEach((c, i) => { c.id = i; });
    current = { id: chapters.length + 1, title: g.text, stories: [] };
    continue;
  }
  addStory(current, g);
}
if (current.stories.length) chapters.push(current);

const meta = {
  title: 'كتاب الأذكياء',
  author: 'الإمام ابن الجوزي (ت 597 هـ)',
  authorFull: 'جمال الدين أبو الفرج عبد الرحمن بن علي بن محمد الجوزي',
  description: 'أخبار الأذكياء وفطنتهم ودقائق حيلهم ورجاحة عقولهم',
  source: 'OpenITI — 0597IbnJawzi.Adhkiya (JK_000910)',
  babCount: chapters.length,
};

const out = { book: meta, chapters };
fs.writeFileSync('/tmp/adhkiya.json', JSON.stringify(out));

const totalStories = chapters.reduce((a, c) => a + c.stories.filter(s => s.type === 'text').length, 0);
console.log('chapters:', chapters.length);
console.log('total text stories:', totalStories);
console.log('json bytes:', fs.statSync('/tmp/adhkiya.json').size);
console.log('--- chapter list ---');
chapters.forEach(c => console.log(String(c.id).padStart(2), '(' + c.stories.filter(s => s.type === 'text').length + ' stories)', c.title.slice(0, 60)));
