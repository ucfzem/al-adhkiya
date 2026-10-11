# كتاب الأذكياء — ابن الجوزي

Édition numérique statique (mobile-first, RTL) du **كتاب الأذكياء** de l'Imam Ibn al-Jawzi (ت 597هـ),
sur le même modèle d'ergonomie que *Nuzhat al-Mushtaq*.

- **Recherche instantanée** dans le texte complet (32 sections, 672 anecdotes).
- **Navigation par chapitres** (باب) avec dépliage des anecdotes.
- **Typographie réglable** : Amiri pour le corps, Cairo pour l'interface ; A− / A / A+.
- **Mode sombre / clair** persistant ; reprise de la dernière lecture.
- Copie du chapitre, index complet, impression.

## Données

Le texte est le **texte intégral authentique** issu d'OpenITI, *sans aucune invention* :
`OpenITI/release → data/0597IbnJawzi/0597IbnJawzi.Adhkiya/...JK000910-ara1`.

- `all-adhkiya.js` — données embarquées (`ADHKIYA_META` + `adhkiyaData`), utilisées au runtime.
- `data/adhkiya.json` — les mêmes données au format JSON.
- `tools/parse_adhkiya.mjs` — le parseur mARkdown → `{book, chapters[{stories[]}]}`.
- `tools/apply_tashkeel.mjs` — étape 2 du pipeline (après parse) : vocalise les mots
  « مستعصية » choisis (dictionnaire `tools/hard_words.mjs`) et régénère les données.
- `tools/tashkeel_report.txt` — rapport de vérification : chaque mot vocalisé, son nombre
  de positions, et un échantillon contextuel.

### Tashkeel (ضَبْط) des mots difficiles

Les mots « المستعصية » choisis laborieusement (aʿlām rares ou ambigus, mots dont la
lecture est piégeuse) sont vocalisés dans tout le texte, ainsi que les aʿlām usuels à
vocalisation stable (اللَّه، مُحَمَّد، عُثْمَان، عَمْرُو، إِبْرَاهِيم…) — **≈1 919
positions, ~63 mots**, existant littéralement dans le texte (vocalisés de façon
idiomatique, sans invention). Règle de sécurité : « عليّ » n'est vocalisé en nom que
s'il est suivi de « بن/ابن » (le « عَلَيَّ » prépositionnel reste nu). La lecture
d'ensemble du livre reste non-vocalisée ; seuls les mots choisis portent leurs marques,
selon la coutume d'édition classique. La **recherche ignore les signes** (taper « الأسد »
trouve « الْأَسَدِ ») et les hamzas (أ/إ/آ/ؤ/ئ).

### Note philologique

Cette copie ne comporte pas d'en-tête autonome pour les **bāb 16** (من احتال بذكائه لبلوغ غرض)
et **bāb 25** (طرف من حيل المحاربين) ; leur matière est donc restée rattachée à la section
précédente. Le **bāb 8** porte dans le texte source l'intitulé « الباب الثاني » (erreur du copiste :
le numéro « الثاني » y revient par-deux fois). Son titre a été **corrigé en « الباب الثامن »** pour
suivre l'ordre du livre (le corps du texte reste intact), avec deux leçons matérielles du titre :
« أصحاب نبيّا » ➔ « أصحاب نبيّنا » (نون سقطت) et « المنقول من ذلك » ➔ « المنقول من فطنة »
(conformément au thème du livre), soit :
« الباب الثامن: في سياق المنقول من فطنة أصحاب نبيّنا رضي الله عنهم أجمعين ».

Dans ce même bāb 8, le vers d'Ibn Rawāḥah a été corrigé selon les deux Ṣaḥīḥ (البخاري ١١٥٥) :
« ببيت يجافي جنبه على فراشه » ➔ « يبيت يجافي جنبه عن فراشه » (simple coquille de copiste). Une
petite note de **تخريج** a été ajoutée en fin de bāb : les vers sont dans le Ṣaḥīḥ al-Bukhārī (n° 1155,
via Abū Hurayra, صحيح) ; en revanche l'anecdote de la jāriya et du couteau est rapportée par
al-Dāraquṭnī (منقطعة / مرسلة, pas dans les deux Ṣaḥīḥ).

**باب 33 (fin du livre)** : dans la version imprimée, un feuillet mal relié (numéroté « 344 »,
pour ~244) se trouve intercalé entre les pages 242 et 243 ; la copie OpenITI — comme Shamela
6938 — reproduit ce défaut, ce qui a brisé en fin de volume l'ordre des anecdotes (le lion/loup/
renard, qīla lil-dhiʾb, le ḍabb, le mukhāṭab, la hadāʾ, le puits, Abu Ayyūb, les deux ḍabbīʿ).
L'ordre correct — vérifié sur l'édition islamicbook.ws (aladkia-002) et un article d'al-Jazīrah —
a été rétabli dans `tools/parse_adhkiya.mjs` en **réordonnant littéralement les mots d'OpenITI,
sans aucune suppression ni ajout** (la réponse du renard se lit désormais « رأسُ الذئبِ النادرِ
بينَ عيني »).

## Structure

```
index.html          # application complète (thème, recherche, lecture)
all-adhkiya.js      # données (embarquées)
data/adhkiya.json   # données (JSON)
tools/parse_adhkiya.mjs
```

## Source & licence du texte

Texte : Ibn al-Jawzi, *Kitāb al-Adhkiyāʾ*, copie OpenITI JK_000910. L'interface est réutilisée
de l'édition Nuzhat al-Mushtaq.
