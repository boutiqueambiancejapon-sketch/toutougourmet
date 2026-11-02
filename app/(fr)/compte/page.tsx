import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AccountPage } from '@/components/compte/AccountPage'
import { DogCard } from '@/components/compte/DogCard'
import { FormNotice } from '@/components/compte/fields'
import { SignOutButton } from '@/components/compte/SignOutButton'
import { getSessionUser } from '@/lib/server/auth'
import { listDogs } from '@/lib/server/dogs'

export const metadata: Metadata = { title: 'Mon compte' }

export default async function AccountHomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const user = await getSessionUser()
  if (!user) {
    // Lien de confirmation périmé : Better Auth renvoie ici avec ?error=…
    redirect(params.error ? `/compte/connexion?error=${encodeURIComponent(String(params.error).toUpperCase())}` : '/compte/connexion')
  }
  const dogs = await listDogs(user.id)
  return (
    <AccountPage title={`Bonjour ${user.name}`} lead={<p>{user.email}</p>}>
      {params.bienvenue ? <FormNotice tone="info">Adresse confirmée, ton compte est ouvert. Ajoute ton chien pour commencer.</FormNotice> : null}
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
      <section aria-labelledby="outils" className="flex flex-col gap-2">
        <h2 id="outils" className="m-0 font-display text-2xl font-black text-ink">
          Ses outils
        </h2>
        <p className="m-0 text-base leading-relaxed text-ink-2">
          Le{' '}
          <Link href="/outils/ration" className="font-semibold text-orange-ink underline underline-offset-2">
            calcul de ration
          </Link>{' '}
          reprend le poids, l&apos;âge et l&apos;activité de {dogs[0]?.name ?? 'ton chien'}.
        </p>
      </section>
      <div className="border-t border-line pt-4">
        <SignOutButton />
      </div>
    </AccountPage>
  )
}
