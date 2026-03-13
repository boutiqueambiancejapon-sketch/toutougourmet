# Conventions de code — Toutou Gourmet

## TL;DR

- TypeScript strict · variables CSS uniquement · composants max 150 lignes
- Conventional Commits en anglais · kebab-case fichiers · PascalCase composants
- ESLint : next/core-web-vitals + no-explicit-any + no-unused-vars

---

## 17.1 Structure dossiers

```
/
├── app/                          ← App Router Next.js (cf. docs/04-pages.md)
├── components/
│   ├── ui/                       ← design system atoms (buttons, cards, inputs)
│   ├── layout/                   ← Header, Footer
│   ├── home/                     ← composants homepage
│   ├── blog/                     ← composants articles MDX
│   ├── marques/                  ← composants fiches/hub marques
│   ├── outils/                   ← composants calculateurs
│   ├── comparateur/              ← composants comparateur
│   ├── quiz/                     ← composants quiz
│   └── mdx/                      ← composants custom MDX
├── lib/
│   ├── calculators.ts            ← logique calculateurs
│   ├── quiz.ts                   ← logique scoring quiz
│   ├── mdx.ts                    ← lecture fichiers MDX
│   ├── affiliate.ts              ← liens affiliés
│   └── utils.ts                  ← utilitaires généraux
├── data/
│   ├── brands.ts                 ← données marques
│   ├── quiz.ts                   ← questions quiz
│   └── categories.ts             ← catégories articles
├── content/                      ← fichiers MDX articles
│   └── [category]/
│       └── [slug].mdx
├── public/
│   └── images/
│       ├── og/                   ← 1200×630 OpenGraph
│       └── marques/              ← logos marques
├── tests/
│   ├── fixtures/
│   ├── helpers/
│   └── setup.ts
├── docs/                         ← CDC découpé (ce dossier)
├── CLAUDE.md
├── DECISIONS.md
├── PROGRESS.md
└── vitest.config.ts              ← à créer
```

---

## 17.2 Nommage

| Type | Convention | Exemple |
|------|-----------|---------|
| Fichiers pages | kebab-case | mon-article.tsx |
| Composants | PascalCase | MonComposant.tsx |
| Hooks | camelCase + use | useMonHook.ts |
| Utils / lib | camelCase | formatDate.ts |
| Variables CSS | kebab-case | --accent-primary |
| Constantes | SCREAMING_SNAKE | MAX_RETRY_COUNT |
| Types | PascalCase + T | TArticle |
| Interfaces | PascalCase + I | IUserProps |

---

## 17.3 Commits — Conventional Commits (anglais)

```
feat: add newsletter subscription form
fix: correct mobile nav overflow
docs: update PROGRESS.md
chore: bump next to 16.x.x
refactor: extract quiz scoring logic to lib/quiz.ts
test: add unit tests for calculators
```

---

## 17.4 Branches

```
main         ← production (protégée)
feature/xxx  ← nouvelles features
fix/xxx      ← corrections bugs
content/xxx  ← ajouts/modifications de contenu MDX uniquement
```

---

## 17.5 Règles code absolues

- TypeScript strict — jamais de `any`
- Variables CSS uniquement — jamais de valeur hex/px directe dans le JSX
- Composants max 150 lignes — découper si dépassé
- TODO : jamais sans numéro d'issue GitHub (`// TODO #42 — description`)
- `'use client'` : jamais sur page.tsx · uniquement sur sous-composants interactifs
- `next/image` : obligatoire · jamais `<img>` · width+height toujours renseignés
- `priority` : uniquement sur l'image LCP above-fold (une seule par page)
- Fetch : cache toujours explicite (`{ next: { revalidate: X } }` ou `{ cache: 'no-store' }`)

---

## 17.6 ESLint (eslint.config.mjs)

Configuration actuelle : `next/core-web-vitals` + `next/typescript`

Règles à vérifier actives :
- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/no-unused-vars: error`
- `react/no-unescaped-entities: error`

---

## 17.7 Sécurité & Maintenance

- Secrets : Vercel Dashboard uniquement — jamais dans le repo ni .env.local committé
- Dépendances : `npm audit --audit-level=high --omit=dev` en CI
- Headers sécurité : next.config.ts — X-Frame-Options · nosniff · CSP
- CSP unsafe-eval : exception documentée DECISIONS.md (Plausible)
- Monitoring erreurs : non configuré (V2 — Sentry prévu)
- Monitoring uptime : non configuré (V2)
