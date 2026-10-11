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
