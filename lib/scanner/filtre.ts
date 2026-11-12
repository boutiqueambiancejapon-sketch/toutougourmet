import { isCereal } from './ingredients'
import { capByBrand, segmentBySlug, type RankRecipe, type SegmentSlug } from './rankings'
import type { PrixMaxiZoo } from './prix'

// @cdc cluster scanner — filtre multi-critères des classements (demande du propriétaire, 2026-11-12, après Google
// Hydrogen) : type, âge, gabarit, besoin, sans céréales, budget au kilo, tri. Réutilise les règles des classements
// (segments) : un même produit est rangé pareil ici et sur /meilleures-…. Fonctions pures.

export interface Filtre {
  type: 'croquettes' | 'patee'
  age: '' | 'chiot' | 'adulte' | 'senior'
  taille: '' | 'petit' | 'moyen' | 'grand'
  besoin: '' | 'sterilise' | 'surpoids' | 'digestion' | 'peau' | 'allergies' | 'articulations'
  cereales: boolean
  budget: number | null
  tri: 'note' | 'prix'
}

export const FILTRE_VIDE: Filtre = { type: 'croquettes', age: '', taille: '', besoin: '', cereales: false, budget: null, tri: 'note' }

const choix = <T extends string>(v: unknown, permis: readonly T[], defaut: T): T => (typeof v === 'string' && (permis as readonly string[]).includes(v) ? (v as T) : defaut)

export function lireFiltre(p: Record<string, string | string[] | undefined>): Filtre {
  const b = Number(typeof p.budget === 'string' ? p.budget.replace(',', '.') : NaN)
  return {
    type: choix(p.type, ['croquettes', 'patee'] as const, 'croquettes'),
    age: choix(p.age, ['', 'chiot', 'adulte', 'senior'] as const, ''),
    taille: choix(p.taille, ['', 'petit', 'moyen', 'grand'] as const, ''),
    besoin: choix(p.besoin, ['', 'sterilise', 'surpoids', 'digestion', 'peau', 'allergies', 'articulations'] as const, ''),
    cereales: p.cereales === 'sans',
    budget: Number.isFinite(b) && b > 0 && b < 200 ? b : null,
    tri: choix(p.tri, ['note', 'prix'] as const, 'note'),
  }
}

export const filtreActif = (f: Filtre): boolean => Boolean(f.age || f.taille || f.besoin || f.cereales || f.budget || f.type !== 'croquettes' || f.tri !== 'note')

const SEG_CROQ: Record<string, SegmentSlug> = {
  chiot: 'chiot', adulte: 'adulte', senior: 'senior', petit: 'petit-chien', moyen: 'chien-moyen', grand: 'grand-chien',
  sterilise: 'sterilise', surpoids: 'surpoids', digestion: 'digestion-sensible', peau: 'peau-sensible', allergies: 'hypoallergeniques', articulations: 'articulations',
}
const SEG_PATEE: Record<string, SegmentSlug> = { chiot: 'patees-chiot', senior: 'patees-senior', petit: 'patees-petit-chien' }

/** Critères qui ne s'appliquent pas aux pâtées (pas de segment) : ignorés et signalés. */
export function criteresIgnores(f: Filtre): string[] {
  if (f.type !== 'patee') return []
  return [f.age === 'adulte' ? 'âge adulte' : '', f.taille && f.taille !== 'petit' ? 'gabarit' : '', f.besoin ? 'besoin' : ''].filter(Boolean)
}

export function filtrer<T extends RankRecipe & { brand: string; score: number; buy: { prix?: PrixMaxiZoo } | null }>(liste: T[], f: Filtre): T[] {
  const segs = f.type === 'croquettes' ? SEG_CROQ : SEG_PATEE
  const tests = [f.age, f.taille, f.besoin].filter(Boolean).map((k) => segs[k]).filter(Boolean).map((s) => segmentBySlug(s)?.match).filter((m): m is (r: RankRecipe) => boolean => Boolean(m))
  const kg = (r: T) => r.buy?.prix?.prixKg ?? null
  const res = liste.filter((r) =>
    r.noun === f.type &&
    tests.every((t) => t(r)) &&
    (!f.cereales || (r.ingredients.length >= 5 && !r.ingredients.some(isCereal))) &&
    (f.budget === null || (kg(r) !== null && (kg(r) as number) <= f.budget)),
  )
  const trie = res.sort((a, b) => (f.tri === 'prix' ? (kg(a) ?? Infinity) - (kg(b) ?? Infinity) || b.score - a.score : b.score - a.score))
  return capByBrand(trie, 3)
}
