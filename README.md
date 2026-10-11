# كتاب الأذكياء — ابن الجوزي

Édition numérique statique (mobile-first, RTL) du **كتاب الأذكياء** de l'Imam Ibn al-Jawzi (ت 597هـ),
sur le même modèle d'ergonomie que *Nuzhat al-Mushtaq*.

- **Recherche instantanée** dans le texte complet (32 sections, 669 anecdotes).
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

### Note philologique

Cette copie ne comporte pas d'en-tête autonome pour les **bāb 16** (من احتال بذكائه لبلوغ غرض)
et **bāb 25** (طرف من حيل المحاربين) ; leur matière est donc restée rattachée à la section
précédente. La numérotation de l'édition présente une anomalie au **bāb 8**, intitulé
« الباب الثاني » dans le texte source (fidèlement conservé).

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
