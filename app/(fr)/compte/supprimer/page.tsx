import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AccountCard, AccountPage } from '@/components/compte/AccountPage'
import { DeleteAccountForm } from '@/components/compte/DeleteAccountForm'
import { getSessionUser } from '@/lib/server/auth'
import { listDogs } from '@/lib/server/dogs'

export const metadata: Metadata = { title: 'Supprimer mon compte' }

export default async function DeleteAccountPage() {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion?retour=/compte/supprimer')
  const dogs = await listDogs(user.id)
  const names = dogs.map((d) => d.name).join(', ')
  const dogsPart = dogs.length === 0 ? '' : dogs.length === 1 ? `, le profil de ${names} et ses pesées` : `, les profils de ${names} et leurs pesées`
  return (
    <AccountPage title="Supprimer mon compte" back={{ href: '/compte', label: 'Mon compte' }}>
      <section aria-labelledby="effacement" className="flex flex-col gap-2 text-base leading-relaxed text-ink-2">
        <h2 id="effacement" className="m-0 font-display text-2xl font-black text-ink">
          Ce qui sera effacé
        </h2>
        <p className="m-0">
          Ton adresse e-mail ({user.email}), ton mot de passe, tes sessions
          {dogsPart}. Rien n&apos;est gardé de côté : la
          suppression est immédiate et définitive.
        </p>
        <p className="m-0">
          Pour garder une copie, télécharge d&apos;abord tes données depuis{' '}
          <a href="/api/compte/export" download className="font-semibold text-orange-ink underline underline-offset-2">
            ce lien
          </a>
          .
        </p>
        <p className="m-0">Un e-mail te confirmera la suppression.</p>
      </section>
      <AccountCard label="Confirmation">
        <DeleteAccountForm />
      </AccountCard>
    </AccountPage>
  )
}
