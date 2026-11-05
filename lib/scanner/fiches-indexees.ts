import data from '@/data/fiches-indexees.json'

// @cdc seo — fiches ouvertes à Google (décision du propriétaire du 2026-11-05) : une par recette, nom exact et
// adresse courte par type. Toutes les autres fiches restent en noindex à leur adresse habituelle.

export type FicheType = 'croquettes' | 'patees'

export interface FicheIndexee {
  court: string
  slug: string
  cle: string
  nom: string
  type: FicheType
}

export const FICHES_INDEXEES = data as FicheIndexee[]

export const ficheIndexeePath = (f: FicheIndexee): string => `/${f.type}/${f.court}`
export const parCourt = (type: FicheType, court: string): FicheIndexee | undefined => FICHES_INDEXEES.find((f) => f.type === type && f.court === court)
export const parSlug = (slug: string): FicheIndexee | undefined => FICHES_INDEXEES.find((f) => f.slug === slug)
export const parCle = (cle: string): FicheIndexee | undefined => FICHES_INDEXEES.find((f) => f.cle === cle)
