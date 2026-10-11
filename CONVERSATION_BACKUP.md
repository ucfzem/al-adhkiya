# CONVERSATION BACKUP — projet « كتاب الأذكياء » (al-adhkiya)

## Résumé de la session

Création d'une **édition numérique statique** du *كتاب الأذكياء* d'Ibn al-Jawzi
(ت 597هـ), sur le **même modèle d'ergonomie** que *Nuzhat al-Mushtaq*, et son
ajout au **link tree** `ucfzem.github.io/works`.

## Décision de départ

- Point de départ : **les deux en parallèle** (données + interface).
- Hébergement : **GitHub Pages**, dépôt `ucfzem/al-adhkiya`.
- Règle absolue : **aucune invention de texte** — on n'utilise que le texte
  authentique d'OpenITI.

## Source des données (texte intégral authentique)

`OpenITI/release → data/0597IbnJawzi/0597IbnJawzi.Adhkiya/0597IbnJawzi.Adhkiya.JK000910-ara1`
(603 Ko, 4998 lignes, mARkdown).

### Structure du mARkdown décodée

- `#META# …` : en-tête de métadonnées, jusqu'à `#META#Header#End#`.
- Ligne commençant par `# ` = début de paragraphe.
- Ligne commençant par `~~` = continuité du paragraphe (sauts de ligne de l'imprimé).
- Ligne `# | …` = titre de section (les 33 أبواب sont marqués `# | الباب …`).
- Marqueurs **inline** à nettoyer : `PageVxxPyyy` et `msNNN`.

### Parsing

`tools/parse_adhkiya.mjs` → regroupe les paragraphes, découpe en chapitres à
chaque `# |` commençant par `الباب`. Résultat :

- **32 sections** = 1 مقدمة (تراجم الأبواب) + **31 باباً**.
- **669 anecdotes** (unités `text`).
- Sortie : `{ book:{…}, chapters:[{id,title,stories:[{id,type,title,content}]}] }`.

### Note philologique (fidélité)

- Cette copie **ne comporte pas** d'en-tête `# |` pour les **bāb 16**
  (من احتال بذكائه لبلوغ غرض) et **bāb 25** (طرف من حيل المحاربين) : leur matière
  reste donc rattachée à la section précédente. Signalé dans le footer du site.
- Anomalie d'édition : le **bāb 8** est intitulé « الباب الثاني » dans la source
  (fidèlement conservé).

## Fichiers du projet

```
index.html            # app complète (thème clair/sombre, A−/A/A+, recherche, lecture par باب)
all-adhkiya.js        # données embarquées : ADHKIYA_META + adhkiyaData (utilisé au runtime)
data/adhkiya.json     # mêmes données au format JSON
tools/parse_adhkiya.mjs
README.md
```

Ergonomie reprise de Nuzhat : `themeBoot` (clé `adhkiya_theme`), taille de police
(`adhkiya_font_size`), reprise de lecture (`adhkiya_last_chap`), copie du chapitre,
index + recherche instantanée sur le texte complet, impression.

## Déploiement

- Dépôt créé : **ucfzem/al-adhkiya** (GitHub Pages depuis la branche `gh-pages`).
- Push : `main` + `main:gh-pages`.
- Commit initial : `f68672b`.
- Site live : https://ucfzem.github.io/al-adhkiya/ (HTTP 200).

## Ajout au link tree (ucfzem.github.io)

Édition **chirurgicale** de `works/index.html` (aucun autre fichier touché) :

- Insertion dans **Projets publics** à la **position 9** (milieu de la liste,
  groupe patrimoine) : `🧠 Al-Adhkiya — tag "Adab" — newTab`.
- Renumérotation 9→18 des projets suivants ; compteur « 17 → 18 projets publics ».
- Mise à jour du **JSON-LD** `ItemList` (nouvelle position 9, décalage 9→21).
- Ajout du nom dans la `<meta name="description">`.
- Commit : `2b168e9`.

## Liens

- Site : https://ucfzem.github.io/al-adhkiya/
- Dépôt : https://github.com/ucfzem/al-adhkiya
- Link tree : https://ucfzem.github.io/works/
- Source : https://github.com/openiti/release (0597IbnJawzi.Adhkiya)

## Corréction du bāb 33 (fin du livre) — histoire du lion / loup / renard

**Symptôme** : les dernières anecdotes du livre étaient embrouillées : la réponse du renard
(« رأس الذئب النادر بين عيني ») manquait et la fin de la fable du lion avait été remplacée par
la fin de l'histoire du puits (« ...له فأخذ في التحيل فلاح له ضوء فنقب فخرج به إلى قضاء
فتخلص وخلصهما »).

**Cause** : feuillet mal relié dans la version imprimée (numéroté « 344 » au lieu de ~244),
intercalé entre les pages 242 et 243. OpenITI JK_000910 reproduit le défaut, comme Shamela 6938
et le site shamela.ws. L'ordre correct a été confirmé via islamicbook.ws (aladkia-002.html) et un
article d'al-Jazirah.

