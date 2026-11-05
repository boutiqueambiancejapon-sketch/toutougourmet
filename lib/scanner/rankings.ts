import { isCereal } from './ingredients'
import type { FoodNoun } from './food-noun'

// @cdc cluster scanner — classements par type de chien, type de produit et besoin (décision du 2026-11-05).
// Une ligne par recette, jamais par taille de sac. Les maladies graves n'ont pas de classement : la note
// favorise les protéines, ce qui nuirait à un chien malade (articles santé, formules sur avis vétérinaire).
// Fonctions pures.

export interface RankRecipe {
  name: string
  noun: FoodNoun
  ingredients: string[]
  fat: number | null
}

export type SegmentSlug =
  | 'tous' | 'chiot' | 'adulte' | 'senior' | 'petit-chien' | 'chien-moyen' | 'grand-chien' | 'sterilise'
  | 'sans-cereales' | 'surpoids' | 'digestion-sensible' | 'peau-sensible' | 'articulations' | 'hypoallergeniques'
  | 'patees' | 'friandises'

export interface RankSegment {
  slug: SegmentSlug
  /** Libellé court de la navigation */
  label: string
  /** « pour chiot » : complète « recettes … » */
  audience: string
  /** Page de classement, ou article existant qui porte déjà la requête : une requête, une page */
  path: string
  title: string
  h1: string
  description: string
  listTitle: string
  match: (r: RankRecipe) => boolean
  /** Surpoids : le moins gras d'abord, la note départage */
  byFat?: boolean
}

export const fold = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const named = (re: RegExp) => (r: RankRecipe) => r.noun === 'croquettes' && re.test(fold(r.name))
const PUPPY = /\b(chiot|puppy|junior|starter)\b/
const SENIOR = /\b(senior|ageing|mature|age defence)\b|\d\+/
const SMALL = /\b(mini|small|petite? (taille|race)|petit|yorkshire|chihuahua|bichon|maltese|shih tzu|teckel|carlin|caniche)\b/
const LARGE = /\b(maxi|large|giant|grande? (taille|race)|labrador|golden|berger allemand|boxer|rottweiler)\b/
const STERILISED = /sterilis|neutered/
const WEIGHT = /\b(light|weight|fit & trim|satiety)\b/

const page = (slug: string) => `/meilleures-croquettes/${slug}`

