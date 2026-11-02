import { scanStoryResponse } from '@/lib/og/scan-image'
import { PREMIUM_LABEL } from '@/lib/scanner/fixtures'
import { scoreLabel } from '@/lib/scanner/score'

// @cdc lot 6 — exemple de fiche de partage sur /scanner, généré au build à partir de l'étiquette
// inventée de lib/scanner/fixtures.ts (marque fictive : aucun produit réel noté sans relecture).
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  return scanStoryResponse({ brand: PREMIUM_LABEL.marque, product: PREMIUM_LABEL.produit, details: scoreLabel(PREMIUM_LABEL), source: 'photo' })
}
