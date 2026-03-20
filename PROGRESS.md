# Progression — Toutou Gourmet — màj à chaque fin de session

## Complété

- **8 articles comparatifs blog** (2026-03-20) : Dog Chef vs Just Russel, Dog Chef vs Japhy, Just Russel vs Elmut, Just Russel vs Japhy, Elmut vs Edgard & Cooper, Butternut Box vs Dog Chef, Dog Chef vs Royal Canin, Just Russel vs Royal Canin — SEO/GEO conforme, TL;DR, CompareTable, FAQ 6+, Verdict, BrandCTA affiliés
- Structure routes app/ complète (chien, outils, comparateur, blog, marques, pages légales)
- Redirects /blog/ et /marques/ → nouvelle structure (next.config.ts)
- MDX intégré (@next/mdx + next-mdx-remote + rehype-pretty-code)
- Variables CSS complètes + Tailwind v4 coexistence (@theme inline)
- Composants UI : Header, Footer, cards, boutons, quiz, calculateurs
- next/image utilisé, next/font (Fraunces + DM_Sans)
- Plausible Analytics + Vercel Analytics intégrés
- Sitemap dynamique (next-sitemap)
- JSON-LD WebSite dans layout.tsx
- not-found.tsx présent
- Accessibilité : skip link, focus-visible, prefers-reduced-motion
- Dispositif mémoire inter-sessions : CLAUDE.md, DECISIONS.md, PROGRESS.md, docs/

## En cours

—

## Bloqué

- DM_Sans 3 weights → DÉCISION À VALIDER (supprimer weight 500 ou 600 ?)
- adjustFontFallback absent → DÉCISION À VALIDER (ajouter pour réduire CLS)

## Prochaine session

1. Ajouter scripts manquants dans package.json : `type-check`, `test`, `audit`
2. Créer `vitest.config.ts` + `tests/setup.ts` (§14)
3. Créer `.github/workflows/ci.yml` (§13.2)
4. Créer `.env.example` avec toutes les clés
5. Créer `vercel.json`
6. Valider DÉCISIONS À VALIDER dans DECISIONS.md
