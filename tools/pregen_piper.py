#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""توليد صوت القصص عبر Piper (ar_JO-kareem-medium) — محرك عصبي محلي بلا حجب.
- يحوّل المقاطع إلى MP3 (22050Hz/أحادي/32kbps) بواسطة imageio-ffmpeg.
- مستأنف: يتخطى الملفات الموجودة إلا مع --force.
- يكتب audio/manifest.js مع بصمة إصدار في روابط URL لتجاوز كاش المتصفح.
الاستخدام: pregen_piper.py [عدد العاملين] [--force]
"""
import os, re, sys, time, json, wave, subprocess, concurrent.futures

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, 'audio')
BUILD = '20261011f'
MODEL = '/tmp/piperv/ar_JO-kareem-medium.onnx'
FFMPEG = ('/tmp/ttsvenv/lib/python3.11/site-packages/imageio_ffmpeg/binaries/'
          'ffmpeg-linux-aarch64-v7.0.2')

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
    return out or ['']

from piper import PiperVoice

_voice = None
def init_worker():
    global _voice
    if _voice is None:
        _voice = PiperVoice.load(MODEL)

def to_mp3(wav_bytes, sr, sw, out_path):
    tmp = out_path + '.wav'
    w = wave.open(tmp, 'wb')
    w.setnchannels(1); w.setsampwidth(sw); w.setframerate(sr)
    w.writeframes(wav_bytes); w.close()
    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-i', tmp,
                    '-ac', '1', '-ar', '22050', '-b:a', '32k',
                    '-c:a', 'libmp3lame', '-f', 'mp3', out_path],
                   check=True)
    os.remove(tmp)

def gen(task):
    sid, k, text = task
    path = os.path.join(AUDIO, '%d_%d.mp3' % (sid, k))
    tmp = path + '.part'
    buf = bytearray(); sw = 2; sr = 22050
    for c in _voice.synthesize(text):
        sw = c.sample_width; sr = c.sample_rate
        buf += c.audio_int16_bytes
    to_mp3(bytes(buf), sr, sw, tmp)
    os.replace(tmp, path)
    return (sid, k)

def write_manifest(tasks_by_story):
    m = {}
    for sid, keys in tasks_by_story.items():
        m[sid] = ['audio/%d_%d.mp3?v=%s' % (sid, k, BUILD) for k in sorted(keys)]
    with open(os.path.join(AUDIO, 'manifest.js'), 'w', encoding='utf-8') as f:
        f.write('// صوت منتج آلياً عبر Piper ar_JO-kareem-medium — استُضيف محلياً\n')
        f.write('const ADHKIYA_AUDIO = ' + json.dumps(m, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('manifest.js:', len(m), 'قصة')

def main():
    force = '--force' in sys.argv
    workers = 4
    for a in sys.argv[1:]:
        if a.isdigit():
            workers = int(a)

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

    keys_by_story = {}
    for sid, k, _ in tasks:
        keys_by_story.setdefault(sid, set()).add(k)

    todo = [t for t in tasks if force or not
            os.path.exists(os.path.join(AUDIO, '%d_%d.mp3' % (t[0], t[1])))]
    print('مهام:', len(tasks), '| ستُولّد:', len(todo), ('' if force else '(باقي فقط)'))

    ok = 0; err = 0
    t0 = time.time()
    init_worker()
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(gen, t): t for t in todo}
        for fut in concurrent.futures.as_completed(futs):
            try:
                sid, k = fut.result()
                ok += 1
                if ok % 100 == 0:
                    print('منجزة %d بنسبة %.0f%% (%.0fs)' % (ok, 100*ok/max(len(todo),1), time.time()-t0), flush=True)
            except Exception as e:
                err += 1
                print('فشل', futs[fut][0], futs[fut][1], repr(e)[:80], flush=True)

    write_manifest(keys_by_story)
    print('تم:', ok, 'أخطاء:', err, 'في %.0fs' % (time.time()-t0))

if __name__ == '__main__':
    main()