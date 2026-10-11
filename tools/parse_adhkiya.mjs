import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const raw = fs.readFileSync(path.join(HERE, 'source.mARkdown'), 'utf8');

function cleanText(s) {
  return s
    .replace(/PageV\d+P\d+/g, ' ')
    .replace(/\bms\d+g?\b/g, ' ')
    .replace(/@[0-9A-Za-z]+@/g, ' ')
    .replace(/~~/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

//
// إعادة بناء ذيل الباب الثالث والثلاثون (نهاية الكتاب).
//
// في النسخة المطبوعة وُضع ورقٌ مقحمٌ في غير موضعه بين الصفحتين 242 و 243، فانكسر
// ترتيبُ الأخبار عند نهاية الكتاب: ابتدأ خبر «الأسد والذئب والثعلب» ثم أُقحم في
// مقطعه ذيلُ خبر «البئر» وخبرُ «أبي أيوب المرزباني» وخبرا «الضبع»، بينما بقيت
// تتمة خبر الأسد (الجواب «رأس الذئب النادر بين عيني») عالقةً بعدهم.
//
// نعيد هنا ترتيبَ النص عينه وفق المطبوعة الصحيحة (مقابلاً بطبعة islamicbook.ws):
// قصة الأسد، ثم قيل للذئب، ثم الضب، ثم المخاطب، ثم الحدأة، ثم البئر بتمامها،
// ثم أبو أيوب، ثم الضبع والظبية، ثم الضبع والثعلب، ثم وليمة الطائر —
// دون حذف أو زيادة أي لفظ من نص المصدر.
//
function splitExact(line, sep, label) {
  const i = line.indexOf(sep);
  if (i < 0) throw new Error('reconstructBab33: فاصل مفقود — ' + label);
  return [line.slice(0, i), line.slice(i + sep.length)];
}

function reconstructBab33(lines) {
  const lionIdx = lines.findIndex((l) => l.startsWith('# ') && l.includes('حدثنا المعافي'));
  const birdIdx = lines.findIndex((l, i) => i > lionIdx && l.startsWith('# ') && l.includes('أولم طائر'));
  if (lionIdx < 0 || birdIdx < 0) throw new Error('reconstructBab33: مفاتيح الكتلة مفقودة');
  const b = lines.slice(lionIdx, birdIdx);

  const abuIdx = b.findIndex((l) => l.startsWith('# ') && l.includes('أبو أيوب المرزباني'));
  const dzIdx = b.findIndex((l) => l.startsWith('# ') && l.includes('ورأت الضبع ظبية'));
  const hfIdx = b.findIndex((l) => l.startsWith('# ') && l.includes('وصادت الضبع ثعلبا'));
  const mukhIdx = b.findIndex((l) => l.startsWith('# ') && l.includes('حدث المخاطب'));
  const wellIdx = b.findIndex((l) => l.startsWith('# ') && l.includes('كان رجل في صحراء'));
  for (const [name, i] of [['أبو أيوب', abuIdx], ['الضبع والظبية', dzIdx], ['الضبع والثعلب', hfIdx], ['المخاطب', mukhIdx], ['البئر', wellIdx]]) {
    if (i < 0) throw new Error('reconstructBab33: خبر مفقود — ' + name);
  }  const [lionDiv2, wellTail4] = splitExact(b[2], ' PageV01P242 ', 'قسمة الأسد');
  const [hyenaHead, lionMid23] = splitExact(b[hfIdx + 2], ' فأفلت الثعلب', 'حيلة الضبع');
  const [lionEnd28, wisdom29] = splitExact(b[hfIdx + 6], ' وذكر الحكماء', 'جواب الأسد');
  const [qilEnd30, dabbStart30] = splitExact(b[hfIdx + 8], ' وذكر أبو هلال العسكري', 'قيل للذئب');
  const [mukhEnd38, hadahStart38] = splitExact(b[mukhIdx + 2], ' قالوا وصادت حدأة', 'المخاطب');
  const [wellEnd46] = splitExact(b[wellIdx + 4], ' PageV01P243', 'البئر');

  const noPfx = (s) => s.replace(/^# /, '').replace(/^~~/, '');
  const cont = (s) => '~~' + noPfx(s).trim();
  const par = (s) => '# ' + noPfx(s).trim();

  const lion = [
    b[0],
    b[1],
    lionDiv2,
    cont('معاوية ' + b[hfIdx + 3]),
    b[hfIdx + 4],
    b[hfIdx + 5],
    lionEnd28,
  ];
  const qil = [
    par(wisdom29),
    b[hfIdx + 7],
    qilEnd30,
  ];
  const dabb = [
    par(dabbStart30),
    b[hfIdx + 9],
    b[hfIdx + 10],
    b[hfIdx + 11],
    b[hfIdx + 12],
    b[hfIdx + 13],
  ];
  const mukh = [
    b[mukhIdx],
    b[mukhIdx + 1],
    mukhEnd38,
  ];
  const hadah = [
    par(hadahStart38),
    b[mukhIdx + 3],
    b[mukhIdx + 4],
    b[mukhIdx + 5],
  ];
  const well = [
    b[wellIdx],
    b[wellIdx + 1],
    b[wellIdx + 2],
    b[wellIdx + 3],
    wellEnd46,
    cont(wellTail4 + ' ' + noPfx(b[3])),
  ];
  const abu = [b[abuIdx], ...b.slice(abuIdx + 1, dzIdx)];
  const dz = [b[dzIdx], ...b.slice(dzIdx + 1, hfIdx)];
  const dbt = [b[hfIdx], b[hfIdx + 1], hyenaHead];

  const fixed = [...lion, ...qil, ...dabb, ...mukh, ...hadah, ...well, ...abu, ...dz, ...dbt];
  return [...lines.slice(0, lionIdx), ...fixed, ...lines.slice(birdIdx)];
}

const lines = reconstructBab33(raw.split('\n'));

const groups = [];
let cur = null;
const push = () => { if (cur && cur.parts.some((p) => p.trim())) groups.push(cur); };

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

// عناوين مصححة بموجب طبوعات محققة (تُعيد إعادةُ البناء إنتاجَها دائماً):
// الباب الثامن: العنوان في المصدر «الباب الثاني…» (خطأ ناسخ) — عُدّل إلى «الثامن» ليطابق
// ترتيب الكتاب، مع تصحيحين: «نبيا» → «نبيّنا» (نون ساقطة) و«المنقول من ذلك» → «المنقول من فطنة».
const TITLE_FIXES = {
  8: 'الباب الثامن: في سياق المنقول من فطنة أصحاب نبيّنا رضي الله عنهم أجمعين',
};
for (const ch of chapters) {
  if (ch.title && TITLE_FIXES[ch.id] !== undefined) ch.title = TITLE_FIXES[ch.id];
}

const meta = {
  title: 'كتاب الأذكياء',
  author: 'الإمام ابن الجوزي (ت 597 هـ)',
  authorFull: 'جمال الدين أبو الفرج عبد الرحمن بن علي بن محمد الجوزي',
  description: 'أخبار الأذكياء وفطنتهم ودقائق حيلهم ورجاحة عقولهم',
  source: 'OpenITI — 0597IbnJawzi.Adhkiya (JK_000910)',
  babCount: chapters.length,
};

const out = { book: meta, chapters };
fs.writeFileSync(path.join(ROOT, 'data/adhkiya.json'), JSON.stringify(out));

const js = [
  '// بيانات كتاب الأذكياء — ابن الجوزي (ت 597هـ)',
  '// المصدر: OpenITI 0597IbnJawzi.Adhkiya (JK_000910) — نص حرفي، بلا اختلاق.',
  '// أُعيد ترتيب ذيل الباب الثالث والثلاثون (ورق مقحم في المطبوع) وفق المطبوعة',
  '// الصحيحة، بنفس ألفاظ المصدر دون حذف أو زيادة (انظر tools/parse_adhkiya.mjs).',
  'const ADHKIYA_META = ' + JSON.stringify(out.book) + ';',
  '',
  'const adhkiyaData = ' + JSON.stringify(out.chapters) + ';',
].join('\n');
fs.writeFileSync(path.join(ROOT, 'all-adhkiya.js'), js);

const totalStories = chapters.reduce((a, c) => a + c.stories.filter((s) => s.type === 'text').length, 0);
console.log('chapters:', chapters.length);
console.log('total text stories:', totalStories);
console.log('--- chapter 33 stories ---');
const c33 = chapters[chapters.length - 1];
c33.stories.forEach((s) => console.log(String(s.id).padStart(3), s.type === 'heading' ? '[HEAD]' : '      ', s.title.slice(0, 60)));