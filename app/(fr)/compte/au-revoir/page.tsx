import type { Metadata } from 'next'
import Link from 'next/link'
import { AccountPage } from '@/components/compte/AccountPage'
import { FormNotice } from '@/components/compte/fields'

export const metadata: Metadata = { title: 'Compte supprimé' }

// @cdc lot 4 — page d'arrivée après la suppression du compte (aucune donnée affichée).
export default function AccountDeletedPage() {
  return (
    <AccountPage title="Ton compte est supprimé">
      <FormNotice tone="info">
        Tes données sont effacées de notre base et tu es déconnecté. Un e-mail de confirmation part vers ton adresse.
      </FormNotice>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        Les outils restent ouverts sans compte.{' '}
        <Link href="/outils/ration" className="font-semibold text-orange-ink underline underline-offset-2">
          Calculer une ration
        </Link>{' '}
        ou{' '}
        <Link href="/" className="font-semibold text-orange-ink underline underline-offset-2">
          revenir à l&apos;accueil
        </Link>
        .
      </p>
    </AccountPage>
  )
}
