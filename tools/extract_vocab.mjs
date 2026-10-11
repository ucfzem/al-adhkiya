import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/adhkiya.json'), 'utf8'));

const freq = new Map();
const strip = (s) => s.replace(/[\u0610-\u061A\u0640\u064B-\u065F\u0670]/g, '');

for (const ch of data.chapters) {
  for (const st of ch.stories) {
    const words = st.content.split(/[^\u0600-\u06FF]+/).filter((w) => w.length > 1);
    for (const w of words) {
      const bare = strip(w);
      freq.set(bare, (freq.get(bare) || 0) + 1);
    }
  }
}

const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
console.log('عدد الكلمات المميزة:', sorted.length);
let out = '';
for (const [w, n] of sorted) out += `${w}\t${n}\n`;
fs.writeFileSync('/tmp/vocab_adk.txt', out);
console.log('كتبت /tmp/vocab_adk.txt — أعلى 40 ظهورًا:');
for (const [w, n] of sorted.slice(0, 40)) console.log(`${String(n).padStart(5)}  ${w}`);