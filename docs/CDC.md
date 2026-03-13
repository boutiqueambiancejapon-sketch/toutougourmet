# CDC — Toutou Gourmet
Comparateur indépendant de nourriture premium pour chiens et chats en France.

## TL;DR

- Site comparateur pet food premium · marché FR · public propriétaires 25-45 ans
- Next.js 16.1.6 + React 19 + TypeScript strict + Tailwind v4 + MDX
- Monolangue FR · pas de i18n · pas de dark mode (V2)
- Déploiement : GitHub → Vercel · jamais push sur main directement
- Budget JS : 80kb First Load gzippé objectif
- Fonts : Fraunces (titres) + DM_Sans (corps) · lucide-react icons SVG
- Analytics : Plausible + Vercel Analytics
- Sections CDC détaillées dans les fichiers /docs/ ci-dessous

## Fichiers de référence

| Section | Fichier | Contenu |
|---------|---------|---------|
| §2 + §12 | docs/01-branding.md | Couleurs, typo, icônes, animations |
| §3 | docs/02-stack.md | Stack, dépendances, next.config.ts |
| §4 | docs/03-architecture.md | Routes, arbre URLs, maillage |
| §5 | docs/04-pages.md | Contrat de page, layouts, gabarits |
| §6 | docs/05-features.md | Fonctionnalités détaillées |
| §7 | docs/06-seo.md | SEO, JSON-LD, sitemap, GEO |
| §13+§14 | docs/07-cicd.md | CI/CD, tests, scripts |
| §16+§17 | docs/08-conventions.md | Conventions code, nommage |

## Contraintes non négociables (§0)

- Next.js 16.1.6 — jamais downgrader
- Budget JS 80kb First Load gzippé — ne jamais dépasser
- GitHub → Vercel uniquement — jamais pusher sur main directement
- Secrets : Vercel Dashboard uniquement — jamais dans le repo
- TypeScript strict — jamais de `any`
