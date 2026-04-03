# Progression — Toutou Gourmet — màj à chaque fin de session

## Complété

- **3 articles blog (hydratation, pressées à froid, gestante)** (2026-04-03) : quantite-eau-chien-par-jour (tableau par poids, facteurs chaleur/activité/chiot/gestante, signes déshydratation, polyuro-polydipsie, conseils pratiques fontaine/glaçons), croquettes-pressees-froid-vs-extrudees (comparatif factuel 9 critères, digestibilité Beynen 2020, SDTE grandes races, profil par chien, conservation), alimentation-chienne-gestante-allaitante (plan semaine par semaine S1-S9 gestation + S1-S7 lactation, éclampsie prévention/symptômes, ration ménagère vs croquettes, erreurs fréquentes) — SERP analysée (3 concurrents/sujet), content gaps identifiés, FAQ 7+ questions, SEO/GEO conforme
- **3 articles blog (senior, herbe, friandises)** (2026-04-02) : alimentation-chien-senior-guide (gabarit/âge senior, protéines/phosphore/oméga-3, sarcopénie, bi-nutrition, BCS), chien-mange-herbe-pourquoi (7 causes, risques pesticides/parasites, arbre décisionnel, pica), friandises-naturelles-chien-guide (comparatif calorique 10 friandises, règle 10 %, profil par chien, friandises à éviter) — SERP analysée (3 concurrents/sujet), content gaps identifiés, FAQ 7+ questions, SEO/GEO conforme
- **3 articles blog (transition, étiquettes, budget)** (2026-04-01) : transition-alimentaire-chien (protocole 10 jours, microbiote, probiotiques, BARF), comprendre-etiquette-croquettes-chien (FEDIAF 2025, CE 767/2009, calcul glucides, checklist), budget-alimentation-chien-par-mois (comparatif 6 types par taille, coûts cachés, coût/g protéine) — SERP analysée (3 concurrents/sujet), content gaps identifiés, FAQ 7+ questions, SEO/GEO conforme
- **9 articles urgences sécurité chien** (2026-03-27) : chocolat, raisin, ail/oignon, mort-aux-rats, limace, glands de chêne, os cuit, os de poulet, crapaud — SERP analysée (3 concurrents/sujet), content gaps identifiés, protocoles d'urgence, tableaux dose/poids, chronologie symptômes, FAQ 6-8 questions, coûts vétérinaires, catégorie "urgences"
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
