import { displayBrand, displayName, recipeName } from './rankings'

// @cdc seo — fiches ouvertes à Google (table app.fiche_index, choisies dans le tableau de bord) : une par recette, nom
// exact et adresse courte par type. Toutes les autres fiches restent en noindex à leur adresse habituelle. Fonctions pures.

export type FicheType = 'croquettes' | 'patees' | 'friandises'

export interface FicheIndexee {
  court: string
  slug: string
  cle: string
  nom: string
  type: FicheType
  actif: boolean
}

export const ficheIndexeePath = (f: Pick<FicheIndexee, 'type' | 'court'>): string => `/${f.type}/${f.court}`
export const parCourt = (liste: FicheIndexee[], type: FicheType, court: string): FicheIndexee | undefined => liste.find((f) => f.type === type && f.court === court)
export const parSlug = (liste: FicheIndexee[], slug: string): FicheIndexee | undefined => liste.find((f) => f.actif && f.slug === slug)
export const parCle = (liste: FicheIndexee[], cle: string): FicheIndexee | undefined => liste.find((f) => f.actif && f.cle === cle)

/** Nom court d'un produit : la marque et la recette, sans le format. */
export const nomRecette = (brand: string | null, product: string | null): string | null =>
  brand && product ? `${displayBrand(brand)} ${displayName(recipeName(product))}` : null
