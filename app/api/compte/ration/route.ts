import { NextResponse } from 'next/server'
import type { AccountRationPrefill, RationPrefill } from '@/components/outils/ration-params'
import { ageGroupOf } from '@/lib/dog-profile'
import { getSessionUser } from '@/lib/server/auth'
import { listDogs } from '@/lib/server/dogs'

// @cdc lot 4 — pré-remplissage de /outils/ration avec le premier chien du compte connecté.
// Appelé par le navigateur seulement quand le témoin de session est présent (lib/account-hint).

export const dynamic = 'force-dynamic'

const headers = { 'Cache-Control': 'private, no-store' }

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ dog: null }, { status: 401, headers })
  const [first] = await listDogs(user.id)
  if (!first) return NextResponse.json({ dog: null } satisfies AccountRationPrefill, { headers })
  const prefill: RationPrefill = {
    weightKg: first.weightKg ? String(first.weightKg) : undefined,
    ageGroup: ageGroupOf(first.birthDate),
    activityLevel: first.activity,
    sterilized: first.sterilized,
  }
  return NextResponse.json({ dog: { id: first.id, name: first.name, prefill } } satisfies AccountRationPrefill, { headers })
}
