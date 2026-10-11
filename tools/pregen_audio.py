#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""توليد ملفات صوتية لكل قصة عبر gTTS (Google) — قابلة للاستئناف.
يُنشئ audio/<story>_<k>.mp3 + audio/manifest.js.
الاستخدام: pregen_audio.py [الحد الأقصى للدقائق] [عدد التزامن]
"""
import json, os, re, sys, time, concurrent.futures, random
from gtts import gTTS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, 'audio')
if not os.path.isdir(AUDIO):
    os.makedirs(AUDIO)

DIAC = re.compile('[\u0610-\u061A\u0640\u064B-\u065F\u0670]')
MARK = re.compile('@[0-9A-Za-z]+@')
def clean(s):
    t = DIAC.sub('', s)
    t = MARK.sub(' ', t)
    t = t.replace('%', ' ').replace('(', ' ').replace(')', ' ')
    return re.sub(r'\s+', ' ', t).strip()

def chunks_of(text, lim=180):
    out, cur = [], ''
    for w in text.split(' '):
        nx = cur + ' ' + w if cur else w
        if len(nx) > lim and cur:
            out.append(cur); cur = w
        else:
            cur = nx
    if cur:
        out.append(cur)
    return out

def main():
    minutes = int(sys.argv[1]) if len(sys.argv) > 1 else 11
    workers = int(sys.argv[2]) if len(sys.argv) > 2 else 4
    deadline = time.time() + minutes * 60

    data = json.load(open(os.path.join(ROOT, 'data/adhkiya.json')))
    tasks = []
    for ch in data['chapters']:
        for st in ch['stories']:
            if st['type'] != 'text' or not st['content']:
                continue
            text = clean(st['content'])
            if not text:
                continue
            for k, t in enumerate(chunks_of(text)):
                tasks.append((st['id'], k, t))

    done = 0
    for s, k, _ in tasks:
        if os.path.exists(os.path.join(AUDIO, '%d_%d.mp3' % (s, k))):
            done += 1
    print('مهام:', len(tasks), '| منجزة:', done, f'| متبقية: {len(tasks) - done}')
    todo = [t for t in tasks
            if not os.path.exists(os.path.join(AUDIO, '%d_%d.mp3' % (t[0], t[1])))]

    def gen(t):
        sid, k, text = t
        path = os.path.join(AUDIO, '%d_%d.mp3' % (sid, k))
        tmp = path + '.part'
        gTTS(text=text, lang='ar', slow=False).save(tmp)
        os.replace(tmp, path)
        return 1

    started = time.time()
    err = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(gen, t): t for t in todo}
        i = 0
        for fut in concurrent.futures.as_completed(futs):
            if time.time() > deadline:
                for f in futs:
                    f.cancel()
                break
            try:
                fut.result()
                done += 1
                err = 0
            except Exception as e:
                sid, k, _ = futs[fut]
                err += 1
                print('فشل', sid, k, repr(e)[:90], flush=True)
                # أعد الجدولة بظهر خلفي
                if err <= 8:
                    time.sleep(20 * err)
                    if time.time() < deadline:
                        futs[ex.submit(gen, futs[fut])] = futs[fut]
            i += 1
            if i % 50 == 0:
                print('...', i, 'محاولة | منجزة:', done, f'| {time.time() - started:.0f}s', flush=True)

    # تحديث manifest
    manifest = {}
    for sid in sorted(set(t[0] for t in tasks)):
        files = ['audio/%d_%d.mp3' % (sid, k)
                 for k in sorted(k for (s_, k, _) in tasks if s_ == sid
                                 and os.path.exists(os.path.join(AUDIO, '%d_%d.mp3' % (sid, k))))]
        if files:
            manifest[str(sid)] = files
    with open(os.path.join(ROOT, 'audio', 'manifest.js'), 'w') as f:
        f.write('// ملف صوتي منتج آلياً عبر gTTS — استُضيف محلياً\n')
        f.write('const ADHKIYA_AUDIO = ' + json.dumps(manifest, ensure_ascii=False) + ';\n')
    print('منجزة نهائياً:', done, f'| إجمالي {len(tasks)} | قصص لها صوت: {len(manifest)}')

if __name__ == '__main__':
    main()