import { kindOf, type ScoreResult } from './score'
import type { ExtractedLabel } from './types'

// @cdc lot 6 — le mot qui désigne le produit dans les textes d'une fiche (titre, H1, description,
// verdict, PDF, story) : une pâtée n'est pas appelée « croquettes ». Pâtée : aliment humide
// (typeAliment « humide » ou humidité ≥ 60 %) ; croquettes : aliment sec ; type inconnu :
// « aliment » ; friandise : son barème. L'adresse /croquettes/[slug] ne change pas. Fonction pure.

export type FoodNoun = 'croquettes' | 'patee' | 'aliment' | 'friandise'

/** Humidité à partir de laquelle un aliment est une pâtée (les croquettes restent sous 14 %). */
export const WET_MOISTURE = 60

type NounLabel = Pick<ExtractedLabel, 'typeImage' | 'typeAliment' | 'constituants'>

export function foodNoun(label: NounLabel, details?: Pick<ScoreResult, 'kind'>): FoodNoun {
  if ((details && kindOf(details) === 'treat') || label.typeImage === 'friandise') return 'friandise'
  if (label.typeAliment === 'humide' || (label.constituants.humidite ?? 0) >= WET_MOISTURE) return 'patee'
  return label.typeAliment === 'sec' ? 'croquettes' : 'aliment'
}

export interface NounWords {
  /** « Croquettes », « Pâtée », « Aliment », « Friandise » (début de title) */
  title: string
  /** « ces croquettes », « cette pâtée »… */
  these: string
  /** « Croquettes pour chien »… (nom de secours, catégorie JSON-LD) */
  forDog: string
  /** H1 quand ni le produit ni la marque ne sont lisibles */
  unnamed: string
  /** H2 de la composition */
  contains: string
  /** Pastille de la story et de l'image de partage */
  tag: string
  /** Bouton de la story */
  cta: string
  /** Emballage sur lequel vérifier la lecture */
  pack: string
  /** H2 du verdict, avec ou sans marque */
  question: (brand: string | null) => string
}

export const NOUNS: Record<FoodNoun, NounWords> = {
  croquettes: {
    title: 'Croquettes',
    these: 'ces croquettes',
    forDog: 'Croquettes pour chien',
    unnamed: 'Croquettes sans nom lisible',
    contains: 'Que contiennent ces croquettes ?',
    tag: 'Scanner de croquettes',
    cta: 'Scanne tes croquettes',
    pack: 'le sac',
    question: (b) => `Les croquettes ${b ?? 'de cette marque'} sont-elles bonnes pour ton chien ?`,
  },
  patee: {
    title: 'Pâtée',
    these: 'cette pâtée',
    forDog: 'Pâtée pour chien',
    unnamed: 'Pâtée sans nom lisible',
    contains: 'Que contient cette pâtée ?',
    tag: 'Pâtée notée sur 100',
    cta: 'Scanne ses pâtées',
    pack: "l'emballage",
    question: (b) => (b ? `La pâtée ${b} est-elle bonne pour ton chien ?` : 'Cette pâtée est-elle bonne pour ton chien ?'),
  },
  aliment: {
    title: 'Aliment',
    these: 'cet aliment',
    forDog: 'Aliment pour chien',
    unnamed: 'Aliment sans nom lisible',
    contains: 'Que contient cet aliment ?',
    tag: 'Aliment noté sur 100',
    cta: 'Scanne sa gamelle',
    pack: "l'emballage",
    question: (b) => (b ? `Cet aliment ${b} est-il bon pour ton chien ?` : 'Cet aliment est-il bon pour ton chien ?'),
  },
  friandise: {
    title: 'Friandise',
    these: 'cette friandise',
    forDog: 'Friandise pour chien',
    unnamed: 'Friandise sans nom lisible',
    contains: 'Que contient cette friandise ?',
    tag: 'Friandise notée sur 100',
    cta: 'Scanne ses friandises',
    pack: 'le paquet',
    question: (b) => (b ? `Cette friandise ${b} est-elle bonne pour ton chien ?` : 'Cette friandise est-elle bonne pour ton chien ?'),
  },
}

/** Mots d'une fiche enregistrée (étiquette lue et note). */
export const nounWords = (label: NounLabel, details?: Pick<ScoreResult, 'kind'>): NounWords => NOUNS[foodNoun(label, details)]

/** Catégorie d'une note : deux notes ne se comparent que dans la même. Type inconnu : null. */
export const CATEGORY_PHRASE: Record<FoodNoun, string | null> = { croquettes: 'parmi les croquettes', patee: 'parmi les pâtées', friandise: 'parmi les friandises', aliment: null }

export const COMPLETE_CATEGORIES = [
  { noun: 'croquettes', label: 'Croquettes' },
  { noun: 'patee', label: 'Pâtées' },
  { noun: 'aliment', label: 'Type inconnu' },
] as const

export type CompleteCategory = (typeof COMPLETE_CATEGORIES)[number]['noun']

export function parseCategory(value: string | string[] | undefined): CompleteCategory {
  const raw = Array.isArray(value) ? value[0] : value
  return COMPLETE_CATEGORIES.find((c) => c.noun === raw)?.noun ?? 'croquettes'
}

/** ?categorie= d'une liste : rien pour les croquettes, la catégorie par défaut. */
export const categoryQuery = (category: CompleteCategory): string => (category === 'croquettes' ? '' : `categorie=${category}`)
