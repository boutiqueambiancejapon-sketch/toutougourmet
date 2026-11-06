import { sql } from 'drizzle-orm'
import { MODEL_REVIEWS } from '@/data/model-reviews'
import { marquePage } from '@/data/marque-pages'
import { foodAnalysis } from '@/db/schema'
import { horsListes, NOM_CLASSEMENT } from '@/lib/scanner/baremes/fiche'
import { ficheIndexeePath, parCle, type FicheType } from '@/lib/scanner/fiches-indexees'
import { foodNoun } from '@/lib/scanner/food-noun'
import { cleMarque } from '@/lib/scanner/marque'
import { displayBrand, displayName, fold, recipeKey, recipeName } from '@/lib/scanner/rankings'
import type { ScoreResult } from '@/lib/scanner/score'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { getDb } from '@/lib/server/drizzle'
import { fichesIndexees } from '@/lib/server/fiches-indexees'

// @cdc tableau de bord — toutes les fiches, une ligne par recette, avec leur état pour Google. Fonction de lecture seule.

export type TypeFiche = 'croquettes' | 'patee' | 'friandise' | 'complement' | 'huile' | 'autre'
export const TYPE_LABEL: Record<TypeFiche, string> = { croquettes: 'Croquettes', patee: 'Pâtée', friandise: 'Friandise', complement: 'Complément', huile: 'Huile', autre: 'Type incertain' }
export const TYPE_ADRESSE: Partial<Record<TypeFiche, FicheType>> = { croquettes: 'croquettes', patee: 'patees', friandise: 'friandises' }

export interface LigneIndex {
  id: string
  slug: string
  marque: string
  nom: string
  score: number | null
  type: TypeFiche
  formats: number
  indexee: boolean
  adresse: string
  /** Raison pour laquelle la fiche ne peut pas être ouverte à Google. */
  blocage: string | null
  pageMere: boolean
}

export function typeDeFiche(extracted: ExtractedLabel, details: ScoreResult): TypeFiche {
  const t = details.bareme?.type
  if (t === 'complement' || t === 'huile') return t
  const classement = details.bareme?.classement
  const noun = classement ? NOM_CLASSEMENT[classement] : foodNoun(extracted, details)
  return noun === 'croquettes' || noun === 'patee' || noun === 'friandise' ? noun : 'autre'
}

function blocageDe(type: TypeFiche, score: number | null, cle: string, details: ScoreResult): string | null {
  if (score === null) return 'Sans note'
  if (MODEL_REVIEWS[cle]) return 'A déjà son article d\'avis'
  if (type === 'complement' || type === 'huile') return 'Reste hors de Google pour l\'instant'
  if (type === 'autre') return 'Type à confirmer'
  if (horsListes(details)) return 'Aliment vétérinaire ou note peu fiable'
  return null
}

export async function lignesIndex(): Promise<LigneIndex[]> {
  const d = getDb()
  if (!d) return []
  const [rows, fiches] = await Promise.all([
    d
      .select({ id: foodAnalysis.id, slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score, extracted: foodAnalysis.extracted, details: foodAnalysis.details })
      .from(foodAnalysis)
      .where(sql`NOT ${foodAnalysis.discarded}`),
    fichesIndexees(),
  ])
  const groupes = new Map<string, LigneIndex>()
  for (const r of rows) {
    const cle = r.brand && r.product ? recipeKey(r.brand, r.product) : r.slug
    const vue = groupes.get(cle)
    if (vue && (vue.score ?? -1) >= (r.score ?? -1)) {
      vue.formats += 1
      continue
    }
    const details = r.details as ScoreResult
    const type = typeDeFiche(r.extracted as ExtractedLabel, details)
    const f = parCle(fiches, cle)
    groupes.set(cle, {
      id: r.id,
      slug: r.slug,
      marque: r.brand ? displayBrand(r.brand) : 'Marque illisible',
      nom: f?.nom ?? (r.product ? displayName(recipeName(r.product)) : 'Produit sans nom'),
      score: r.score,
      type,
      formats: (vue?.formats ?? 0) + 1,
      indexee: Boolean(f),
      adresse: f ? ficheIndexeePath(f) : `/croquettes/${r.slug}`,
      blocage: blocageDe(type, r.score, cle, details),
      pageMere: Boolean(marquePage(r.brand)),
    })
  }
  // Une écriture inconnue d'une marque rejoint la plus fréquente, pour que le filtre n'en montre qu'une.
  const parCleMarque = new Map<string, Map<string, number>>()
  for (const l of groupes.values()) {
    const m = parCleMarque.get(cleMarque(l.marque)) ?? new Map<string, number>()
    parCleMarque.set(cleMarque(l.marque), m.set(l.marque, (m.get(l.marque) ?? 0) + 1))
  }
  for (const l of groupes.values()) l.marque = [...(parCleMarque.get(cleMarque(l.marque)) ?? [])].sort((a, b) => b[1] - a[1])[0][0]
  return [...groupes.values()].sort((a, b) => Number(b.indexee) - Number(a.indexee) || a.marque.localeCompare(b.marque, 'fr') || (b.score ?? -1) - (a.score ?? -1))
}

export interface FiltresIndex {
  marque?: string
  type?: string
  statut?: string
  q?: string
}

export function filtrerLignes(lignes: LigneIndex[], f: FiltresIndex): LigneIndex[] {
  const q = fold(f.q?.trim() ?? '')
  return lignes.filter((l) =>
    (!f.marque || l.marque === f.marque) &&
    (!f.type || l.type === f.type) &&
    (!f.statut || (f.statut === 'indexee') === l.indexee) &&
    (!q || fold(`${l.marque} ${l.nom}`).includes(q)),
  )
}
