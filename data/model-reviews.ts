import { ficheIndexeePath, parCle, type FicheIndexee } from '@/lib/scanner/fiches-indexees'

// @cdc cluster scanner — avis publiés sur un modèle précis : une ligne de classement renvoie vers l'avis plutôt
// que vers la fiche. Clé : recipeKey(marque, produit) de lib/scanner/rankings.ts. À compléter à chaque avis de modèle.

export const MODEL_REVIEWS: Record<string, string> = {
  'dog chef|croquettes au canard frais': '/chien/avis-marques/avis-dog-chef-croquettes-canard-frais',
  'franklin pet food|croquettes dinde patate douce epinards': '/chien/avis-marques/avis-franklin-light-dinde-patate-douce-epinards',
}

/** Adresse du produit dans un classement : son avis s'il existe, sinon sa fiche. */
export function recipeHref(key: string, slug: string, fiches: FicheIndexee[] = []): string {
  const indexee = parCle(fiches, key)
  return MODEL_REVIEWS[key] ?? (indexee ? ficheIndexeePath(indexee) : `/croquettes/${slug}`)
}
