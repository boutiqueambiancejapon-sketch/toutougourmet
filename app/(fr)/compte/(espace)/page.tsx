import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { OfferTeaser } from '@/components/compte/AccountOffers'
import { AddDogCard, DogSummaryCard } from '@/components/compte/espace/DogSummaryCard'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { Panel } from '@/components/compte/espace/Panel'
import { StatTiles } from '@/components/compte/espace/StatTiles'
import { ToolLinks } from '@/components/compte/espace/ToolLinks'
import { btnOutline, linkAction } from '@/components/compte/espace/ui'
import { FormNotice } from '@/components/compte/fields'
import { PremiumPanel } from '@/components/compte/PremiumPanel'
import { ScanRows } from '@/components/compte/ScanHistoryList'
import { TrackOnce } from '@/components/compte/TrackOnce'
import { getSessionUser } from '@/lib/server/auth'
import { latestWeights, listDogs } from '@/lib/server/dogs'
import { getFoodLinks } from '@/lib/server/food-suggest'
import { getMembership, premiumMissing } from '@/lib/server/membership'
import { listFavoris } from '@/lib/server/favoris'
import { listUserScans, usedThisMonth } from '@/lib/server/scanner'
import { monthlyScanLimit } from '@/lib/scanner/config'

export const metadata: Metadata = { title: 'Mon compte' }

export default async function AccountHomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const user = await getSessionUser()
  if (!user) {
    // Lien de confirmation périmé : Better Auth renvoie ici avec ?error=…
    redirect(params.error ? `/compte/connexion?error=${encodeURIComponent(String(params.error).toUpperCase())}` : '/compte/connexion')
  }
  const [dogs, membership, missing, used, scans, favoris] = await Promise.all([
    listDogs(user.id),
    getMembership(user.id),
    premiumMissing(user.id),
    usedThisMonth(user.id),
    listUserScans(user.id, 3),
    listFavoris(user.id, 10),
  ])
  const premium = membership?.plan === 'premium'
  const [latest, foodLinks] = await Promise.all([latestWeights(dogs.map((d) => d.id)), getFoodLinks(dogs.map((d) => d.foodSlug))])
  const lastWeigh = [...latest.values()].sort((a, b) => b.date.localeCompare(a.date))[0]
  const lastDog = lastWeigh ? dogs.find((d) => d.id === lastWeigh.dogId) : undefined
  return (
    <>
      <PageHeading title="Vue d'ensemble" />
      {params.bienvenue ? <FormNotice tone="info">Adresse confirmée, ton compte est ouvert. Ajoute ton chien pour commencer.</FormNotice> : null}
      {params.premium === 'active' && premium ? (
        <>
          <FormNotice tone="info">{`Premium est activé : ${monthlyScanLimit('premium')} analyses par photo par mois, alertes de poids et historique complet des scans.`}</FormNotice>
          <TrackOnce event="Premium Activated" props={{ source: 'launch-free' }} />
        </>
      ) : null}
      <StatTiles
        used={used}
        limit={monthlyScanLimit(premium ? 'premium' : 'free')}
        dogs={dogs.length}
        lastWeigh={lastWeigh && lastDog ? { dogName: lastDog.name, date: lastWeigh.date, weightKg: lastWeigh.weightKg } : null}
      />
      {premium ? null : <PremiumPanel premium={false} activatedAt={null} missing={missing} />}
      <Panel id="mes-chiens" title={dogs.length > 1 ? 'Mes chiens' : 'Mon chien'}>
        {dogs.length === 0 ? (
          <p className="m-0 text-base leading-relaxed text-ink-2">Son profil pré-remplit le calcul de ration et garde la courbe de ses pesées.</p>
        ) : null}
        <ul role="list" className="m-0 grid list-none grid-cols-1 gap-3 p-0 lg:grid-cols-2">
          {dogs.map((d) => (
            <li key={d.id} className="m-0">
              <DogSummaryCard dog={d} last={latest.get(d.id)} foodLink={d.foodSlug ? foodLinks.get(d.foodSlug) : null} />
            </li>
          ))}
          <li className="m-0">
            <AddDogCard first={dogs.length === 0} />
          </li>
        </ul>
      </Panel>
      <Panel id="mes-aliments" title="Mes aliments">
        {favoris.length > 0 ? (
          <ScanRows scans={favoris.map((f) => ({ ...f, at: null }))} />
        ) : (
          <p className="m-0 text-base leading-relaxed text-ink-2">Garde ici les croquettes, pâtées et friandises de ton chien : touche « Ajouter à mes aliments » sur une fiche ou après un scan.</p>
        )}
      </Panel>
      <Panel
        id="derniers-scans"
        title="Derniers scans"
        action={
          scans.length > 0 ? (
            <Link href="/compte/scans" className={linkAction}>
              Tout l&apos;historique
            </Link>
          ) : null
        }
      >
        {scans.length > 0 ? (
          <ScanRows scans={scans} />
        ) : (
          <p className="m-0 text-base leading-relaxed text-ink-2">Pas encore d&apos;analyse. Scanne le code-barres ou l&apos;étiquette de ses croquettes pour obtenir leur note.</p>
        )}
        <Link href="/scanner" className={`${btnOutline} self-start`}>
          Scanner un sac
        </Link>
      </Panel>
      {dogs[0] ? <OfferTeaser dog={dogs[0]} /> : null}
      <ToolLinks dogName={dogs[0]?.name} />
    </>
  )
}
