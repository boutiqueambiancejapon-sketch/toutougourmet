import { NextResponse } from 'next/server'
import { breedMidWeight } from '@/components/race/breed-size'
import type { AccountProfile } from '@/components/outils/ration-params'
import { getBreedBySlug } from '@/data/breeds'
import { ageGroupOf, ageInMonths } from '@/lib/dog-profile'
import { getSessionUser } from '@/lib/server/auth'
import { listDogs } from '@/lib/server/dogs'

// @cdc premium — profil du premier chien du compte, pour pré-remplir les outils (ration, poids,
// âge, budget) et le calculateur des articles « peut-il manger ». `allergies` : prénom et allergies
// des chiens qui en ont, pour l'alerte du scanner et des fiches /croquettes. Appelé par le navigateur
// seulement si le témoin tg_compte est présent : les pages publiques restent statiques.

export const dynamic = 'force-dynamic'

const headers = { 'Cache-Control': 'private, no-store' }

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ dog: null } satisfies AccountProfile, { status: 401, headers })
  const dogs = await listDogs(user.id)
  const [first] = dogs
  if (!first) return NextResponse.json({ dog: null } satisfies AccountProfile, { headers })
  const allergies = dogs.filter((d) => d.allergies.length > 0).map((d) => ({ name: d.name, allergies: d.allergies }))
  const breed = first.breedSlug ? getBreedBySlug(first.breedSlug) : undefined
  const body: AccountProfile = {
    dog: {
      id: first.id,
      name: first.name,
      prefill: {
        weightKg: first.weightKg ? String(first.weightKg) : undefined,
        ageGroup: ageGroupOf(first.birthDate),
        activityLevel: first.activity,
        sterilized: first.sterilized,
      },
      weightKg: first.weightKg,
      ageMonths: first.birthDate ? ageInMonths(first.birthDate) : null,
      breedMidKg: breed ? breedMidWeight(breed) : null,
      breedName: breed?.name ?? null,
    },
    allergies,
    chiens: dogs.map((d) => ({ id: d.id, name: d.name, age: ageGroupOf(d.birthDate) ?? null, weightKg: d.weightKg, activity: d.activity, sterilized: d.sterilized, allergies: d.allergies })),
  }
  return NextResponse.json(body, { headers })
}
