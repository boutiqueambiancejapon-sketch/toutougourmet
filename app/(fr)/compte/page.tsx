import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AccountPage } from '@/components/compte/AccountPage'
import { AccountOffers } from '@/components/compte/AccountOffers'
import { DogCard } from '@/components/compte/DogCard'
import { PremiumBadge, PremiumPanel } from '@/components/compte/PremiumPanel'
import { TrackOnce } from '@/components/compte/TrackOnce'
import { ScanHistoryList } from '@/components/compte/ScanHistoryList'
import { FormNotice } from '@/components/compte/fields'
import { SignOutButton } from '@/components/compte/SignOutButton'
import { getSessionUser } from '@/lib/server/auth'
import { listDogs } from '@/lib/server/dogs'
import { getMembership, premiumMissing } from '@/lib/server/membership'
import { listUserScans, usedThisMonth } from '@/lib/server/scanner'
import { monthlyScanLimit } from '@/lib/scanner/config'

// Historique des scans : 20 dernières analyses en gratuit, historique complet avec Premium.
const FREE_HISTORY = 20
const PREMIUM_HISTORY = 1000

export const metadata: Metadata = { title: 'Mon compte' }

export default async function AccountHomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const user = await getSessionUser()
  if (!user) {
    // Lien de confirmation périmé : Better Auth renvoie ici avec ?error=…
    redirect(params.error ? `/compte/connexion?error=${encodeURIComponent(String(params.error).toUpperCase())}` : '/compte/connexion')
  }
  const [dogs, membership, missing, used] = await Promise.all([listDogs(user.id), getMembership(user.id), premiumMissing(user.id), usedThisMonth(user.id)])
  const premium = membership?.plan === 'premium'
  const scans = await listUserScans(user.id, premium ? PREMIUM_HISTORY : FREE_HISTORY)
  const offresFor = typeof params.offres === 'string' ? params.offres : undefined
  return (
    <AccountPage
      title={`Bonjour ${user.name}`}
      lead={
        <p className="flex flex-wrap items-center gap-2">
          {user.email}
          {premium ? <PremiumBadge /> : null}
        </p>
      }
    >
      {params.bienvenue ? <FormNotice tone="info">Adresse confirmée, ton compte est ouvert. Ajoute ton chien pour commencer.</FormNotice> : null}
      {params.premium === 'active' && premium ? (
        <>
          <FormNotice tone="info">{`Premium est activé : ${monthlyScanLimit('premium')} analyses par photo par mois, alertes de poids et historique complet des scans.`}</FormNotice>
          <TrackOnce event="Premium Activated" props={{ source: 'launch-free' }} />
        </>
      ) : null}
      <section aria-labelledby="mes-chiens" className="flex flex-col gap-3">
        <h2 id="mes-chiens" className="m-0 font-display text-2xl font-black text-ink">
          {dogs.length > 1 ? 'Mes chiens' : 'Mon chien'}
        </h2>
        {dogs.length > 0 ? (
          <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
            {dogs.map((d) => (
              <DogCard key={d.id} dog={d} />
            ))}
          </ul>
        ) : (
          <p className="m-0 text-base leading-relaxed text-ink-2">
            Pas encore de chien enregistré. Son profil sert à pré-remplir le calcul de ration et à suivre son poids.
          </p>
        )}
        <Link
          href="/compte/chien/nouveau"
          className="inline-flex min-h-12 items-center justify-center self-start rounded-control bg-orange px-5 text-[15px] font-semibold text-ink no-underline"
        >
          {dogs.length > 0 ? 'Ajouter un autre chien' : 'Ajouter mon chien'}
        </Link>
      </section>
      <PremiumPanel premium={premium} activatedAt={membership?.activatedAt ?? null} missing={missing} />
      <AccountOffers dogs={dogs} selectedId={offresFor} />
      <section aria-labelledby="outils" className="flex flex-col gap-2">
        <h2 id="outils" className="m-0 font-display text-2xl font-black text-ink">
          Ses outils
        </h2>
        <p className="m-0 text-base leading-relaxed text-ink-2">
          Le{' '}
          <Link href="/outils/ration" className="font-semibold text-orange-ink underline underline-offset-2">
            calcul de ration
          </Link>
          , le{' '}
          <Link href="/outils/poids" className="font-semibold text-orange-ink underline underline-offset-2">
            contrôle du poids
          </Link>
          , l&apos;
          <Link href="/outils/age" className="font-semibold text-orange-ink underline underline-offset-2">
            âge en années humaines
          </Link>{' '}
          et le{' '}
          <Link href="/outils/budget" className="font-semibold text-orange-ink underline underline-offset-2">
            budget mensuel
          </Link>{' '}
          reprennent le profil de {dogs[0]?.name ?? 'ton chien'}.
        </p>
      </section>
      <ScanHistoryList scans={scans} used={used} limit={monthlyScanLimit(premium ? 'premium' : 'free')} premium={premium} />
      <section aria-labelledby="mes-donnees" className="flex flex-col gap-2">
        <h2 id="mes-donnees" className="m-0 font-display text-2xl font-black text-ink">
          Mes données
        </h2>
        <p className="m-0 text-base leading-relaxed text-ink-2">
          Récupère tout ce que ton compte contient dans un fichier JSON : profil, chiens, pesées et analyses d&apos;étiquettes.
        </p>
        <a
          href="/api/compte/export"
          download
          className="inline-flex min-h-12 items-center justify-center self-start rounded-control border-2 border-ink px-5 text-[15px] font-semibold text-ink no-underline"
        >
          Télécharger mes données
        </a>
        <Link href="/compte/supprimer" className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold text-orange-ink underline underline-offset-2">
          Supprimer mon compte
        </Link>
      </section>
      <div className="border-t border-line pt-4">
        <SignOutButton />
      </div>
    </AccountPage>
  )
}
