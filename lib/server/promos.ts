import { marquePage } from '@/data/marque-pages'
import { partnerSlugFromName } from '@/data/partner-discounts'
import { remise } from '@/lib/scanner/prix'
import { displayBrand, fold } from '@/lib/scanner/rankings'
import { slugify } from '@/lib/scanner/slug'
import { rankedRecipes, type RankedRecipe } from './rankings'

// @cdc affiliation — promotions et prix Maxi Zoo par marque (stratégie « promo croquettes + marque », 2026-11-12).
// Une page par marque qui a une page « Avis + marque » et assez de recettes avec un prix : promotions du jour, puis
// recettes de la moins chère à la plus chère au kilo. Jamais de faux code promo.

export const NOTE_MIN_PROMO = 70
export const MIN_PRIX_MARQUE = 6

export interface MarquePromo {
  slug: string
  nom: string
  avis: string
  /** Croquettes puis pâtées, chacune de la moins chère à la plus chère au kilo (jamais mélangées : la pâtée contient de l'eau). */
  croquettes: RankedRecipe[]
  patees: RankedRecipe[]
  promos: RankedRecipe[]
  releve: string | null
}

const avecPrix = (r: RankedRecipe) => Boolean(r.buy?.prix)
const pctDe = (r: RankedRecipe) => (r.buy?.prix ? (remise(r.buy.prix) ?? 0) : 0)

/** Promotions du jour bien notées, plus forte remise d'abord. */
export function promosDuJour(toutes: RankedRecipe[]): RankedRecipe[] {
  return toutes.filter((r) => r.score >= NOTE_MIN_PROMO && pctDe(r) > 0).sort((a, b) => pctDe(b) - pctDe(a) || b.score - a.score)
}

/** Marques avec une page de promo : page mère existante et au moins MIN_PRIX_MARQUE recettes avec un prix. */
export async function marquesPromo(): Promise<MarquePromo[]> {
  const toutes = await rankedRecipes().catch(() => [])
  const parMarque = new Map<string, RankedRecipe[]>()
  for (const r of toutes.filter(avecPrix)) {
    const k = fold(r.brand)
    parMarque.set(k, [...(parMarque.get(k) ?? []), r])
  }
  const sortie: MarquePromo[] = []
  for (const recettes of parMarque.values()) {
    const mere = marquePage(recettes[0].brand)
    const kg = (r: RankedRecipe) => r.buy?.prix?.prixKg ?? Infinity
    const parKilo = (noun: RankedRecipe['noun']) => recettes.filter((r) => r.noun === noun).sort((a, b) => kg(a) - kg(b) || b.score - a.score)
    const croquettes = parKilo('croquettes')
    const patees = parKilo('patee')
    // Marque partenaire : sa seule page de réduction est /codes-promo/{marque} (anti-cannibalisation, 2026-11-12).
    if (!mere || partnerSlugFromName(recettes[0].brand) || Math.max(croquettes.length, patees.length) < MIN_PRIX_MARQUE) continue
    sortie.push({
      slug: slugify(displayBrand(recettes[0].brand).replace(/['’]/g, '')),
      nom: displayBrand(recettes[0].brand),
      avis: mere.href,
      croquettes,
      patees,
      promos: recettes.filter((r) => pctDe(r) > 0).sort((a, b) => pctDe(b) - pctDe(a)),
      releve: recettes[0].buy?.prix?.releve ?? null,
    })
  }
  return sortie.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}
