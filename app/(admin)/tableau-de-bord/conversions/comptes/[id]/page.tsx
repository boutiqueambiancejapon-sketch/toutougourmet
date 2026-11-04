import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { parsePeriod } from '@/lib/dashboard/period'
import { CONTACTS_PATH } from '@/lib/dashboard/subscriber-search'
import { nextForDetail } from '@/lib/server/dashboard-crm'
import { getAccountDetail } from '@/lib/server/dashboard-account-detail'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Unreadable } from '@/components/dashboard/account/parts'
import { AccountDogs } from '@/components/dashboard/account/AccountDogs'
import { AccountEmails } from '@/components/dashboard/account/AccountEmails'
import { AccountIdentity } from '@/components/dashboard/account/AccountIdentity'
import { AccountScans } from '@/components/dashboard/account/AccountScans'
import { AccountSheets } from '@/components/dashboard/account/AccountSheets'
import { NextEmail } from '@/components/dashboard/crm/NextEmail'

// @cdc tableau de bord — fiche d'un compte, ouverte depuis le CRM, pour le support. Identifiants
// revérifiés ici (guard.ts), jamais indexée, jamais en cache. L'URL porte l'identifiant du compte.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Fiche d’un compte — Tableau de bord' },
  robots: { index: false, follow: false, nocache: true },
}

function Back() {
  return (
    <p className="m-0 mt-3 text-sm">
      <Link href={CONTACTS_PATH} className="text-ink-2 underline underline-offset-2">
        Retour aux contacts
      </Link>
    </p>
  )
}

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await dashboardAllowed())) notFound()
  const { id } = await params
  const result = await getAccountDetail(id)
  if (result === null) notFound()
  const period = parsePeriod(undefined).key
  if (!result.ok) {
    return (
      <DashboardShell period={period} current="crm" title="Fiche d’un compte" intro="Consultation pour le support, en lecture seule.">
        <Back />
        <div className="mt-4">
          <Unreadable>La base des comptes n’a pas pu être lue. Recharge la page dans une minute.</Unreadable>
        </div>
      </DashboardShell>
    )
  }
  const { detail } = result
  return (
    <DashboardShell period={period} current="crm" title={detail.core.name || 'Compte sans prénom'} intro="Consultation pour le support, en lecture seule.">
      <Back />
      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <AccountIdentity detail={detail} />
          <NextEmail next={await nextForDetail(detail)} email={detail.core.email} unsubscribed={detail.letter.state === 'unsubscribed'} />
          <AccountDogs dogs={detail.dogs} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <AccountScans scans={detail.scans} usage={detail.usage} />
          <AccountSheets sheets={detail.sheets} />
          <AccountEmails emails={detail.emails} />
        </div>
      </div>
    </DashboardShell>
  )
}
