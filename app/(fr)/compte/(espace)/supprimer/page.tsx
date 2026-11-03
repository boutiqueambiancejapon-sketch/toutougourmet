import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { Panel } from '@/components/compte/espace/Panel'
import { linkInline } from '@/components/compte/espace/ui'
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
    <>
      <PageHeading title="Supprimer mon compte" back={{ href: '/compte/reglages', label: 'Réglages' }} />
      <Panel id="effacement" title="Ce qui sera effacé">
        <div className="flex flex-col gap-2 text-base leading-relaxed text-ink-2">
        <p className="m-0">
          Ton adresse e-mail ({user.email}), ton mot de passe, tes sessions
          {dogsPart}, ton historique d&apos;analyses d&apos;étiquettes et tes signalements. Rien n&apos;est gardé de côté : la
          suppression est immédiate et définitive.
        </p>
        <p className="m-0">Les fiches produits nées de tes analyses restent en ligne : elles ne contiennent rien sur toi.</p>
        <p className="m-0">
          Pour garder une copie, télécharge d&apos;abord tes données depuis{' '}
          <a href="/api/compte/export" download className={linkInline}>
            ce lien
          </a>
          .
        </p>
        <p className="m-0">Un e-mail te confirmera la suppression.</p>
        </div>
      </Panel>
      <Panel id="confirmation" title="Confirmer avec ton mot de passe" tone="danger">
        <DeleteAccountForm />
      </Panel>
    </>
  )
}
