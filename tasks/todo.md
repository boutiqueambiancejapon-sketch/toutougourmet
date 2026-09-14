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

## Lot 3 — pipeline & rédaction NL (fait le 2026-09-14)

- [x] Skill `.claude/skills/boileau-nl/SKILL.md` (localisation belge, lexique NL-BE vs NL-NL,
      typographie néerlandaise, tics d'IA en NL, règles frontmatter et liens internes)
- [x] `scripts/translation-queue.mjs` — `--status`, `--next N [--category]`, `--scaffold`, `--lint`
- [x] `draft: true` supporté par `lib/mdx.ts` : un scaffold non relu est hors build, hors sitemap,
      hors hreflang, hors sélecteur de langue
- [x] `data/nl-categories.json` — table FR→NL partagée entre `lib/i18n/categories.ts` et les scripts
- [x] `.github/workflows/indexing.yml` + `scripts/submit-indexing.mjs` étendus à `content/nl/blog/**`
- [x] `docs/10-traduction-nl.md` — procédure quotidienne
- [x] Sélecteur de langue HTML (menu + footer + miroir en tête d'article)

## Lot 2 (prochaine session)

- [ ] Hub `/nl/blog` complet (filtres, pagination, recherche) — actuellement `/nl` sert de hub
- [ ] Traduction NL des pages légales (mentions légales, vie privée) si le formulaire contact est exposé côté NL
- [ ] `RelatedBrands` / `NewsletterBlock` : copies NL relues (traduction littérale à revoir)
- [ ] Dimension langue côté GA4 / Plausible

## Signalé, non traité (hors périmètre)

- [ ] 8 articles FR portent `categorySlug: "alimentation"`, catégorie absente de `data/categories.ts` :
      `/chien/alimentation/<slug>` répond 200 mais le hub `/chien/alimentation` renvoie 404 et le
      fil d'Ariane perd son niveau catégorie. Ces 8 articles sont aussi exclus de la file de
      traduction NL. Correctif = décision de taxonomie (fusion dans `alimentation-quotidienne`
      + redirects, ou création de la catégorie).
- [ ] 9 erreurs eslint antérieures : `app/(fr)/a-propos/page.tsx`,
      `app/(fr)/chien/marque/[slug]/page.tsx`, `components/blog/StickyCta.tsx`
