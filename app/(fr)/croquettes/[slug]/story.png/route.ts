import { scanStoryResponse } from '@/lib/og/scan-image'
import { foodNoun } from '@/lib/scanner/food-noun'
import { getDb } from '@/lib/server/drizzle'
import { getBySlug } from '@/lib/server/scanner'

// @cdc lot 6 — fiche de partage au format story (1080×1920, PNG), générée côté serveur.
export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const row = getDb() ? await getBySlug((await params).slug) : null
  if (!row) return new Response('Fiche introuvable', { status: 404 })
  return scanStoryResponse({ brand: row.brand, product: row.product, details: row.details, source: row.source, noun: foodNoun(row.extracted, row.details) })
}
