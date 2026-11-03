import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { emailVerified, getPremiumState } from '@/lib/server/membership'

// @cdc premium — état Premium du compte connecté, pour la page statique /premium (bouton « Gérer
// mon abonnement » pour un abonné, formulaire de paiement sinon). Appelé par le navigateur
// seulement si le témoin tg_compte est présent. Aucun identifiant Stripe renvoyé.

export const dynamic = 'force-dynamic'

export interface PremiumStatus {
  signedIn: boolean
  active: boolean
  subscriber: boolean
  verified: boolean
}

const headers = { 'Cache-Control': 'private, no-store' }

export async function GET(): Promise<NextResponse<PremiumStatus>> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ signedIn: false, active: false, subscriber: false, verified: false }, { status: 401, headers })
  const [state, verified] = await Promise.all([getPremiumState(user.id), emailVerified(user.id)])
  const subscriber = state.active && state.membership?.source === 'stripe'
  return NextResponse.json({ signedIn: true, active: state.active, subscriber, verified }, { headers })
}
