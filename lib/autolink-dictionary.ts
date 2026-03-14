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
  'repas frais':                      '/chien/alimentation-quotidienne/repas-frais-vs-croquettes-chien',
  'BARF':                             '/chien/viandes/chien-peut-manger-viande-crue-barf',
  'croquettes sans céréales':         '/chien/alimentation-quotidienne/croquettes-sans-cereales-chien',
  'os de poulet':                     '/chien/urgences/os-poulet-chien-danger',
  'alimentation naturelle':           '/chien/viandes/chien-peut-manger-viande-crue-barf',
  'raw feeding':                      '/chien/viandes/chien-peut-manger-viande-crue-barf',
}
