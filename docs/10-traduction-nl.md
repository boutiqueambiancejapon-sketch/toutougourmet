# Traduction FR → NL-BE — procédure quotidienne

> Miroir néerlandais de Belgique, périmètre blog. Architecture décidée le 2026-09-14, cf. DECISIONS.md.
> Avant d'écrire la première ligne de néerlandais : charger `.claude/skills/boileau-nl/SKILL.md`.

## 1. Choisir l'article du jour

```bash
node scripts/translation-queue.mjs --status          # couverture globale
node scripts/translation-queue.mjs --next 2          # les 2 suivants à traduire
node scripts/translation-queue.mjs --next 5 --category urgences
```

La file trie par date de publication FR décroissante : les sujets les plus récents
d'abord, ce sont ceux dont les sources sont les plus fraîches.

## 2. Créer le fichier

```bash
node scripts/translation-queue.mjs \
  --scaffold chien-peut-manger-fromage \
  --slug mag-mijn-hond-kaas-eten
```

Le script écrit `content/nl/blog/mag-mijn-hond-kaas-eten.mdx` avec :

- le frontmatter correct (`translationOf`, `categorySlug` et `category` en **FR** — volontaire, cf. §4)
- `draft: true`
- le corps français, comme base de réécriture

Le slug NL se choisit sur la requête que taperait un Belge, pas sur la traduction
du slug FR. `mag-mijn-hond-kaas-eten`, pas `hond-kan-kaas-eten`.

## 3. Traduire

Charger le skill `boileau-nl`, puis réécrire le corps. Ce n'est pas une traduction
mot à mot : l'article FR est un brief. Les trois pièges qui reviennent le plus :

- **Organismes français** — CNITV, CAPAE-Ouest, ANSES, AFSCA n'existent pas pour un
  lecteur belge néerlandophone. En NL-BE : FAVV, Antigifcentrum. `AFSCA` est
  l'acronyme français du FAVV, `NVWA` est l'agence néerlandaise — ni l'un ni l'autre.
- **Liens internes FR** — `/quiz`, `/comparateur`, `/chien/marque/…` ne sont pas
  traduits. On retire le lien et on garde l'information en clair.
- **Typographie** — pas d'espace avant `? : ; !`, pas de `« »`.

Ce qui traverse intact : doses, citations d'études (auteur, année, journal), noms
de molécules, noms de marques.

## 4. Pourquoi trois champs restent en français

```yaml
translationOf: "chien-peut-manger-fromage"  # pilote les hreflang réciproques ET la cover
categorySlug: "fruit"                       # clé canonique, l'URL NL en dérive
category: "Alimentation"                    # clé de CATEGORY_TABLE
```

Le mapping slug d'article → illustration (`getArticleSlot`) et la table des
couleurs de catégorie (`CATEGORY_TABLE`) sont indexés sur le FR. Traduire ces
trois champs fait tomber la cover et l'image Open Graph sur le fallback
`cat-nutrition` — un bug visuel silencieux.

L'URL publique, elle, est bien en néerlandais : `data/nl-categories.json` fait la
conversion `categorySlug` FR → segment NL. Ce fichier est lu à la fois par
`lib/i18n/categories.ts` (rendu) et par les scripts `.mjs` (indexation, file de
traduction) — une seule source, pas de dérive.

## 5. Vérifier puis publier

```bash
node scripts/translation-queue.mjs --lint
```

Contrôle : `translationOf` pointe sur un article FR existant, `categorySlug` connu,
`category` identique au FR, aucun organisme français résiduel, aucun vouvoiement,
typographie néerlandaise, aucun marqueur `À TRADUIRE` oublié. Les brouillons sont
ignorés par les checks de contenu — c'est normal, ils contiennent encore le FR.

**Retirer `draft: true` est le geste qui publie.** Tant que la ligne est là,
l'article est exclu du build, du sitemap, des hreflang et du sélecteur de langue.

Puis, comme pour un article FR :

```bash
npx tsc --noEmit
npx next build
```

## 6. Ce qui se déclenche tout seul après le merge sur `main`

- **hreflang réciproques** : la page FR source se met à pointer vers la NL, et
  l'inverse. Rien à écrire à la main — l'index se construit depuis `translationOf`.
- **Sélecteur de langue** : le lien miroir apparaît en tête des deux articles.
- **Sitemap** : l'URL NL entre dans `/sitemap.xml` avec ses `xhtml:link`.
- **Google Indexing API** : `.github/workflows/indexing.yml` détecte le push sur
  `content/nl/blog/**.mdx` et soumet l'URL canonique NL.

## 7. Volume et risque « traduction à grande échelle »

Au rythme de 1-2 articles par jour, le miroir dépasse 400 pages en un an. La
politique Google sur le contenu traduit vise la traduction automatique **publiée
sans relecture**. Une traduction relue et réellement localisée (sources belges,
organismes belges, prix belges) n'entre pas dans ce cadre. La relecture n'est pas
une formalité : c'est ce qui sépare les deux situations.
