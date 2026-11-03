import type { ProductKind } from '@/lib/scanner/score'
import type { OpffIndexPolicy } from '@/lib/server/scanner-published'

// @cdc lot 6 — textes et adresses des deux classements : /croquettes (aliments complets :
// croquettes et pâtées) et /croquettes/friandises (barème friandise). Titles ≤ 60 caractères,
// descriptions entre 110 et 155, aucun tiret cadratin dans les titres.

export const SITE_URL = 'https://www.toutou-gourmet.com'

export interface RankingCopy {
  path: string
  /** Title de la page 1 (absolu, sans la marque du site : il tient sous 60 caractères) */
  title: string
  /** Title des pages suivantes */
  pagedTitle: (page: number) => string
  h1: string
  description: string
  crumb: string
  /** « croquettes et pâtées », « friandises » : nom des produits dans les phrases */
  noun: string
  listTitle: string
  scanLabel: string
}

export const RANKING_COPY: Record<ProductKind, RankingCopy> = {
  complete: {
    path: '/croquettes',
    title: 'Meilleures croquettes pour chien : classement par note',
    pagedTitle: (page) => `Meilleures croquettes pour chien, classement page ${page}`,
    h1: 'Meilleures croquettes pour chien : classement par note de composition',
    description:
      'Croquettes et pâtées pour chien classées par note de composition sur 100 : protéines et glucides sur sec, viande nommée, additifs. Barème publié.',
    crumb: 'Classement des croquettes',
    noun: 'croquettes et pâtées',
    listTitle: 'Quelles croquettes pour chien ont la meilleure composition ?',
    scanLabel: 'Scanner un sac de croquettes',
  },
  treat: {
    path: '/croquettes/friandises',
    title: 'Meilleures friandises pour chien : classement par note',
    pagedTitle: (page) => `Meilleures friandises pour chien, classement page ${page}`,
    h1: 'Meilleures friandises pour chien : classement par composition',
    description:
      'Friandises, snacks et os à mâcher pour chien classés par note sur 100 : viande nommée en tête, sucre, sel, additifs. Barème propre aux friandises.',
    crumb: 'Classement des friandises',
    noun: 'friandises',
    listTitle: 'Quelles friandises pour chien ont la meilleure composition ?',
    scanLabel: 'Scanner un paquet de friandises',
  },
}

/** Ce que veut dire « fiche publiée », selon la règle d'indexation en vigueur. */
export function publishedRule(policy: OpffIndexPolicy): string {
  return policy === 'complete'
    ? "Une fiche entre dans le classement quand la rédaction a vérifié l'étiquette, ou quand la fiche Open Pet Food Facts est complète (marque, nom, composition et constituants)."
    : "Une fiche entre dans le classement seulement après vérification de l'étiquette par la rédaction."
}

/** « 3 novembre 2026 », heure de Paris. */
export function frenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
}

/** « 2026-11-03 » pour l'attribut datetime, heure de Paris. */
export function isoDay(date: Date): string {
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
}

export const latestDate = (dates: Date[]): Date => new Date(Math.max(...dates.map((d) => d.getTime())))
