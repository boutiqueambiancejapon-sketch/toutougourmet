# Architecture — Toutou Gourmet

## TL;DR

- 4 sections principales : /chien/ · /outils/ · /comparateur/ · /blog/ (legacy)
- Contenu MDX dans /content/ organisé par catégorie
- Redirects actifs : /blog/[slug] → /chien/[cat]/[slug] · /marques/ → /chien/marque/
- Pas de i18n · pas de [locale]/ · lang="fr" dans layout.tsx

---

## Arbre des URLs

```
/                                    ← Home
/a-propos                            ← À propos
/contact                             ← Contact
/mentions-legales                    ← Mentions légales
/politique-de-confidentialite        ← Politique confidentialité

/chien/                              ← Hub chien (futur)
/chien/[category]/[slug]             ← Articles chien (MDX)
  catégories : alimentation-quotidienne · comportement-alimentaire ·
               fruit · legume · viande · sante · ...

/chien/marque                        ← Hub marques
/chien/marque/[slug]                 ← Fiche marque (Franklin, Elmut, Petty Well, Dog Chef)
/chien/marque/comparatif             ← Comparatif marques

/outils                              ← Hub outils
/outils/budget                       ← Calculateur budget mensuel
/outils/cout                         ← Comparateur coût par kg
/outils/poids                        ← Calculateur ration selon poids
/outils/ration                       ← Calculateur ration détaillé

/comparateur                         ← Comparateur prix interactif

/blog                                ← Hub blog legacy
/blog/[slug]                         ← Articles legacy (redirects actifs)
```

---

## Redirects actifs (next.config.ts)

| Source | Destination | Type |
|--------|-------------|------|
| /marques | /chien/marque | 301 |
| /marques/:slug | /chien/marque/:slug | 301 |
| /blog/avis-croquettes-orlando-lidl | /chien/alimentation-quotidienne/... | 301 |
| /blog/croquettes-sans-cereales-chien | /chien/alimentation-quotidienne/... | 301 |
| /blog/meilleure-nourriture-bichon-maltais | /chien/alimentation-quotidienne/... | 301 |
| /blog/meilleures-croquettes-chien-de-chasse | /chien/alimentation-quotidienne/... | 301 |
| /blog/croquettes-ou-patee | /chien/alimentation-quotidienne/... | 301 |
| /blog/repas-frais-vs-croquettes-chien | /chien/alimentation-quotidienne/... | 301 |
| /blog/chien-mange-couche-normal | /chien/comportement-alimentaire/... | 301 |
| /blog/chien-peut-manger-abricots | /chien/fruit/... | 301 |
| /blog/chien-peut-manger-fraises | /chien/fruit/... | 301 |
| /blog/chien-peut-manger-framboises | /chien/fruit/... | 301 |
| /blog/chien-peut-manger-mures | /chien/fruit/... | 301 |
| /blog/chien-peut-manger-myrtilles | /chien/fruit/... | 301 |
| /blog/chien-peut-manger-peches | /chien/fruit/... | 301 |
| /blog/chien-peut-manger-poires | /chien/fruit/... | 301 |

---

## Contenu MDX (/content/)

Organisé par catégorie — même structure que les URLs /chien/[category]/.
Métadonnées via gray-matter (frontmatter).

---

## Données (/data/)

- `brands.ts` — données marques (Franklin, Elmut, Petty Well, Dog Chef)
- `quiz.ts` — questions et logique du quiz personnalisé
- `categories.ts` — catégories d'articles

---

## Maillage interne

- Pages piliers : /chien/marque · /outils · /comparateur
- Articles chien → liens vers fiches marques associées
- Fiches marques → liens vers comparatif et outils
- Outils → liens vers fiches marques recommandées

---

## Navigation

- Header : logo + nav principale (Marques, Outils, Comparateur, Blog)
- Footer : liens légaux + colonnes thématiques
- Breadcrumbs : sur pages articles et fiches marques
