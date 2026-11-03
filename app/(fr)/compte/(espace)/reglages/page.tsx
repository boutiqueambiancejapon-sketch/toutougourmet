import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { Panel } from '@/components/compte/espace/Panel'
import { PasswordLinkButton } from '@/components/compte/espace/PasswordLinkButton'
import { btnDanger, btnOutline, linkInline } from '@/components/compte/espace/ui'
import { PremiumPanel } from '@/components/compte/PremiumPanel'
import { PaymentNotice } from '@/components/compte/premium/PaymentNotice'
import { SignOutButton } from '@/components/compte/SignOutButton'
import { IconDownload, IconTrash } from '@/components/icons'
import { getSessionUser } from '@/lib/server/auth'
import { getPremiumState, premiumMissing, premiumMode } from '@/lib/server/membership'

export const metadata: Metadata = { title: 'Réglages du compte' }

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ paiement?: string | string[] }> }) {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion?retour=/compte/reglages')
  const [premiumState, missing, { paiement }] = await Promise.all([getPremiumState(user.id), premiumMissing(user.id), searchParams])
  return (
    <>
      <PageHeading title="Réglages" />
      <Panel id="profil" title="Profil">
        <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col rounded-box bg-cream-2 p-3">
            <dt className="text-sm font-semibold text-ink-2">Prénom</dt>
            <dd className="m-0 truncate text-base font-semibold text-ink">{user.name}</dd>
          </div>
          <div className="flex min-w-0 flex-col rounded-box bg-cream-2 p-3">
            <dt className="text-sm font-semibold text-ink-2">Adresse e-mail</dt>
            <dd className="m-0 truncate text-base font-semibold text-ink">{user.email}</dd>
          </div>
        </dl>
        <p className="m-0 text-sm leading-relaxed text-ink-2">
          Pour corriger ton prénom ou ton adresse, écris-nous depuis le{' '}
          <Link href="/contact" className={linkInline}>
            formulaire de contact
          </Link>
          .
        </p>
      </Panel>
      <Panel id="mot-de-passe" title="Mot de passe">
        <p className="m-0 text-base leading-relaxed text-ink-2">On t&apos;envoie un lien pour choisir un nouveau mot de passe.</p>
        <PasswordLinkButton email={user.email} />
      </Panel>
      <PaymentNotice code={Array.isArray(paiement) ? paiement[0] : paiement} />
      <PremiumPanel state={premiumState} mode={premiumMode()} missing={missing} />
      <Panel id="mes-donnees" title="Mes données">
        <p className="m-0 text-base leading-relaxed text-ink-2">
          Un fichier JSON avec tout ce que contient ton compte : profil, chiens, pesées et analyses d&apos;étiquettes.
        </p>
        <a href="/api/compte/export" download className={`${btnOutline} self-start`}>
          <IconDownload className="size-5" />
          Télécharger
          <span className="sr-only"> mes données</span>
        </a>
      </Panel>
      <Panel id="session" title="Session">
        <SignOutButton />
      </Panel>
      <Panel id="zone-sensible" title="Supprimer le compte" tone="danger">
        <p className="m-0 text-base leading-relaxed text-ink-2">
          Tout part tout de suite et pour de bon : chiens, pesées, analyses, formule Premium. Un abonnement en cours est résilié, sans autre prélèvement. Le mot de passe est demandé à l&apos;étape suivante.
        </p>
        <Link href="/compte/supprimer" className={`${btnDanger} self-start`}>
          <IconTrash className="size-5" />
          Supprimer
          <span className="sr-only"> mon compte</span>
        </Link>
      </Panel>
    </>
  )
}
