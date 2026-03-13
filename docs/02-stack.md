# Stack — Toutou Gourmet

## TL;DR

- Next.js 16.1.6 pinned · React 19 · TypeScript 5.9.3 strict
- Tailwind v4 (postcss) · framer-motion 12 · lucide-react
- MDX : @next/mdx + next-mdx-remote + rehype-pretty-code
- Plausible Analytics + Vercel Analytics
- Pas de tests configurés (vitest à ajouter — DÉCISION À VALIDER)

---

## Dépendances

| Rôle | Outil | Version | Note |
|------|-------|---------|------|
| Framework | Next.js | 16.1.6 | Pinned — ne jamais installer @latest |
| Langage | TypeScript | 5.9.3 | strict mode |
| Styling | Tailwind CSS | v4 | postcss · @theme inline |
| MDX | @next/mdx | 16.1.6 | pageExtensions config |
| MDX remote | next-mdx-remote | 6.0.0 | — |
| MDX metadata | gray-matter | 4.0.3 | — |
| MDX markdown | marked | 17.0.4 | — |
| MDX code | rehype-pretty-code | 0.14.3 | syntax highlighting |
| MDX GFM | remark-gfm | 4.0.1 | tables, strikethrough |
| Fonts | next/font/google | — | Fraunces + DM_Sans |
| Icons | lucide-react | 0.577.0 | SVG uniquement |
| Animations | framer-motion | 12.35.0 | wrappers décoratifs |
| Analytics | @vercel/analytics | 1.6.1 | — |
| Analytics | Plausible | script externe | plausible.io/js/script.js |
| Sitemap | next-sitemap | 4.2.3 | postbuild |
| Forms | react-hook-form | 7.71.2 | — |
| Validation | zod | 4.3.6 | — |
| UI | @radix-ui/react-accordion | 1.2.12 | — |
| UI | @radix-ui/react-dialog | 1.1.15 | — |
| UI | @radix-ui/react-slot | 1.2.4 | — |
| Utils | clsx | 2.1.1 | + tailwind-merge 3.5.0 |
| Hébergement | Vercel | — | prod sur main |
| Versioning | GitHub | — | branche main protégée |

---

## next.config.ts — points clés

- MDX intégré via `withMDX` wrapper
- Images : formats WebP + AVIF
- Turbopack : `optimizePackageImports` pour lucide-react et framer-motion
- 40+ redirects /blog/ et /marques/ → nouvelle structure
- Headers sécurité : X-Frame-Options DENY · nosniff · Referrer-Policy · Permissions-Policy
- CSP : `unsafe-eval` activé pour Plausible (exception documentée DECISIONS.md)

---

## Structure images (public/)

```
public/images/
├── og/         ← 1200×630 OpenGraph
├── marques/    ← logos marques
└── ...
```

Format WebP · next/image obligatoire · jamais `<img>` natif.

---

## Variables d'environnement

Fichier `.env.example` à créer (DÉCISION À VALIDER).
Secrets : Vercel Dashboard uniquement — jamais dans le repo.

```bash
NEXT_PUBLIC_SITE_URL=https://www.toutou-gourmet.com
# Ajouter toutes les clés utilisées
```
