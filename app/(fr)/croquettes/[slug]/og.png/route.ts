import { scanOgResponse } from '@/lib/og/scan-image'
import { getDb } from '@/lib/server/drizzle'
import { getBySlug } from '@/lib/server/scanner'

// @cdc lot 6 — image Open Graph de la fiche (1200×630, PNG), même contenu que la story.
export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const row = getDb() ? await getBySlug((await params).slug) : null
  if (!row) return new Response('Fiche introuvable', { status: 404 })
  return scanOgResponse({ brand: row.brand, product: row.product, details: row.details, source: row.source })
}