export const SEGMENTS: RankSegment[] = [
  { slug: 'tous', label: 'Toutes', audience: 'pour chien', path: '/meilleures-croquettes', title: 'Meilleures croquettes pour chien : le classement', h1: 'Meilleures croquettes pour chien : le classement par composition', description: 'Les croquettes pour chien classées par note de composition sur 100, recette par recette, à partir des étiquettes lues chez Maxi Zoo.', listTitle: 'Quelles croquettes pour chien ont la meilleure composition ?', match: (r) => r.noun === 'croquettes' },
  { slug: 'chiot', label: 'Chiot', audience: 'pour chiot', path: page('chiot'), title: 'Meilleures croquettes pour chiot : le classement', h1: 'Meilleures croquettes pour chiot : le classement par composition', description: 'Les croquettes pour chiot classées par note de composition sur 100, de la petite à la grande taille, à partir des étiquettes lues chez Maxi Zoo.', listTitle: 'Quelles croquettes pour chiot ont la meilleure composition ?', match: named(PUPPY) },
  { slug: 'adulte', label: 'Adulte', audience: 'pour chien adulte', path: page('adulte'), title: 'Meilleures croquettes pour chien adulte : classement', h1: 'Meilleures croquettes pour chien adulte : le classement par composition', description: 'Les croquettes pour chien adulte classées par note de composition sur 100, à partir des étiquettes lues chez Maxi Zoo, recette par recette.', listTitle: 'Quelles croquettes pour chien adulte ont la meilleure composition ?', match: (r) => r.noun === 'croquettes' && !PUPPY.test(fold(r.name)) && !SENIOR.test(fold(r.name)) },
  { slug: 'senior', label: 'Senior', audience: 'pour chien senior', path: '/chien/avis-marques/meilleures-croquettes-chien-senior', title: '', h1: '', description: '', listTitle: 'Quelles croquettes pour chien senior ont la meilleure composition ?', match: named(SENIOR) },
  { slug: 'petit-chien', label: 'Petit chien', audience: 'pour petit chien', path: '/chien/avis-marques/meilleures-croquettes-petit-chien', title: '', h1: '', description: '', listTitle: 'Quelles croquettes pour petit chien ont la meilleure composition ?', match: named(SMALL) },
  { slug: 'chien-moyen', label: 'Chien moyen', audience: 'pour chien de taille moyenne', path: page('chien-moyen'), title: 'Meilleures croquettes pour chien moyen : classement', h1: 'Meilleures croquettes pour chien de taille moyenne : le classement', description: 'Les croquettes pour chien de taille moyenne classées par note de composition sur 100, à partir des étiquettes lues chez Maxi Zoo.', listTitle: 'Quelles croquettes pour chien moyen ont la meilleure composition ?', match: named(/\b(medium|moyenne?)\b/) },
  { slug: 'grand-chien', label: 'Grand chien', audience: 'pour grand chien', path: page('grand-chien'), title: 'Meilleures croquettes pour grand chien : classement', h1: 'Meilleures croquettes pour grand chien : le classement par composition', description: 'Les croquettes pour grand chien classées par note de composition sur 100, à partir des étiquettes lues chez Maxi Zoo, recette par recette.', listTitle: 'Quelles croquettes pour grand chien ont la meilleure composition ?', match: named(LARGE) },
  { slug: 'sterilise', label: 'Stérilisé', audience: 'pour chien stérilisé', path: '/chien/alimentation-quotidienne/croquettes-chien-sterilise', title: '', h1: '', description: '', listTitle: 'Quelles croquettes pour chien stérilisé ont la meilleure composition ?', match: named(STERILISED) },
  { slug: 'sans-cereales', label: 'Sans céréales', audience: 'sans céréales', path: '/chien/alimentation-quotidienne/croquettes-sans-cereales-chien', title: '', h1: '', description: '', listTitle: 'Quelles croquettes sans céréales ont la meilleure composition ?', match: (r) => r.noun === 'croquettes' && r.ingredients.length >= 5 && !r.ingredients.some(isCereal) },
  { slug: 'surpoids', label: 'Surpoids', audience: 'allégées', path: page('surpoids'), title: 'Meilleures croquettes pour chien en surpoids : classement', h1: 'Meilleures croquettes pour chien en surpoids : les moins grasses', description: 'Les croquettes allégées pour chien classées de la moins grasse à la plus grasse, à partir des étiquettes lues chez Maxi Zoo. Avis du vétérinaire conseillé.', listTitle: 'Quelles croquettes allégées sont les moins grasses ?', match: named(WEIGHT), byFat: true },
  { slug: 'digestion-sensible', label: 'Digestion', audience: 'pour digestion sensible', path: '/chien/alimentation-quotidienne/croquettes-chien-digestion-sensible', title: '', h1: '', description: '', listTitle: 'Quelles croquettes pour digestion sensible ont la meilleure composition ?', match: named(/digest|sensitive stomach/) },
  { slug: 'peau-sensible', label: 'Peau', audience: 'pour peau sensible', path: '/chien/sante/croquettes-chien-dermatite', title: '', h1: '', description: '', listTitle: 'Quelles croquettes pour peau sensible ont la meilleure composition ?', match: named(/\b(skin|dermacomfort)\b/) },
  { slug: 'articulations', label: 'Articulations', audience: 'pour les articulations', path: '/chien/sante/croquettes-chien-arthrose', title: '', h1: '', description: '', listTitle: 'Quelles croquettes pour les articulations ont la meilleure composition ?', match: named(/\b(joint|mobility)\b/) },
  { slug: 'hypoallergeniques', label: 'Allergies', audience: 'hypoallergéniques', path: '/chien/alimentation-quotidienne/croquettes-chien-allergique', title: '', h1: '', description: '', listTitle: 'Quelles croquettes hypoallergéniques ont la meilleure composition ?', match: named(/hypoallerg/) },
  { slug: 'patees', label: 'Pâtées', audience: 'en pâtée', path: '/chien/alimentation-quotidienne/meilleures-patees-chien', title: '', h1: '', description: '', listTitle: 'Quelles pâtées pour chien ont la meilleure composition ?', match: (r) => r.noun === 'patee' },
  { slug: 'friandises', label: 'Friandises', audience: 'en friandise', path: '/meilleures-friandises', title: 'Meilleures friandises pour chien : le classement', h1: 'Meilleures friandises pour chien : le classement par composition', description: 'Les friandises pour chien classées par note sur 100, selon leur barème propre, à partir des étiquettes lues chez Maxi Zoo.', listTitle: 'Quelles friandises pour chien ont la meilleure composition ?', match: (r) => r.noun === 'friandise' },
]

export const segmentBySlug = (slug: string): RankSegment | undefined => SEGMENTS.find((s) => s.slug === slug)

/** Pages qui ont leur propre adresse sous /meilleures-croquettes (les autres vivent dans un article). */
export const PAGE_SEGMENTS = SEGMENTS.filter((s) => s.path.startsWith('/meilleures-croquettes/'))

/** Seuil d'ouverture à Google : assez de recettes et de marques pour que le classement veuille dire quelque chose. */
export const MIN_RECIPES = { pillar: 30, segment: 8 }
export const MIN_BRANDS = { pillar: 8, segment: 3 }

/** Nom sans la taille du sac ni le lot : « Mini Adulte 4 kg », « 2x2 kg ». */
export function recipeName(product: string): string {
  return product
    .replace(/\b\d+\s*x\s*[\d,.]+\s*k?g\b/gi, '')
    .replace(/\b[\d,.]+\s*k?g\b/gi, '')
    .replace(/[\s,–-]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export const recipeKey = (brand: string | null, product: string): string =>
  `${fold(brand ?? '')}|${fold(recipeName(product)).replace(/[^a-z0-9]+/g, ' ').trim()}`
