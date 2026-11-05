import { animalKind, isByProduct, normalize } from '../ingredients'
import type { Entree } from './types'

// @cdc scanner — matière sèche et part animale d'un aliment complet.

const ASSUMED_DRY_MOISTURE = 10

export function matiereSeche(e: Entree) {
  const a = e.constituants
  let h = a.humidite
  if (h === null && e.typeAliment !== 'humide' && a.proteines !== null && a.matieresGrasses !== null) {
    const somme = a.proteines + a.matieresGrasses + (a.cendres ?? 0) + (a.cellulose ?? 0)
    // Moins de 40 : la recette est sans doute humide, on ne suppose pas 10 % d'eau.
    if (somme >= 40 && somme <= 80) h = ASSUMED_DRY_MOISTURE
  }
  const ms = (v: number | null) => (v === null || h === null || h >= 100 ? null : (v * 100) / (100 - h))
  const glu = a.proteines !== null && a.matieresGrasses !== null && a.cendres !== null && a.cellulose !== null && h !== null ? Math.max(0, 100 - a.proteines - a.matieresGrasses - a.cendres - a.cellulose - h) : null
  return { h, prot: ms(a.proteines), mg: ms(a.matieresGrasses), cendres: ms(a.cendres), ca: ms(a.calcium), p: ms(a.phosphore), glu: ms(glu) }
}

export const estHumide = (e: Entree, h: number | null) => e.typeAliment === 'humide' || (h !== null && h >= 60)

/**
 * Part de la matière sèche qui vient d'ingrédients animaux, viande sans son eau, sous-produits comptés à moitié.
 * Croquettes : pourcentages supposés AVANT cuisson, le reste de la recette compté sec à 90 %.
 * Pâtée : rien ne s'évapore, le dénominateur est la matière sèche du produit.
 */
export function partAnimaleSeche(e: Entree, h: number | null): number | null {
  const avec = e.ingredients.filter((i) => animalKind(i.nom) !== null && i.pourcentage !== null)
  const facteur = (n: string) => {
    const t = normalize(n)
    const frais = /frais|fraiche|crue?s?\b|desosse/.test(t)
    const sec = /deshydrat|seche?s?\b|farine|proteines?|poudre/.test(t)
    const base = frais && sec ? 0.6 : frais ? 0.3 : sec ? 0.9 : estHumide(e, h) ? 0.3 : 0.6
    return isByProduct(n) ? base * 0.5 : base
  }
  let animal: number
  let pct: number
  if (avec.length > 0) {
    animal = avec.reduce((s, i) => s + (i.pourcentage ?? 0) * facteur(i.nom), 0)
    pct = avec.reduce((s, i) => s + (i.pourcentage ?? 0), 0)
  } else if (e.partAnimaleDeclaree) {
    animal = e.partAnimaleDeclaree * 0.6
    pct = e.partAnimaleDeclaree
  } else return null
  if (estHumide(e, h) && h !== null) return Math.min(100, (animal / (100 - h)) * 100)
  const reste = Math.max(0, 100 - pct) * (estHumide(e, h) ? 0.25 : 0.9)
  return animal + reste > 0 ? Math.min(100, (animal / (animal + reste)) * 100) : null
}
