// @cdc guide — « Le guide de la gamelle » : PDF offert contre l'inscription à la lettre.
// Constantes partagées par la page /guide-alimentation, les encarts d'articles, l'e-mail,
// la route d'impression et scripts/build-guide.mjs (qui reprend les mêmes chemins).

export const GUIDE_TITLE = 'Le guide de la gamelle'

/** Page publique d'inscription (indexable). */
export const GUIDE_PAGE_PATH = '/guide-alimentation'

/** Route d'impression privée (noindex, hors sitemap) ouverte par le script de génération. */
export const GUIDE_BOOK_PATH = '/guide-alimentation/livre'

/** Fichier servi en direct, régénéré par `npm run guide:pdf`. */
export const GUIDE_PDF_PATH = '/guides/guide-de-la-gamelle.pdf'

/** Valeur `source` envoyée à /api/contact : déclenche l'e-mail du guide. */
export const GUIDE_SOURCE = 'guide'

/** Emplacements mesurés de l'inscription au guide (événement Guide Signup, propriété place). */
export const GUIDE_PLACES = {
  'page-guide': 'Page du guide',
  accueil: 'Accueil',
  blog: 'Page des articles',
  'article-aliment': 'Fin d’article (aliment)',
  'article-recette': 'Fin d’article (recette)',
  'fiche-frigo': 'Fiche aliments dangereux',
  popup: 'Panneau du guide',
  'inline-guide': 'Haut d’article',
} as const

export type GuidePlace = keyof typeof GUIDE_PLACES
