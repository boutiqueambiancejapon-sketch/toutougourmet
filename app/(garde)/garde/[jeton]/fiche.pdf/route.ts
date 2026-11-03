import { sitterPdfResponse } from '@/lib/og/garde-pdf'
import { sitterView } from '@/lib/garde/view'
import { sheetByToken } from '@/lib/server/sitter-sheets'

// @cdc fiche de garde — la fiche du gardien en PDF d'une page A4 (404 si expirée ou supprimée).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ jeton: string }> }): Promise<Response> {
  const sheet = await sheetByToken((await params).jeton)
  if (!sheet) return new Response('Fiche introuvable', { status: 404, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } })
  return sitterPdfResponse(sitterView(sheet.data))
}
