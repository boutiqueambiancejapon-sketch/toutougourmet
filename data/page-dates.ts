// @cdc seo — dates de dernière modification des pages sans frontmatter, reprises en <lastmod>
// dans les sitemaps (lib/sitemaps). À mettre à jour à la main quand le contenu visible d'une page
// change vraiment (texte, outil, données), pas pour un simple correctif de style.
// Les articles prennent leur frontmatter (updatedAt, sinon date), les hubs la date de leur
// dernier article, les fiches croquettes la date de mise à jour de l'analyse.

/** Pages principales et outils : chemin → date (AAAA-MM-JJ). */
export const PAGE_DATES: Record<string, string> = {
  '/': '2026-11-02',
  '/quiz': '2026-11-02',
  '/comparateur': '2026-11-02',
  '/scanner': '2026-11-02',
  '/scanner/alternative-yuka-animaux': '2026-11-03',
  '/guide-alimentation': '2026-11-03',
  '/premium': '2026-11-03',
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
}

/** Fiches marque et duels automatiques /chien/marque/* (données de data/brands.ts). */
export const BRAND_PAGES_DATE = '2026-11-02'
