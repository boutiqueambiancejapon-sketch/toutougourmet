import { fichePdfResponse } from '@/lib/og/fiche-pdf'
import { getDb } from '@/lib/server/drizzle'
import { getBySlug } from '@/lib/server/scanner'

// @cdc lot 6 — fiche A4 d'un produit scanné en PDF d'une page (bouton « Télécharger le PDF »).
// Mêmes règles de cache que story.png. noindex : un PDF de fiche n'a rien à faire dans Google.
export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const row = getDb() ? await getBySlug((await params).slug) : null
  if (!row) return new Response('Fiche introuvable', { status: 404 })
  return fichePdfResponse(row)
}
