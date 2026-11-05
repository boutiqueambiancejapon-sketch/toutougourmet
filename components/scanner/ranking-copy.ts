export const SITE_URL = 'https://www.toutou-gourmet.com'

/** « 3 novembre 2026 », heure de Paris. */
export function frenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
}

/** « 2026-11-03 » pour l'attribut datetime, heure de Paris. */
export function isoDay(date: Date): string {
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
}

export const latestDate = (dates: Date[]): Date => new Date(Math.max(...dates.map((d) => d.getTime())))
