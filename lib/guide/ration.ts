import { computeRation, FRESH_KCAL_100G, KIBBLE_KCAL_100G } from '@/lib/calculators'

// @cdc guide — page « Combien lui donner » : même formule que /outils/ration (lib/calculators),
// chien adulte à activité normale. Les phrases viennent de la page de l'outil et de sa FAQ.

export const RATION_WEIGHTS = [3, 5, 10, 15, 20, 25, 30, 40] as const

export interface RationRow {
  kg: number
  kcal: number
  kibble: number
  fresh: number
  sterilizedKibble: number
  treatsKcal: number
}

export function rationRows(): RationRow[] {
  return RATION_WEIGHTS.map((kg) => {
    const base = { animal: 'chien', weightKg: kg, ageGroup: 'adulte', activityLevel: 'normal' } as const
    const r = computeRation({ ...base, sterilized: false })
    const s = computeRation({ ...base, sterilized: true })
    return { kg, kcal: r.kcal, kibble: r.gKibble, fresh: r.gFresh, sterilizedKibble: s.gKibble, treatsKcal: Math.round(r.kcal / 10) }
  })
}

export const RATION_TIPS: { title: string; text: string }[] = [
  {
    title: 'Le tableau du sac',
    text: `Il est calculé pour la densité de ces croquettes-là. Ce tableau prend une moyenne de ${KIBBLE_KCAL_100G} kcal pour 100 g (${FRESH_KCAL_100G} kcal pour un repas frais). Si ton sac indique une autre valeur, divise les kcal par cette valeur et multiplie par 100.`,
  },
  {
    title: 'Il grossit ou il maigrit',
    text: 'Si ton chien prend du poids avec la ration calculée, réduis de 10 %. S’il en perd, augmente de 10 %. Un suivi de 4 semaines suffit en général pour trouver la bonne quantité.',
  },
  {
    title: 'Combien de repas',
    text: 'Deux repas par jour pour un adulte, matin et soir. Trois pour un chiot de moins de 6 mois. Évite de donner toute la ration en une fois à un chien de grande race, à cause du risque de torsion de l’estomac.',
  },
  {
    title: 'Les friandises',
    text: 'Toutes friandises réunies restent sous 10 % de l’apport calorique quotidien (repère courant des vétérinaires).',
  },
]
