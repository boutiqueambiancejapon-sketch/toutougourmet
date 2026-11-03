import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AddDogCard, DogSummaryCard } from '@/components/compte/espace/DogSummaryCard'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { btnPrimary } from '@/components/compte/espace/ui'
import { IconPlus } from '@/components/icons'
import { getSessionUser } from '@/lib/server/auth'
import { latestWeights, listDogs } from '@/lib/server/dogs'

export const metadata: Metadata = { title: 'Mes chiens' }

export default async function DogsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion?retour=/compte/chiens')
  const dogs = await listDogs(user.id)
  const latest = await latestWeights(dogs.map((d) => d.id))
  return (
    <>
      <PageHeading
        title="Mes chiens"
        lead={<p>Chaque fiche garde sa courbe de poids et ses pesées. Sa ration se recalcule à chaque nouvelle pesée.</p>}
        action={
          dogs.length > 0 ? (
            <Link href="/compte/chien/nouveau" className={btnPrimary}>
              <IconPlus className="size-5" />
              Ajouter un chien
            </Link>
          ) : null
        }
      />
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-3 p-0 lg:grid-cols-2">
        {dogs.map((d) => (
          <li key={d.id} className="m-0">
            <DogSummaryCard dog={d} last={latest.get(d.id)} heading="h2" />
          </li>
        ))}
        {dogs.length === 0 ? (
          <li className="m-0">
            <AddDogCard first />
          </li>
        ) : null}
      </ul>
    </>
  )
}
