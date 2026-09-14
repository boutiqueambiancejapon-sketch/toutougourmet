# TODO — Miroir NL-BE

Décisions utilisateur (2026-09-14) :
- Périmètre : **tout le site**, progressivement (phase A socle applicatif + phase B contenu)
- URLs : sous-dossier `/nl/…` sur www.toutou-gourmet.com
- Slugs : traduits en néerlandais
- Livraison : **push direct sur la branche de production** `claude/toutou-gourmet-setup-3mRbP`
  (pas de `main` dans ce repo — cette branche est la branche par défaut et celle que Vercel
  déploie). Choix assumé par le propriétaire après signalement du risque sur la phase A.

## Prérequis — à faire avant le premier run planifié

- [ ] Merger `claude/jolly-brahmagupta-742x33` (lots 1 et 3 du miroir NL) dans
      `claude/toutou-gourmet-setup-3mRbP`. Tant que ce n'est pas fait, un run quotidien
      poserait des articles NL sur une branche dépourvue des routes `/nl`. Le garde-fou
      du prompt de routine détecte ce cas et s'arrête sans rien pousser.
- [ ] Créer les deux tâches planifiées à partir de `tasks/routines/` (voir ce dossier).

## Phase A — socle applicatif (une zone par run hebdomadaire)

Ordre d'exécution. Pour chaque zone : extraire les chaînes vers `lib/i18n/dictionary.ts`
(FR par défaut, rendu FR inchangé), ajouter le NL, créer la route `/nl/…`, une seule
implémentation avec une prop `locale`.

- [ ] A1 — Home + `components/home` (~23 chaînes)
- [ ] A2 — Hubs `/chien`, `/chien/[category]`, `/chien/race` + `data/categories.ts` (~16)
- [ ] A3 — Hub blog : filtres, pagination, recherche, tri (~8)
- [ ] A4 — Outils : 6 calculateurs + `lib/calculators.ts` + `data/bien-nourri.ts` (~280) — prévoir 2 runs
- [ ] A5 — Quiz + `data/quiz.ts`
- [ ] A6 — Comparateur (~15)
- [ ] A7 — Marques : fiches + `data/brands.ts` (~190) — **décision à prendre** : les avis
      clients sont des témoignages réels, ne pas les traduire sans arbitrage
- [ ] A8 — Légal, à propos, contact, plan du site, page auteur — **décision à prendre** :
      mentions légales et politique de confidentialité ont une portée juridique

## Phase B — contenu (2 articles par run quotidien)

- [ ] 329 contenus FR à traduire (327 articles + 2 comparatifs) — suivi via
      `node scripts/translation-queue.mjs --status`
- [ ] À 2 par jour : ~5,5 mois. Chaque nouvel article FR publié creuse la dette d'un cran.

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
