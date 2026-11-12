// @cdc scanner — prix Maxi Zoo d'une fiche (fichier Awin, relevé chaque nuit, décision du 2026-11-12). Affiché à côté
// de la note, jamais dans son calcul. Fonctions pures.

export interface PrixMaxiZoo {
  prix: number
  prixKg: number | null
  prixAncien: number | null
  /** Date du relevé, AAAA-MM-JJ */
  releve: string
}

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
export const euros = (n: number): string => eur.format(n)

/** Remise en %, arrondie, quand le produit est en promotion (ancien prix plus haut que le prix). */
export function remise(p: PrixMaxiZoo): number | null {
  if (!p.prixAncien || p.prixAncien <= p.prix) return null
  const pct = Math.round((1 - p.prix / p.prixAncien) * 100)
  return pct >= 1 ? pct : null
}

export const dateReleve = (p: PrixMaxiZoo): string =>
  new Date(`${p.releve}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
