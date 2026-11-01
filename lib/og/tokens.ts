// @cdc 01-branding — miniatures OG : next/og ne lit pas les variables CSS,
// ces valeurs recopient les tokens V2 de app/globals.css (à garder synchronisées).

export const OG_SIZE = { width: 1200, height: 630 } as const

export const OG_COLORS = {
  cream: '#FAFAF8',
  ink: '#1A1109',
  ink2: '#4A3728',
  rose: '#FFD6E3',
  roseInk: '#8B1A4A',
  green: '#C2F0D5',
  greenInk: '#1A7A47',
  amber: '#FFE8B5',
  amberInk: '#8B5A0F',
  blue: '#C8DCFF',
  blueInk: '#1A4E8B',
  orange: '#E8622A',
  danger: '#C8283C',
  white: '#FFFFFF',
} as const

export type OgTone = 'rose' | 'green' | 'amber' | 'blue'

export const OG_TONES: Record<OgTone, { bg: string; ink: string }> = {
  rose: { bg: OG_COLORS.rose, ink: OG_COLORS.roseInk },
  green: { bg: OG_COLORS.green, ink: OG_COLORS.greenInk },
  amber: { bg: OG_COLORS.amber, ink: OG_COLORS.amberInk },
  blue: { bg: OG_COLORS.blue, ink: OG_COLORS.blueInk },
}

/** Libellé court + ton de la pastille, par categorySlug (tons : docs/01-branding.md). */
const CATEGORY_PILL: Record<string, { label: string; tone: OgTone }> = {
  fruit: { label: 'Fruits', tone: 'rose' },
  legumes: { label: 'Légumes', tone: 'rose' },
  viandes: { label: 'Viandes et poissons', tone: 'rose' },
  'alimentation-quotidienne': { label: 'Alimentation', tone: 'rose' },
  alimentation: { label: 'Alimentation', tone: 'rose' },
  urgences: { label: 'Urgences', tone: 'rose' },
  sante: { label: 'Santé', tone: 'green' },
  race: { label: 'Races', tone: 'amber' },
  'avis-marques': { label: 'Avis marques', tone: 'blue' },
  'comportement-alimentaire': { label: 'Comportement', tone: 'blue' },
}

export function getCategoryPill(categorySlug: string): { label: string; tone: OgTone } {
  return CATEGORY_PILL[categorySlug] ?? { label: 'Alimentation', tone: 'rose' }
}

export type Verdict = 'oui' | 'moderation' | 'danger'

export const VERDICTS: Record<Verdict, { label: string; bg: string; disc: string }> = {
  oui: { label: 'OUI', bg: OG_COLORS.green, disc: OG_COLORS.greenInk },
  moderation: { label: 'AVEC MODÉRATION', bg: OG_COLORS.amber, disc: OG_COLORS.orange },
  danger: { label: 'DANGER', bg: OG_COLORS.rose, disc: OG_COLORS.danger },
}
