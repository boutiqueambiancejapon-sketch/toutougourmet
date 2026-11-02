import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AccountCard, AccountPage } from '@/components/compte/AccountPage'
import { dogFacts } from '@/components/compte/DogCard'
import { FormNotice } from '@/components/compte/fields'
import { WeightAlert, WeightAlertTeaser } from '@/components/compte/WeightAlert'
import { WeightChart } from '@/components/compte/WeightChart'
import { WeightForm } from '@/components/compte/WeightForm'
import { WeightList } from '@/components/compte/WeightList'
import { rationHref } from '@/components/outils/ration-params'
import { getBreedBySlug } from '@/data/breeds'
import { ageGroupOf } from '@/lib/dog-profile'
import { planOf } from '@/lib/server/membership'
import { weightTrend } from '@/lib/weight-trend'
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
  const [weights, query, plan] = await Promise.all([listWeights(dog.id), searchParams, planOf(user.id)])
  // listWeights : plus récente en premier ; la courbe et l'alerte lisent dans l'ordre des dates.
  const points = [...weights].reverse().map((w) => ({ date: w.date, weightKg: w.weightKg }))
  const trend = plan === 'premium' ? weightTrend(points) : null
  const breed = dog.breedSlug ? getBreedBySlug(dog.breedSlug) : undefined
  const ideal = breed?.weightKg[0] && breed.weightKg[1]
    ? { min: breed.weightKg[0], max: breed.weightKg[1], label: `Poids adulte de la race : ${breed.weightKg[0]} à ${breed.weightKg[1]} kg` }
    : undefined
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
      {trend ? <WeightAlert dog={dog} trend={trend} /> : null}
      <AccountCard label="Courbe de poids">
        <h2 className="m-0 font-display text-2xl font-black text-ink">Sa courbe de poids</h2>
        {points.length > 0 ? (
          <WeightChart name={dog.name} points={points} ideal={ideal} />
        ) : (
          <p className="m-0 text-base text-ink-2">La courbe apparaît dès la première pesée.</p>
        )}
        {plan === 'premium' ? null : <WeightAlertTeaser />}
      </AccountCard>
      <AccountCard label="Pesées">
        <h2 className="m-0 font-display text-2xl font-black text-ink">Ses pesées</h2>
        <WeightForm action={addWeightAction.bind(null, dog.id)} today={todayIso()} />
        <WeightList entries={weights} />
      </AccountCard>
    </AccountPage>
  )
}
