import { getBrandBySlug } from '@/data/brands'
import type { ActivityLevel } from '@/lib/calculators'
import { CONFIRMED_DISCOUNTS, type OfferSlug } from '@/data/partner-discounts'

// @cdc premium — offres partenaires du compte, choisies selon le profil du chien. Fonction pure
// (testée par scripts/test-account-offers.ts). Remises : uniquement celles confirmées par le
// propriétaire (DECISIONS.md, 2026-11-02). Raisons : reprises des fiches de data/brands.ts, aucun
// fait ajouté. Fidelis (rupture) et Petty Well (plus partenaire) ne sont jamais proposés.

// Remises : une seule table, data/partner-discounts.ts (aussi lue par data/brands.ts).
export { CONFIRMED_DISCOUNTS, type OfferSlug }

export interface AccountOffer {
  slug: OfferSlug
  brand: string
  url: string
  discount: string | null
  reason: string
}

export type LifeStage = 'chiot' | 'adulte' | 'senior'
export type SizeBand = 'petit' | 'moyen' | 'grand' | 'geant'

export interface OfferProfile {
  /** Âge en mois, null si inconnu */
  ageMonths: number | null
  weightKg: number | null
  sterilized: boolean
  activity: ActivityLevel
  /** Prise de poids récente constatée sur les pesées */
  gainingWeight?: boolean
}

/** Mêmes seuils que /outils/ration : chiot avant 1 an, senior à partir de 7 ans. */
export function lifeStage(ageMonths: number | null): LifeStage {
  if (ageMonths === null) return 'adulte'
  if (ageMonths < 12) return 'chiot'
  return ageMonths >= 84 ? 'senior' : 'adulte'
}

/** Gabarit selon le poids (repères de lib/calculators.ts : 10, 25 et 40 kg). */
export function sizeBand(weightKg: number | null): SizeBand | null {
  if (!weightKg) return null
  if (weightKg < 10) return 'petit'
  if (weightKg <= 25) return 'moyen'
  return weightKg <= 40 ? 'grand' : 'geant'
}

interface Rule {
  slug: OfferSlug
  points: number
  reason: string
  when: (p: OfferProfile, stage: LifeStage, size: SizeBand | null) => boolean
}

