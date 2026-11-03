import { getBrandBySlug } from '@/data/brands'
import { CONFIRMED_DISCOUNTS, type OfferSlug } from '@/data/partner-discounts'

// @cdc affiliation — offre sous le résultat de /outils/ration, calculée sur les grammes du jour.
// Croquettes : Franklin ; repas frais : Dog Chef. Chiffres pris uniquement dans data/brands.ts
// (facts.price, prix publié par la marque) : un prix au kilo donne un coût par jour pour cette
// ration ; un prix déjà donné par jour est cité tel quel ; sans prix, l'offre reste sans calcul.
// Remise : data/partner-discounts.ts (seule source).

export interface RationOffer {
  brand: string
  href: string
  /** Phrase personnalisée : prénom (ou « ton chien »), grammes, coût par jour quand il se calcule */
  why: string
  /** Remise confirmée, chaîne vide sans remise */
  offer: string
}

const PER_KG = /Environ ([\d,]+) à ([\d,]+) € le kg/
const euros = (n: number): string => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const num = (s: string): number => Number(s.replace(',', '.'))

/** Coût par jour pour `grams` g, à partir d'un prix publié au kilo ; null sans prix au kilo. */
export function costPerDay(price: string, grams: number): { min: string; max: string; perKg: string } | null {
  const m = PER_KG.exec(price)
  if (!m) return null
  const [lo, hi] = [num(m[1]), num(m[2])]
  if (!(lo > 0) || !(hi >= lo)) return null
  return { min: euros((grams / 1000) * lo), max: euros((grams / 1000) * hi), perKg: `${m[1]} à ${m[2]} € le kg` }
}

export function rationOffer({ grams, fresh, dogName }: { grams: number; fresh: boolean; dogName?: string | null }): RationOffer | null {
  const slug: OfferSlug = fresh ? 'dog-chef' : 'franklin'
  const brand = getBrandBySlug(slug)
  if (!brand) return null
  const who = dogName?.trim() || 'ton chien'
  const what = fresh ? 'de repas frais' : 'de croquettes'
  const short = slug === 'franklin' ? 'Franklin' : brand.name
  const start = `Pour ${who}, ${grams} g ${what} par jour`
  const cost = costPerDay(brand.facts.price, grams)
  let why: string
  if (cost) {
    why = `${start} : ${short} revient à environ ${cost.min} à ${cost.max} € par jour (prix publié de ${cost.perKg}).`
  } else if (/par jour/.test(brand.facts.price)) {
    why = `${start} : ${short} cuisine cette ration selon son profil et la livre au frais. Prix annoncé : ${brand.facts.price.charAt(0).toLowerCase()}${brand.facts.price.slice(1)}.`
  } else {
    why = `${start} : ${short} propose une offre de bienvenue.`
  }
  return { brand: short, href: brand.affiliateUrl, why, offer: CONFIRMED_DISCOUNTS[slug] ?? '' }
}
