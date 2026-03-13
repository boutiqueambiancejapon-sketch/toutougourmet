/**
 * Dictionnaire des termes auto-linkés dans les articles de blog
 *
 * Ordre des priorités de matching : les termes les plus longs sont testés en premier
 * (géré dans le plugin). Ajoutez des termes ici sans toucher au plugin.
 *
 * Règles éditoriales :
 * - Chaque terme est linké au plus 1 fois par article
 * - Max 3 auto-links total par article
 * - Favoriser les pages marques, outils, et articles piliers
 */

// @cdc alimentation — dictionnaire maillage interne
export const AUTOLINK_DICTIONARY: Record<string, string> = {
  // — Marques —
  'Dog Chef':           '/marques/dog-chef',
  'Elmut':              '/marques/elmut',
  'Franklin Pet Food':  '/marques/franklin',
  'Petty Well':         '/marques/petty-well',

  // — Pages outils —
  'comparateur':        '/comparateur',
  'quiz':               '/quiz',

  // — Articles piliers —
  'repas frais':                      '/blog/repas-frais-vs-croquettes-chien',
  'BARF':                             '/blog/chien-peut-manger-viande-crue-barf',
  'croquettes sans céréales':         '/blog/croquettes-sans-cereales-chien',
  'os de poulet':                     '/blog/os-poulet-chien-danger',
  'alimentation naturelle':           '/blog/chien-peut-manger-viande-crue-barf',
  'raw feeding':                      '/blog/chien-peut-manger-viande-crue-barf',
}