// Chaque raison renvoie à une ligne de data/brands.ts (pros, facts) : la citer, pas l'enrichir.
const RULES: Rule[] = [
  // Chiot : boosters Puppy de Dog Chef (pros), sachets prédosés de Dogfy (facts.strength)
  { slug: 'dog-chef', points: 5, when: (_, s) => s === 'chiot', reason: "Un booster Puppy s'ajoute aux repas des chiots, et la ration est recalculée quand son poids change." },
  { slug: 'dogfy-diet', points: 3, when: (_, s, z) => s === 'chiot' && z !== 'geant', reason: 'Sachets prédosés prêts à servir, avec un suivi nutritionnel gratuit.' },
  // Senior : Elmut et Dog Chef conseillés pour le chien senior (facts.bestFor)
  { slug: 'elmut', points: 5, when: (_, s) => s === 'senior', reason: 'Conseillé dans notre fiche pour le chien senior : repas frais cuits sous vide à 90 °C, sans conservateur.' },
  { slug: 'dog-chef', points: 4, when: (_, s) => s === 'senior', reason: "Un booster Senior s'ajoute à ses repas, et la ration suit son poids." },
  // Surpoids, stérilisé ou chien calme : ration calculée et recalculée (Dog Chef, Elmut)
  { slug: 'dog-chef', points: 6, when: (p) => Boolean(p.gainingWeight), reason: 'Portions recalculées quand son poids change : utile pour un chien qui prend du poids.' },
  { slug: 'elmut', points: 4, when: (p) => Boolean(p.gainingWeight), reason: 'Conseillé dans notre fiche pour le chien en surpoids : ration calculée au profil du chien, cuisson douce.' },
  { slug: 'dog-chef', points: 2, when: (p, s) => s === 'adulte' && (p.sterilized || p.activity === 'sedentaire'), reason: 'Ration calculée sur son profil et recalculée quand son poids change, pratique pour un chien stérilisé ou calme.' },
  { slug: 'elmut', points: 2, when: (p, s) => s === 'adulte' && (p.sterilized || p.activity === 'sedentaire'), reason: 'Ration calculée au profil du chien et cuisson douce sous vide à 90 °C.' },
  // Petit gabarit : prix publié d'Elmut pour un chien de moins de 10 kg (facts.price)
  { slug: 'elmut', points: 2, when: (_, s, z) => s !== 'chiot' && z === 'petit', reason: 'Environ 55 à 75 € par mois pour un chien de moins de 10 kg, en repas frais livrés réfrigérés.' },
  // Adulte actif : viande en tête chez Franklin (pros)
  { slug: 'franklin', points: 4, when: (p, s) => s === 'adulte' && (p.activity === 'actif' || p.activity === 'tres-actif'), reason: "Jusqu'à 70 % de viande dans les croquettes, cuites entre 90 et 110 °C." },
  // Adulte sans souci particulier, grand gabarit : prix au kilo d'Ultra Premium Direct (facts)
  { slug: 'ultra-premium-direct', points: 3, when: (p, s, z) => s === 'adulte' && !p.gainingWeight && (z === 'grand' || z === 'geant'), reason: 'Le prix au kilo le plus bas de notre sélection, environ 3 à 5 € le kg : ça compte pour un grand chien.' },
  { slug: 'ultra-premium-direct', points: 2, when: (p, s) => s === 'adulte' && !p.gainingWeight && !p.sterilized, reason: 'Croquettes vendues en direct, environ 3 à 5 € le kg, pour un chien adulte sans souci particulier.' },
  // Repères par défaut : une seule source de viande (Franklin), repas frais dosés (Dog Chef)
  { slug: 'franklin', points: 1, when: (_, s) => s !== 'senior', reason: 'Une seule source de viande par recette, pratique si son ventre est sensible.' },
  { slug: 'dog-chef', points: 1, when: () => true, reason: 'Repas frais livrés gratuitement, ration calculée sur son profil.' },
  { slug: 'dogfy-diet', points: 1, when: (p, _, z) => !p.gainingWeight && z !== 'geant', reason: 'Sachets prédosés prêts à servir, avec un suivi nutritionnel gratuit.' },
]

export function toOffer(slug: OfferSlug, reason: string): AccountOffer {
  const brand = getBrandBySlug(slug)
  if (!brand) throw new Error(`marque inconnue : ${slug}`)
  return { slug, brand: brand.name, url: brand.affiliateUrl, discount: CONFIRMED_DISCOUNTS[slug], reason }
}

/** 2 à 3 offres pour ce chien, la plus adaptée en premier. */
export function offersFor(profile: OfferProfile, max = 3): AccountOffer[] {
  const stage = lifeStage(profile.ageMonths)
  const size = sizeBand(profile.weightKg)
  const best = new Map<OfferSlug, { points: number; top: number; reason: string; order: number }>()
  RULES.forEach((r, order) => {
    if (!r.when(profile, stage, size)) return
    const cur = best.get(r.slug)
    if (!cur) best.set(r.slug, { points: r.points, top: r.points, reason: r.reason, order })
    else {
      cur.points += r.points
      if (r.points > cur.top) Object.assign(cur, { top: r.points, reason: r.reason })
    }
  })
  return [...best.entries()]
    .sort(([, a], [, b]) => b.points - a.points || a.order - b.order)
    .slice(0, Math.max(2, Math.min(3, max)))
    .map(([slug, v]) => toOffer(slug, v.reason))
}

/** Offre pour un chien qui prend du poids : Dog Chef recalcule les portions (data/brands.ts). */
export function weightGainOffer(): AccountOffer {
  return toOffer('dog-chef', 'Portions recalculées quand son poids change : la ration suit la courbe sans calcul de ta part.')
}

/** Alternative à une croquette mal notée : une croquette, avec la viande en tête (Franklin). */
export function betterKibbleOffer(): AccountOffer {
  return toOffer('franklin', "Jusqu'à 70 % de viande et une seule source de viande par recette.")
}
