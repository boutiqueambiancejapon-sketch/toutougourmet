'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { dashboardCredentials, isAuthorized } from '@/lib/dashboard/auth'
import { labelFromForm } from '@/lib/scanner/review-form'
import { brandSlug } from '@/lib/scanner/seo'
import { deleteAnalysis, getAnalysis, markReportHandled, updateAnalysis } from '@/lib/server/scanner-review'

// @cdc lot 6 — actions de relecture des fiches. Chaque action vérifie elle-même l'authentification
// HTTP Basic du tableau de bord (le proxy ne suffit pas : une action serveur est un point d'entrée).

async function assertDashboard(): Promise<void> {
  const expected = dashboardCredentials()
  if (!expected || !(await isAuthorized((await headers()).get('authorization'), expected))) throw new Error('Non autorisé')
}

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
  if (!row) redirect('/tableau-de-bord#fiches')
  const intent = String(form.get('intent') ?? 'save')
  const reviewed = intent === 'validate' ? true : intent === 'unpublish' ? false : undefined
  const updated = await updateAnalysis(id, labelFromForm(row.extracted, form), reviewed)
  revalidatePublic(row.slug, row.brand)
  if (updated && updated.brand !== row.brand) revalidatePublic(updated.slug, updated.brand)
  revalidatePath(`/tableau-de-bord/fiches/${id}`)
  if (intent === 'validate') redirect('/tableau-de-bord#fiches')
}

export async function removeFiche(id: string): Promise<void> {
  await assertDashboard()
  const removed = await deleteAnalysis(id)
  if (removed) revalidatePublic(removed.slug, removed.brand)
  redirect('/tableau-de-bord#fiches')
}

export async function handleReport(analysisId: string, reportId: string): Promise<void> {
  await assertDashboard()
  await markReportHandled(reportId, analysisId)
  revalidatePath(`/tableau-de-bord/fiches/${analysisId}`)
}
