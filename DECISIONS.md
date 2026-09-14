# Décisions — Toutou Gourmet

## Tranchées

- [x] Framework : Next.js 16.1.6 — jamais downgrader · mise à jour via PR dédiée uniquement
- [x] React : 19.2.3
- [x] Langage : TypeScript strict — jamais de `any`
- [x] Déploiement : Vercel · région auto · GitHub Actions CI (à configurer)
- [x] Styling : Tailwind v4 + variables CSS obligatoires — coexistence `@theme inline` + `:root`
- [x] Dark mode : non implémenté — V2 · next-themes prévu si décidé
- [x] ~~Langue : français uniquement — pas de i18n, pas de `[locale]/`~~ → **révisée le 2026-09-14** (voir « Miroir NL-BE » ci-dessous)
- [x] Budget JS : objectif 80kb First Load gzippé (à surveiller avec `next build`)
- [x] CSP : `unsafe-eval` activé dans script-src — voir exception ci-dessous
- [x] Analytics : Plausible (script externe) + Vercel Analytics
- [x] ~~Sitemap : next-sitemap (postbuild)~~ → **révisée le 2026-09-14** : `app/sitemap.ts` seul (voir « Sitemap » ci-dessous)
- [x] MDX : @next/mdx + next-mdx-remote + gray-matter + rehype-pretty-code
- [x] Icons : lucide-react — SVG uniquement, pas d'icon font
- [x] Animations : framer-motion 12 — wrappers décoratifs uniquement
- [x] Forms : react-hook-form + zod
- [x] UI primitives : @radix-ui (accordion, dialog, slot)
- [x] Polices : Fraunces (titres, 700+900) + DM_Sans (corps, 400+500+600) — voir exception ci-dessous
- [x] Google Indexing API : soumission automatique via `/api/indexing` (Vercel) + `scripts/submit-indexing.mjs` (Node zéro-dep) + `.github/workflows/indexing.yml` (trigger push sur `content/**.mdx`) — URLs canoniques construites depuis le frontmatter `categorySlug` pour éviter les mismatches · quota Google 200/jour respecté côté route
- [x] **Redesign V2 — direction visuelle (2026-04-24)** : style "photo réaliste + illustration peinte par-dessus" (refs Oatly, Liquid Death, Partake Foods). Base photo lifestyle cream + couche décorative hand-drawn (contour noir `#1A1109`, aplats pill colors). 6 éléments signatures figés : confetti géométrique, chapeau de fête, gamelle dessinée, os stylisé, étoile scintillante, empreinte de patte. Prompt système unique `docs/prompts/gemini-image-system.md`, évolution par PR dédiée avec regénération complète.
- [x] **Redesign V2 — génération images (2026-04-24)** : Gemini 2.5 Flash Image (Nano Banana) via `@google/generative-ai`, 25 slots définis dans `data/images-manifest.ts`, 3 variantes par slot lors du premier run (choix humain), export WebP 1600w + 800w via `sharp` (objectif < 200 Ko pour PSI). Tons alignés aux pill colors existantes du design system (rose `#FFD6E3`, bleu `#C8DCFF`, ambre `#FFE8B5`, vert `#C2F0D5`).
- [x] **Redesign V2 — marques partenaires (2026-04-24, màj 2026-05-25)** : les 4 cartes marques (Franklin, Elmut, Ultra Premium Direct, Dog Chef) n'imitent **pas** les packshots réels. Chaque image évoque la catégorie (croquettes mono-protéine / repas frais cuisinés / croquettes vente directe / repas frais sur-mesure) via une scène moodboard neutre, sans logo ni packaging reconnaissable. Décision pour éviter tout risque légal/ayants droit. Les vrais visuels marques pourront arriver en V2+ sur les fiches produits via accord affilié formel. **Note màj 2026-05-25** : Petty Well a été remplacé par Ultra Premium Direct (nouveau partenariat affilié, cf. commit a6eb6cf).
- [x] **Redesign V2 — tone par catégorie de contenu (2026-04-24)** : Nutrition → ambre, Santé → vert, Alimentation → rose, Comportement → bleu, Enquêtes → ambre + accent orange, Urgences → rose + sparkle orange, Avis marques → bleu, Par race → ambre. Le ton guide Gemini à la génération **et** le composant `<IllustratedImage>` (overlay runtime) au rendu.