**Correctif dans `tools/parse_adhkiya.mjs`** : fonction `reconstructBab33()` qui réordonne
littéralement les mots d'OpenITI (aucune suppression ni ajout) pour rétablir l'ordre :
الأسد → قيل للذئب → الضب → المخاطب → الحدأة → البئر (avec son vrai tail) → أبو أيوب →
الضبع والظبية → الضبع والثعلب → وليمة الطائر.

**Vérifié** :
- Les 31 premiers chapitres restent identiques mot pour mot (JSON byte-identical) à la version
  déjà publiée.
- Seul le bāb 33 change : 669 → **672** anecdotes au total (éclatement des paragraphes mélangés).
- Le texte du lion se termine désormais «...قال رأس الذئب النادر بين عيني » et l'histoire du
  puits complète («...فحلفا له فأخذ في التحيل فلاح له ضوء فنقب فخرج به إلى قضاء فتخلص
  وخلصهما »).

## ضبط الكلمات المستعصية (تشكيل موجّه)

- النهج: تشكيل الكلمات المستعصية المختارة فقط (لا التشكيل الكامل الآلي؛ جرّبت Mishkal فظهر
  خطأه على النص التراثي: «قالِ»، «فَخُبُطِهِ»، «مُعَاوِيَةٍ» بتنوين كاذب، …).
- `tools/hard_words.mjs` — قاموس [كلمة مجردة → مشكولة]: 27 كلمة (أعلام نادرة: المعافي،
  الأصمعي، المرزباني، نعيم، ابن المبارك، القاسم، الحسين، زكريا، أيوب، الحارث، الأحنف…
  وألفاظ صعبة: فاندر، فانفتح، تخلل، فخبطه، أجهله، أقضاك، غدائك، لعشائك، فأفلت، فاختلسها،
  البادئ، المخاطب، الضب، الضبع، الحيلة). أُسقطت «أظلم» و«أشفيت» (متعددا القراءة) و«فأفلت»
  هُمّشت إلى فَأَفْلَتَ.
- `tools/apply_tashkeel.mjs` — يطبّق القاموس على الكامل (مع أداة الروابط و/ف/ال/ل/ب/ك),
  يعيد توليد العناوين، يكتب `data/adhkiya.json` + `all-adhkiya.js`، وينتج
  `tools/tashkeel_report.txt` (تقرير مراجعة بمواضع وعيّنات سياقية).
- **المراجعة**: روجعت كل المواضع؛ لا خطأ في العلامات؛ كل حالات الأعلام أسماء، والحِيلة
  بمعناها المعروف. 170 موضعًا للكلمات السبع والعشرين.
- `index.html`: البحث الآن يجرّد الحركات (يبحث «الأسد» فيجد «الْأَسَدِ»).
- كان الفصل 33 محسمًا سابقًا (ورق مقحم) — لا تُمسّ نتائجه.

## تصحيح عنوان البند 08 (الباب الثامن)

- كان العنوان في النص المصدر: «الباب الثاني في سياق المنقول من ذلك عن أصحاب نبيّا رضي الله عنهم
  أجمعين» — تكرار ناسخ للفظ «الباب الثاني»، و«نبيّا» نقصٌ عن «نبيّنا».
- صُحّح **في العنوان فقط** (لم يُمسّ متن الكتاب): «الباب الثامن في سياق المنقول من ذلك عن
  أصحاب نبيّنا رضي الله عنهم أجمعين»، على نسق الباب السابع («عن نبينا صلى الله عليه وسلم»).
- الوضع: data/adhkiya.json + all-adhkiya.js (فصل id=8)، وتحدّث README ومفكّرة الجلسة.
- المعروف أن الفهرس «08» في الموقع يعرض العنوان المصحح تلقائيًا لأنه مبني من البيانات.

## تصويب تالٍ — العنوان القطعي للبند 08 حسب الطبوعات المحققة

- المستخدم صحّح: العنوان الصحيح والدقيق عند ابن الجوزي لم يكن «الباب الثامن»، بل:
  «الباب الثاني: في سياق المنقول من فطنة أصحاب نبيّنا رضي الله عنهم أجمعين»
  (الرقم «الثاني» ثابت في المخطوطات، فيتكرّر في ترقيم الكتاب مع الباب الثاني الأول).
- الخطآن الوحيدان الحقيقيان في عبارة المصدر:
  1) «أصحاب نبيّا» ← «أصحاب نبيّنا» (سقطت نون).
  2) «المنقول من ذلك» ← «المنقول من فطنة» (تبويب على موضوع الكتاب؛ وبعض النسخ تختصر «من ذلك»).
- طُبّق في data/adhkiya.json + all-adhkiya.js (فصل id=8)، وحُدّث README والمفكرة.
- نُكرّ البيان السابق («الثامن») — ملغى.

## جلسة أخيرة — التشكيل الموجّه، الباب 8، التدقيق، المزايا (2026-10-11)

