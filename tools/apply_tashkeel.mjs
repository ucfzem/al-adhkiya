import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HARD_WORDS } from './hard_words.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/adhkiya.json'), 'utf8'));

const DIACRITICS = /[\u0610-\u061A\u0640\u064B-\u065F\u0670]/g;
const AR = /[\u0600-\u06FF]+/g;
const strip = (s) => s.replace(DIACRITICS, '');
const WORD = /^[\u0600-\u06FF]+$/;

const map = new Map(HARD_WORDS.map(([b, v]) => [b, v]));

function candidates(tok) {
  const out = [[strip(tok), '']];
  let rest = tok;
  let pre = '';
  for (;;) {
    let chop = null;
    for (const p of ['ال', 'و', 'ف', 'ل', 'ب', 'ك']) {
      if (rest.startsWith(p) && rest.length > p.length) { chop = p; break; }
    }
    if (!chop) break;
    rest = rest.slice(chop.length);
    pre += chop;
    out.push([strip(rest), pre]);
  }
  return out;
}

function applyAlong(seg) {
  if (!WORD.test(seg)) return seg;
  for (const [bare, pre] of candidates(seg)) {
    const voc = map.get(bare);
    if (voc !== undefined) return { fixed: pre + voc, key: bare };
  }
  return { fixed: seg, key: null };
}

const hits = new Map();
for (const [b] of HARD_WORDS) hits.set(b, { count: 0, samples: [] });

for (const ch of data.chapters) {
  for (const st of ch.stories) {
    if (st.type !== 'text' || !st.content) continue;
    st.content = st.content.replace(AR, (m) => {
      const { fixed, key } = applyAlong(m);
      if (key) {
        const rec = hits.get(key);
        rec.count++;
        if (rec.samples.length < 4) {
          const i = st.content.indexOf(m);
          rec.samples.push({ chap: ch.title, ctx: st.content.slice(Math.max(0, i - 55), i + 55 + m.length) });
        }
      }
      return fixed;
    });
    const words = st.content.split(' ');
    st.title = words.slice(0, 7).join(' ') + (words.length > 7 ? '…' : '');
  }
}

const total = [...hits.values()].reduce((a, h) => a + h.count, 0);

let report = '# تقرير ضبط الكلمات المستعصية — كتاب الأذكياء\n';
report += 'إجمالي المواضع المُضبطة: ' + total + '\n';
for (const [bare, v] of HARD_WORDS) {
  const h = hits.get(bare);
  report += '\n◆ ' + bare + ' → ' + v + '   (' + h.count + ' موضع)\n';
  if (!h.count) { report += '   (لا مواضع في النص)\n'; continue; }
  for (const s of h.samples) report += '   ▪ ' + s.chap + ' — …' + s.ctx + '…\n';
}
fs.writeFileSync(path.join(ROOT, 'tools/tashkeel_report.txt'), report);

data.book.tashkeel = 'ضُبطت الكلمات المستعصية المختارة في كامل النص؛ عدد المواضع: ' + total;
fs.writeFileSync(path.join(ROOT, 'data/adhkiya.json'), JSON.stringify(data));

const js = [
  '// بيانات كتاب الأذكياء — ابن الجوزي (ت 597هـ)',
  '// المصدر: OpenITI 0597IbnJawzi.Adhkiya (JK_000910) — نص حرفي، بلا اختلاق.',
  '// الكلمات المستعصية مشكولة (انظر tools/hard_words.mjs + tools/tashkeel_report.txt).',
  'const ADHKIYA_META = ' + JSON.stringify(data.book) + ';',
  '',
  'const adhkiyaData = ' + JSON.stringify(data.chapters) + ';',
].join('\n');
fs.writeFileSync(path.join(ROOT, 'all-adhkiya.js'), js);

const tot = data.chapters.reduce((a, c) => a + c.stories.filter((s) => s.type === 'text').length, 0);
console.log('قصص النصوص:', tot);
console.log('مواضع مضبطة:', total);
for (const [b, v] of HARD_WORDS) {
  const h = hits.get(b);
  if (h.count) console.log('   ' + b + ' → ' + v + '  ×' + h.count);
}