- [x] **Miroir NL-BE (2026-09-14)** : mirroir néerlandais de Belgique en **sous-dossier** `/nl/`, pas en sous-domaine (l'autorité du domaine se partage, une seule propriété Search Console). Phase 1 = **blog uniquement** : les outils, le quiz et le comparateur restent FR. Slugs traduits (`/nl/hond/merken-reviews/verse-maaltijden-vs-brokken-hond`). Aucune URL FR ne bouge : le FR passe dans un route group `app/(fr)` dont le chemin public est identique. Le lien entre les deux versions passe par le frontmatter `translationOf` (slug FR) déclaré côté NL — c'est lui qui garantit que les hreflang sont **réciproques**, condition sans laquelle Google les ignore. Le slug de catégorie canonique reste le FR dans `frontmatter.categorySlug` : la cover et l'image OG continuent de se résoudre via `getArticleSlot`, indexé sur le FR.
- [x] **Deux root layouts (2026-09-14)** : l'App Router n'autorise `<html>` que dans un root layout. Pour servir `lang="nl-BE"` sur `/nl` (critère WCAG 3.1.1 « Langue de la page »), on utilise deux route groups — `app/(fr)` et `app/(nl)` — chacun avec son root layout, tous deux délégant le document à `components/layout/SiteDocument.tsx`. Conséquence assumée : naviguer FR ↔ NL provoque un rechargement complet de page (comportement Next.js documenté pour les root layouts multiples). Sans impact : c'est un changement de langue, pas une navigation courante.
- [x] **Sitemap : `app/sitemap.ts` seul (2026-09-14)** : `postbuild: next-sitemap`, `next-sitemap.config.js` et les artefacts commités `public/sitemap.xml`, `public/sitemap-0.xml`, `public/robots.txt` sont supprimés. Motif : un fichier statique de `public/` masque la route App Router du même nom. En prod, `/sitemap.xml` servait donc le `public/sitemap.xml` figé au 2026-03-09 — 66 URLs, dont des `/blog/…` redirigées depuis — au lieu des 370 URLs de `app/sitemap.ts`. Vérifié avec `next build && next start` + `curl`. Les hreflang du miroir NL (`xhtml:link`) ne sont émis que par `app/sitemap.ts` : sans cette suppression, ils n'auraient jamais été lus par Google. `robots.txt` est désormais servi par `app/robots.ts` (mêmes règles qu'avant + `/dev/`).

- [x] **Sélecteur de langue (2026-09-14)** : rendu serveur, sans JavaScript. Dans le header et le footer, il pointe vers le **point d'entrée** de l'autre langue (`/nl` ↔ `/`) ; en tête d'article, il pointe vers le **miroir exact**, aux mêmes URLs que les `hreflang` du `<head>`. Ce découpage n'est pas un compromis de confort : dans l'App Router, un layout ne reçoit pas les paramètres de route de la page qu'il enveloppe, donc un header conscient de l'article imposerait soit d'embarquer côté client la table des ~400 paires de slugs (plusieurs Ko sur chaque page, contre un budget de 80 Ko First Load), soit de résoudre le lien en JavaScript après hydratation — donc invisible pour les crawlers. Le lien miroir vit là où la page connaît sa traduction. Quand la traduction n'existe pas, aucun lien miroir n'est rendu : même condition que l'émission des hreflang.
- [x] **Brouillons `draft: true` (2026-09-14)** : `lib/mdx.ts` exclut du build, du sitemap, des hreflang et du sélecteur de langue tout article dont le frontmatter porte `draft: true`. Motif : `scripts/translation-queue.mjs --scaffold` génère un fichier NL contenant encore le corps français ; sans ce garde-fou, un scaffold oublié à raison de 1-2 par jour finit en production et en indexation. Retirer la ligne est le geste explicite qui publie.

## À valider

- [ ] DM_Sans : 3 weights chargés (400, 500, 600) — CDC impose max 2 — supprimer 500 ou 600 ?
- [ ] adjustFontFallback : absent sur Fraunces et DM_Sans — ajouter pour réduire CLS ?
- [ ] CI/CD : créer .github/workflows/ci.yml ?
- [ ] Scripts package.json : ajouter type-check, test, audit ?
- [ ] vercel.json : créer avec région et config silent ?
- [ ] .env.example : créer ?
- [ ] Vitest : installer infrastructure de test ?

## Abandonnées

- next-themes → non installé, dark mode reporté en V2
- i18n (next-intl) → toujours pas installé : le miroir NL passe par un dictionnaire maison (`lib/i18n/dictionary.ts`) et deux arborescences de routes, pas par une lib de traduction runtime
- `app/[locale]/` → écarté au profit de `app/(fr)` + `app/(nl)/nl/…` : un segment `[locale]` aurait préfixé toutes les URLs FR existantes
- **Petty Well** → partenariat retiré le 2026-05-25 au profit d'Ultra Premium Direct (commits a6eb6cf + b4de2fc). Slug `/chien/marque/petty-well` redirigé en 308 vers `/chien/marque/ultra-premium-direct` via `next.config.ts`.

## Exceptions documentées

- **2025 — CSP unsafe-eval** : activé dans `next.config.ts` script-src. Requis par le script Plausible Analytics (`plausible.io/js/script.js`). Vérifier à chaque mise à jour Plausible si l'exception est encore nécessaire.
- **2025 — DM_Sans 3 weights** : chargé avec 400, 500, 600 au lieu du max 2 du CDC. Décision de design (500 utilisé pour UI intermédiaire). DÉCISION À VALIDER pour réduire à 2.
