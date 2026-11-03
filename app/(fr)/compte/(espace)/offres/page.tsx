import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AccountOffers } from '@/components/compte/AccountOffers'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { btnPrimary } from '@/components/compte/espace/ui'
import { getSessionUser } from '@/lib/server/auth'
import { listDogs } from '@/lib/server/dogs'

export const metadata: Metadata = { title: 'Offres partenaires' }

export default async function OffersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion?retour=/compte/offres')
  const [dogs, params] = await Promise.all([listDogs(user.id), searchParams])
  const selected = typeof params.offres === 'string' ? params.offres : undefined
  return (
    <>
      <PageHeading title="Offres partenaires" lead={<p>Des remises chez les marques de notre sélection, triées selon le profil de ton chien.</p>} />
      {dogs.length > 0 ? (
        <AccountOffers dogs={dogs} selectedId={selected} />
      ) : (
        <section aria-labelledby="sans-chien" className="flex flex-col items-start gap-3 rounded-card border border-line bg-paper p-4 md:p-6">
          <h2 id="sans-chien" className="m-0 font-display text-xl font-black text-ink">
            Ajoute ton chien pour voir ses offres
          </h2>
          <p className="m-0 text-base leading-relaxed text-ink-2">Les offres partent de son âge, de son poids, de son activité et de la stérilisation.</p>
          <Link href="/compte/chien/nouveau" className={btnPrimary}>
            Ajouter mon chien
          </Link>
        </section>
      )}
    </>
  )
}
