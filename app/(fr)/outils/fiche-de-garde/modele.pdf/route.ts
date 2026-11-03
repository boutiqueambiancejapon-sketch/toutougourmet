import { templatePdfResponse } from '@/lib/og/garde-pdf'

// @cdc fiche de garde — modèle vierge à imprimer (A4, une page). Lien donné après l'inscription
// à la lettre (source « fiche-garde-vierge ») ; noindex : le PDF n'a rien à faire dans Google.
export const runtime = 'nodejs'

export async function GET(): Promise<Response> {
  return templatePdfResponse()
}
