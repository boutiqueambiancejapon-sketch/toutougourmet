// @cdc seo — dates de dernière modification des pages sans frontmatter, reprises en <lastmod>
// dans les sitemaps (lib/sitemaps). À mettre à jour à la main quand le contenu visible d'une page
// change vraiment (texte, outil, données), pas pour un simple correctif de style.
// Les articles prennent leur frontmatter (updatedAt, sinon date), les hubs la date de leur
// dernier article, les fiches croquettes la date de mise à jour de l'analyse, les classements
// /croquettes et /croquettes/friandises la date de leur fiche la plus récente (lib/sitemaps).

/** Pages principales et outils : chemin → date (AAAA-MM-JJ). */
export const PAGE_DATES: Record<string, string> = {
  '/': '2026-11-02',
  '/quiz': '2026-11-02',
  '/comparateur': '2026-11-02',
  '/scanner': '2026-11-03',
  '/scanner/alternative-yuka-animaux': '2026-11-03',
  '/guide-alimentation': '2026-11-03',
  '/premium': '2026-11-03',
  '/mon-chien': '2026-11-07',
  '/assistant': '2026-11-07',
  '/conditions-generales': '2026-11-07',
  '/outils': '2026-11-03',
  '/outils/age': '2026-11-02',
  '/outils/bien-nourri': '2026-11-02',
  '/outils/budget': '2026-11-02',
  '/outils/cout': '2026-11-03',
  '/outils/fiche-de-garde': '2026-11-03',
  '/outils/poids': '2026-11-02',
  '/outils/ration': '2026-11-03',
  '/a-propos': '2026-11-02',
  '/auteurs/mathias-c': '2026-11-02',
  '/plan-du-site': '2026-11-02',
  '/chien/marque/comparatif': '2026-11-02',
  '/codes-promo': '2026-11-03',
  '/codes-promo/dog-chef': '2026-11-03',
  '/codes-promo/dogfy-diet': '2026-11-03',
  '/codes-promo/elmut': '2026-11-03',
  '/codes-promo/franklin': '2026-11-03',
  '/codes-promo/ultra-premium-direct': '2026-11-03',
}

/** Fiches marque et duels automatiques /chien/marque/* (données de data/brands.ts). */
export const BRAND_PAGES_DATE = '2026-11-02'
