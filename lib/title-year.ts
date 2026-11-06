// @cdc seo-geo — l'année dans les titres (décision du propriétaire, 2026-11-05) : « Avis Orijen 2026 », calculée
// à la construction du site, heure de Paris. Le 1er janvier, deploy/new-year.sh reconstruit le site. Le corps
// des articles n'est jamais touché : « prix relevés en septembre 2026 » reste vrai. Fonctions pures.

export const currentYear = (now = new Date()): number =>
  Number(new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Europe/Paris' }).format(now))

/** Année de rédaction, à partir de 2026 : ni « FEDIAF 2026 » ni un règlement, qui gardent leur date. */
const WRITING_YEAR = /(?<!FEDIAF\s)(?<!UE\s)\b20(?:2[6-9]|[3-9]\d)\b(?![/-]\d)/g

export const refreshYear = (text: string, year: number): string => text.replace(WRITING_YEAR, String(year))

const WANTS_YEAR = /^avis\b|:\s*avis\b|\bmeilleur(?:e|s|es)?\b|\bcomparatif\b|\bclassement\b|\bvs\b/i
/** Au-delà, Google coupe trop : l'année reste dans la partie visible, mais le titre devient illisible. */
const MAX_LENGTH = 66

/** Ajoute l'année juste avant les deux-points, là où Google l'affiche à coup sûr. */
export function addYear(title: string, year: number, max = MAX_LENGTH): string {
  const colon = title.search(/\s:/)
  const next =
    colon > 0
      ? `${title.slice(0, colon)} ${year}${title.slice(colon)}`
      : /^avis\b/i.test(title)
        ? `${title} ${year}`
        : `${title} en ${year}`
  return next.length <= max ? next : title
}

/** Titre d'un article : l'année à jour s'il en a une, ajoutée si c'est un avis, un classement ou un comparatif. */
export function titleWithYear(title: string, category: string | undefined, year = currentYear()): string {
  const refreshed = refreshYear(title, year)
  if (refreshed !== title || /\b20\d\d\b/.test(title)) return refreshed
  return category === 'Avis & Comparatif' || WANTS_YEAR.test(title) ? addYear(title, year) : title
}
