// @cdc seo-geo — contenu éditorial des pages piliers (/chien/{rubrique}) : introduction développée,
// FAQ (balisée en JSON-LD FAQPage) et sources. Texte en français, règles du skill boileau,
// chaque chiffre sourcé dans `sources`. Gras autorisé avec **…** ; liens internes avec [texte](/chemin).

export interface PillarFaq {
  q: string
  a: string
}

export interface PillarContent {
  /** H2 de la section d'introduction (question naturelle) */
  heading: string
  /** 3 à 6 paragraphes */
  intro: string[]
  /** 5 à 8 questions */
  faq: PillarFaq[]
  sources: { label: string; url: string }[]
}

export const PILLARS: Record<string, PillarContent> = {}

export function getPillar(slug: string): PillarContent | undefined {
  return PILLARS[slug]
}
