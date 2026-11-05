import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import type { FoodAnalysis } from '@/db/schema'
import { ficheIndexeePath, parCle, parCourt, parSlug, type FicheIndexee, type FicheType } from '@/lib/scanner/fiches-indexees'
import { sansDetail } from '@/lib/scanner/baremes/fiche'
import { ficheGardee } from '@/lib/scanner/baremes/fusions'
import { titreFiche } from '@/lib/scanner/fiche-texte'
import { kindOf } from '@/lib/scanner/score'
import { currentYear } from '@/lib/title-year'
import { foodNoun, NOUNS } from '@/lib/scanner/food-noun'
import { recipeKey } from '@/lib/scanner/rankings'
import { dryMatterBasis } from '@/lib/scanner/score'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { ficheTitle } from '@/lib/scanner/seo'
import { getDb } from '@/lib/server/drizzle'
import { getBySlug } from '@/lib/server/scanner'

// @cdc seo — quelle fiche sert quelle adresse, et ce que Google en voit. Fiche indexée : adresse courte par type, ancienne
// adresse redirigée. Autre format de la même recette : noindex, canonique vers la fiche indexée. Le reste : noindex.

const SITE = 'https://www.toutou-gourmet.com'

export interface FicheTrouvee {
  row: FoodAnalysis
  indexee?: FicheIndexee
  path: string
}

export async function ficheDeLAdresse(type: FicheType, slug: string): Promise<FicheTrouvee | null> {
  if (!getDb()) return null
  const indexee = parCourt(type, slug)
  if (indexee) {
    const row = await getBySlug(indexee.slug)
    return row && row.score !== null ? { row, indexee, path: ficheIndexeePath(indexee) } : null
  }
  if (type !== 'croquettes') return null
  const ancienne = parSlug(slug)
  if (ancienne) permanentRedirect(ficheIndexeePath(ancienne))
  const row = await getBySlug(slug)
  if (row) return { row, path: `/croquettes/${row.slug}` }
  // Doublon fusionné par l'activation des barèmes : l'ancienne adresse suit la fiche gardée.
  const garde = ficheGardee(slug)
  if (garde) permanentRedirect(`/croquettes/${garde}`)
  return null
}

export function ficheMetadata(f: FicheTrouvee | null): Metadata {
  if (!f) return { title: 'Fiche introuvable', robots: { index: false, follow: false } }
  const { row, indexee, path } = f
  const treat = kindOf(row.details) === 'treat'
  const label = row.extracted as ExtractedLabel
  const noun = foodNoun(row.extracted, row.details)
  const name = indexee?.nom ?? ([row.brand, row.product].filter(Boolean).join(' ') || NOUNS[noun].these)
  const image = `${SITE}/croquettes/${row.slug}/og.png`
  const soeur = !indexee && row.brand && row.product ? parCle(recipeKey(row.brand, row.product)) : undefined
  const note = row.score !== null ? `${row.score}/100` : null
  const prot = dryMatterBasis(label.constituants, label.typeAliment).protDm
  if (sansDetail(row.details)) return { title: { absolute: `${name}${note ? ` : note ${note}` : ''}` }, description: row.details.notice ?? undefined, alternates: { canonical: `${SITE}${path}` }, robots: { index: false, follow: true } }
  const what = treat ? 'premier ingrédient, part de viande, sucre, sel et additifs' : 'protéines et glucides sur matière sèche, premier ingrédient, additifs'
  return {
    title: { absolute: indexee ? titreFiche(indexee.nom, row.score, currentYear()) : ficheTitle(row.brand, row.product, row.score, noun) },
    description: (indexee
      ? `Avis et composition de ${indexee.nom} : premier ingrédient${prot !== null ? `, ${Math.round(prot)} % de protéines une fois l'eau retirée` : ''}, additifs et note de ${note} selon notre barème publié.`
      : `Avis et composition de ${name} : ${what}${note ? `, note de ${note}` : ''} selon notre barème publié.`
    ).slice(0, 160),
    alternates: { canonical: `${SITE}${soeur ? ficheIndexeePath(soeur) : path}` },
    openGraph: { title: `${name}${note ? ` : ${note}` : ''}`, url: `${SITE}${path}`, type: 'website', images: [{ url: image, width: 1200, height: 630, alt: `Note de ${name}` }] },
    robots: { index: Boolean(indexee), follow: true },
  }
}
