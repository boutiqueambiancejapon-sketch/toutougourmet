import type { Metadata } from 'next'
import { permanentRedirect, redirect } from 'next/navigation'
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
import { fichesIndexees } from '@/lib/server/fiches-indexees'
import { getBySlug } from '@/lib/server/scanner'

// @cdc seo — quelle fiche sert quelle adresse, et ce que Google en voit. Fiche indexée : adresse courte par type, ancienne
// adresse redirigée. Autre format de la même recette : noindex, canonique vers la fiche indexée. Le reste : noindex.

const SITE = 'https://www.toutou-gourmet.com'

export interface FicheTrouvee {
  row: FoodAnalysis
  indexee?: FicheIndexee
  path: string
  /** Fiche indexée d'un autre format de la même recette : la canonique. */
  soeur?: FicheIndexee
}

export async function ficheDeLAdresse(type: FicheType, slug: string): Promise<FicheTrouvee | null> {
  if (!getDb()) return null
  const liste = await fichesIndexees()
  const courte = parCourt(liste, type, slug)
  if (courte) {
    const row = await getBySlug(courte.slug)
    if (!row) return null
    // Retirée de l'index, ou sans note : la fiche reste lisible à son adresse habituelle, en noindex.
    if (!courte.actif || row.score === null) redirect(`/croquettes/${courte.slug}`)
    return { row, indexee: courte, path: ficheIndexeePath(courte) }
  }
  if (type !== 'croquettes') return null
  const row = await getBySlug(slug)
  if (row) {
    const ancienne = parSlug(liste, slug)
    if (ancienne && row.score !== null) permanentRedirect(ficheIndexeePath(ancienne))
    const soeur = row.brand && row.product ? parCle(liste, recipeKey(row.brand, row.product)) : undefined
    return { row, path: `/croquettes/${row.slug}`, soeur: soeur?.slug === row.slug ? undefined : soeur }
  }
  // Doublon fusionné par l'activation des barèmes : l'ancienne adresse suit la fiche gardée.
  const garde = ficheGardee(slug)
  if (garde) permanentRedirect(`/croquettes/${garde}`)
  return null
}

export function ficheMetadata(f: FicheTrouvee | null): Metadata {
  if (!f) return { title: 'Fiche introuvable', robots: { index: false, follow: false } }
  const { row, indexee, path, soeur } = f
  const treat = kindOf(row.details) === 'treat'
  const label = row.extracted as ExtractedLabel
  const noun = foodNoun(row.extracted, row.details)
  const name = indexee?.nom ?? ([row.brand, row.product].filter(Boolean).join(' ') || NOUNS[noun].these)
  const image = `${SITE}/croquettes/${row.slug}/og.png`
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
