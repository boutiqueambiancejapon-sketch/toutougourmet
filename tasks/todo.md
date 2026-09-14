# TODO — Miroir NL-BE (lot 1 : infrastructure)

Décisions utilisateur (2026-09-14) :
- Périmètre phase 1 : **blog uniquement** (pas d'outils / quiz / comparateur)
- URLs : **sous-dossier** `/nl/…` sur www.toutou-gourmet.com
- Slugs : traduits en néerlandais (hypothèse — meilleur SEO NL, mapping via `translationOf`)

## Lot 1 — infrastructure (cette session)

- [x] `lib/i18n/config.ts` — locales, `lang` HTML (`fr` / `nl-BE`), locale OG, préfixe d'URL
- [x] `lib/i18n/categories.ts` — mapping catégorie FR ↔ slug + libellé NL
- [x] `lib/i18n/dictionary.ts` — chaînes UI FR/NL (défaut FR = aucun changement de rendu côté FR)
- [x] `lib/mdx.ts` — chargement conscient de la locale (`content/blog` vs `content/nl/blog`)
- [x] `lib/i18n/alternates.ts` — index bidirectionnel `translationOf` → `alternates.languages`
- [x] Route groups `app/(fr)` / `app/(nl)` — deux root layouts, URLs FR inchangées
- [x] `app/(nl)/layout.tsx` — `<html lang="nl-BE">`, OG `nl_BE`
- [x] Routes NL : `/nl`, `/nl/hond/[category]`, `/nl/hond/[category]/[slug]`
- [x] hreflang réciproque (FR ↔ NL ↔ x-default) sur les 2 routes article FR + la route NL
- [x] `app/sitemap.ts` — entrées NL + `alternates.languages`
- [x] Header/Footer/ArticleLayout : prop `locale` optionnelle (défaut `fr`)
- [x] 1 article pilote NL-BE traduit
- [x] `tsc --noEmit` + `npx eslint app components lib` + `next build` + `next start` vérifiés
      (`next lint` n'existe plus en Next 16 — utiliser `npx eslint`. 9 erreurs eslint
      subsistent, toutes antérieures et hors périmètre : `app/(fr)/a-propos/page.tsx`,
      `app/(fr)/chien/marque/[slug]/page.tsx`, `components/blog/StickyCta.tsx`)
- [x] Effet de bord : `public/sitemap.xml` figé masquait `app/sitemap.ts` — artefacts +
      hook `postbuild: next-sitemap` supprimés, `app/robots.ts` ajouté (cf. DECISIONS.md)

## Lot 2 (prochaine session)

- [ ] Hub `/nl/blog` complet (filtres, pagination, recherche) — actuellement `/nl` sert de hub
- [ ] Traduction NL des pages légales (mentions légales, vie privée) si le formulaire contact est exposé côté NL
- [ ] `RelatedBrands` / `NewsletterBlock` : copies NL relues (traduction littérale à revoir)
- [ ] Dimension langue côté GA4 / Plausible

## Lot 3

- [ ] Skill `boileau-nl` (règles de rédaction NL-BE : AFSCA ≠ NVWA, lexique belge, tutoiement `je`)
- [ ] Pipeline de traduction 1-2 articles/jour (script + scheduled task)
- [ ] `.github/workflows/indexing.yml` étendu à `content/nl/**`
