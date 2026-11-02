import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AccountCard, AccountPage } from '@/components/compte/AccountPage'
import { dogFacts } from '@/components/compte/DogCard'
import { FormNotice } from '@/components/compte/fields'
import { WeightForm } from '@/components/compte/WeightForm'
import { WeightList } from '@/components/compte/WeightList'
import { rationHref } from '@/components/outils/ration-params'
import { ageGroupOf } from '@/lib/dog-profile'
import { getSessionUser } from '@/lib/server/auth'
import { todayIso } from '@/lib/server/dog-form'
import { getDog, listWeights } from '@/lib/server/dogs'
import { addWeightAction } from '../../actions'

export const metadata: Metadata = { title: 'Profil du chien' }

export default async function DogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/compte/connexion?retour=/compte/chien/${encodeURIComponent(id)}`)
  const dog = await getDog(user.id, id)
  if (!dog) notFound()
  const [weights, query] = await Promise.all([listWeights(dog.id), searchParams])
  const ration = dog.weightKg
    ? rationHref({ weightKg: dog.weightKg, ageGroup: ageGroupOf(dog.birthDate) ?? 'adulte', activityLevel: dog.activity, sterilized: dog.sterilized, food: 'croquettes' })
    : null

  return (
    <AccountPage title={dog.name} back={{ href: '/compte', label: 'Mon compte' }} lead={<p>{dogFacts(dog).join(' · ')}</p>}>
      <div className="flex flex-wrap gap-3">
        <Link href={`/compte/chien/${dog.id}/modifier`} className="inline-flex min-h-11 items-center rounded-control border border-line bg-paper px-4 text-[15px] font-semibold text-ink no-underline">
          Modifier le profil
        </Link>
        {ration ? (
          <Link href={ration} className="inline-flex min-h-11 items-center rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline">
            Calculer sa ration
          </Link>
        ) : null}
      </div>
      {query.pesee ? <FormNotice tone="info">Pesée enregistrée.</FormNotice> : null}
      <AccountCard label="Pesées">
        <h2 className="m-0 font-display text-2xl font-black text-ink">Ses pesées</h2>
        <WeightForm action={addWeightAction.bind(null, dog.id)} today={todayIso()} />
        <WeightList entries={weights} />
      </AccountCard>
    </AccountPage>
  )
}