### 1) تصحيح ذيل الباب 33 (نُشر سابقاً، commit e04eaa5)
قصة الأسد/الذئب/الثعلب + قصة البئر أعيد ترتيب نصّهما حرفياً (ورق مقحم 344 بين 242 و243).
الأسد يختم «...قال رأس الذئب النادر بين عيني»، والبئر بخاتمها «...فحلفا له فأخذ في
التحيل فلاح له ضوء فنقب فخرج به إلى قضاء فتخلص وخلصهما». 669→672 قصة.

### 2) ضبط الكلمات المستعصية (commit 2633241)
- جرّبت Mishkal (حزمة بايثون) فجلا أخطاءه على النص التراثي (قالِ، فَخُبُطِهِ،
  مُعَاوِيَةٍ بتنوين الكسر، أَسَدًّا…) — رُفض للتشكيل الكامل.
- النهج المعتمد: تشكيل موجّه لكلمات مختارة فقط (أعلام نادرة + ألفاظ ملتبسة).
  `tools/hard_words.mjs` (27 كلمة) → `tools/apply_tashkeel.mjs` يطبّقها في كامل النص
  (مع تجريد الروابط و/ف/ال/ل/ب/ك)، ويولّد `tools/tashkeel_report.txt` للمراجعة.
- **المراجعة**: روجعت كل المواضع (170 موضعاً، 27 كلمة)؛ لا خطأ. أُسقطت «أظلم»
  «أشفيت» (متعددتا القراءة) و«فأفلت»› فَأَفْلَتَ.
- `index.html`: البحث يجرّد الحركات.

### 3) العنوان القطعي للباب 8 (commits b1bf029 ثم 103848b)
المستخدم دلّ على العنوان الصحيح في الطبوعات المحققة:
«الباب الثاني: في سياق المنقول من فطنة أصحاب نبيّنا رضي الله عنهم أجمعين»
(الرقم «الثاني» ثابت؛ تصححان: نبيا→نبيّنا، من ذلك→فطنة). طُبّق بالعنوان فقط.

### 4) تدقيق تسلسل الصفحات في كامل المصدر
لا اضطراب آخر في ترتيب الصفحات (5→245) سوى الورقة 242→344→243 المعالجة. المتن سليم.

### 5) مزايا جديدة (commit e69e8fb)
- زرّ «🔊 استمع» في عرض الباب: قراءة صوتية كاملة للباب عبر Web Speech API (عربي).
- البحث متسامح مع الهمزات والتاء/الهاء والياء/الألف (normAr).

### الروابط والـ commits النهائية
- الموقع: https://ucfzem.github.io/al-adhkiya/
- المستودع: https://github.com/ucfzem/al-adhkiya
- شجرة الروابط: https://ucfzem.github.io/works/
- commits: f68672b (init)، 2b168e9/71557ae/d3ae1e3 (link tree + backups)،
  e04eaa5 (باب 33)، 2633241 (التشكيل)، b1bf029→103848b (الباب 8)، e69e8fb (المزايا).
- آخر commit: e69e8fb على main و gh-pages.

## توسعة التشكيل + الصوت الاحتياطي (2026-10-11)
- أُضيفت أعلام ثابتة النطق (اللَّه ×801، مُحَمَّد ×191، الْحَسَن ×78، الحسوس…): المجموع
  من 170 إلى **≈1919 موضعاً (~63 كلمة)**؛ التحقق: كل «عَلِيّ» متبوعة بـ«بن/ابن»
  (43)، والظرف الشعري «فلعليّ أعي» بقي نُع؛ «يحيى» كلها أسماء.
- قاعدة أمان: «علي» لا تُشكَّل اسماً إلا أتبع بـ«بن/ابن»؛ وإلا تُرجَع مجردة.
- إعادة التشغيل أمينة/دولابية (تُجرد الحروف من علاماتها قبل البحث).
- الصوت: زر «🔊 استمع» لكل قصة + للباب. الباب: Web Speech أولاً أخذاً باللاحق
  للوسيلة؛ القصة: دائماً عبر ملف صوتي (translate_google, audio/mpeg) فيعمل على
  الآيفون والأندرويد حين لا توجد أصوات عربية مثبتة. دفعات ≤180 حرف؛ وقف شائع.
commit c90785d→(قادم).

## منع سكتة الصوت بعد التقييد (2026-10-11)
- ظاهرة «يعمل ثم يسكت» = تقييد واجهة الترجمة بعد عدة طلبات متتالية من الجهاز.
- الحل: (1) ترويسة بفاصل زمني بين المقاطع، (2) تبادل نسختي الواجهة tw-ob / gtx،
  (3) إعادة محاولة لكل مقطع حتى مرتين، (4) بعد 3 فشل متتابعين: توقف ورسالة واضحة
  «الخدمة قيّدت الجهاز مؤقتاً؛ انتظر دقيقة»، (5) رقيب في الصوت النظامي: إن لم يبدأ
  مقطع خلال ثانيتين يُحوَّل الباقي تلقائياً للوسيلة.
