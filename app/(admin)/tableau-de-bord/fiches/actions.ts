'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { marquePage } from '@/data/marque-pages'
import { MODEL_REVIEWS } from '@/data/model-reviews'
import { ficheIndex } from '@/db/schema'
import { assertDashboardAction as assertDashboard } from '@/lib/dashboard/guard'
import { horsListes } from '@/lib/scanner/baremes/fiche'
import { ficheIndexeePath, nomRecette } from '@/lib/scanner/fiches-indexees'
import { recipeKey, recipeName } from '@/lib/scanner/rankings'
import type { ScoreResult } from '@/lib/scanner/score'
import { baseSlug } from '@/lib/scanner/slug'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { TYPE_ADRESSE, typeDeFiche } from '@/lib/server/dashboard-fiche-index'
import { getDb } from '@/lib/server/drizzle'
import { labelFromForm } from '@/lib/scanner/review-form'
import { brandSlug } from '@/lib/scanner/seo'
import { decideImported, deleteAnalysis, getAnalysis, markReportHandled, updateAnalysis } from '@/lib/server/scanner-review'

// @cdc lot 6 — actions de relecture des fiches. Chaque action vérifie elle-même l'authentification
// HTTP Basic du tableau de bord (le proxy ne suffit pas : une action serveur est un point d'entrée).


/** Pages publiques touchées par une fiche : elle-même, le classement, sa marque, /scanner, le sitemap. */
function revalidatePublic(slug: string, brand: string | null): void {
  revalidatePath(`/croquettes/${slug}`)
  revalidatePath('/croquettes')
  revalidatePath('/croquettes/sitemap.xml')
  revalidatePath('/scanner')
  const b = brandSlug(brand)
  if (b) revalidatePath(`/croquettes/marque/${b}`)
}

export async function saveFiche(id: string, form: FormData): Promise<void> {
  await assertDashboard()
  const row = await getAnalysis(id)
  if (!row) redirect('/tableau-de-bord/contenu#fiches')
  const intent = String(form.get('intent') ?? 'save')
  const reviewed = intent === 'validate' ? true : intent === 'unpublish' ? false : undefined
  const updated = await updateAnalysis(id, labelFromForm(row.extracted, form), reviewed)
  revalidatePublic(row.slug, row.brand)
  if (updated && updated.brand !== row.brand) revalidatePublic(updated.slug, updated.brand)
  revalidatePath(`/tableau-de-bord/fiches/${id}`)
  if (intent === 'validate') redirect('/tableau-de-bord/contenu#fiches')
}

export async function removeFiche(id: string): Promise<void> {
  await assertDashboard()
  const removed = await deleteAnalysis(id)
  if (removed) revalidatePublic(removed.slug, removed.brand)
  redirect('/tableau-de-bord/contenu#fiches')
}

export async function handleReport(analysisId: string, reportId: string): Promise<void> {
  await assertDashboard()
  await markReportHandled(reportId, analysisId)
  revalidatePath(`/tableau-de-bord/fiches/${analysisId}`)
}

/** Fiche importée d'Open Pet Food Facts : « Valider » (relue, indexable) ou « Écarter » (jamais indexée, gardée pour le scanner). */
export async function decideImportedFiche(id: string, decision: 'validate' | 'discard'): Promise<void> {
  await assertDashboard()
  if (decision !== 'validate' && decision !== 'discard') throw new Error('Décision inconnue')
  const row = await decideImported(id, decision)
  if (row) revalidatePublic(row.slug, row.brand)
  revalidatePath('/tableau-de-bord/contenu')
}

/** Ouvre une recette à Google ou l'en retire. Retirée, elle garde son adresse courte, qui redirige vers sa fiche en noindex. */
export async function basculerIndex(id: string, ouvrir: boolean): Promise<void> {
  await assertDashboard()
  const d = getDb()
  const row = await getAnalysis(id)
  if (!d || !row) return
  const cle = row.brand && row.product ? recipeKey(row.brand, row.product) : row.slug
  if (!ouvrir) {
    await d.update(ficheIndex).set({ actif: false, updatedAt: new Date() }).where(eq(ficheIndex.cle, cle))
  } else {
    const details = row.details as ScoreResult
    const type = TYPE_ADRESSE[typeDeFiche(row.extracted as ExtractedLabel, details)]
    if (!type || row.score === null || MODEL_REVIEWS[cle] || horsListes(details) || !row.brand || !row.product) return
    const [deja] = await d.select({ cle: ficheIndex.cle }).from(ficheIndex).where(eq(ficheIndex.cle, cle)).limit(1)
    if (deja) {
      await d.update(ficheIndex).set({ actif: true, foodAnalysisId: row.id, type, updatedAt: new Date() }).where(eq(ficheIndex.cle, cle))
    } else {
      const base = baseSlug(row.brand, recipeName(row.product), null)
      const [pris] = await d.select({ court: ficheIndex.court }).from(ficheIndex).where(eq(ficheIndex.court, base)).limit(1)
      await d.insert(ficheIndex).values({ foodAnalysisId: row.id, type, cle, court: pris ? `${base.slice(0, 90)}-${row.id.slice(0, 6)}` : base, nom: nomRecette(row.brand, row.product) ?? row.brand })
    }
  }
  revalidatePublic(row.slug, row.brand)
  // L'adresse courte, le plan du site et la page mère changent tout de suite, sans attendre leur prochaine mise à jour.
  const [fiche] = await d.select({ type: ficheIndex.type, court: ficheIndex.court }).from(ficheIndex).where(eq(ficheIndex.cle, cle)).limit(1)
  if (fiche) revalidatePath(ficheIndexeePath(fiche))
  const mere = marquePage(row.brand)
  if (mere) revalidatePath(mere.href)
  revalidatePath('/sitemaps/croquettes.xml')
  revalidatePath('/tableau-de-bord/fiches')
}
