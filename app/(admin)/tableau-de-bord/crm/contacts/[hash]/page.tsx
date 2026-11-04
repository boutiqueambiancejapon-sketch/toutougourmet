import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { accountHref } from '@/lib/dashboard/account-status'
import { contactStatus, isUnsubscribed } from '@/lib/dashboard/crm'
import { TRACKING_STATE_LABEL, trackingSource } from '@/lib/dashboard/email-tracking'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { parsePeriod } from '@/lib/dashboard/period'
import { CONTACTS_PATH } from '@/lib/dashboard/subscriber-search'
import { nextForRow, planOptions } from '@/lib/server/dashboard-crm'
import { loadContactRows } from '@/lib/server/dashboard-email-tracking'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card, ListRow, Rows, shortMoment } from '@/components/dashboard/account/parts'
import { NextEmail } from '@/components/dashboard/crm/NextEmail'
import { Badge } from '@/components/dashboard/subscribers/RowParts'

// @cdc tableau de bord — fiche d'un contact. Avec un compte : la fiche complète du compte. Sans
// compte : ce que l'on sait de lui, lu dans Brevo et le journal. L'URL porte l'empreinte seule.

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: { absolute: 'Fiche d’un contact — Tableau de bord' }, robots: { index: false, follow: false, nocache: true } }

export default async function ContactPage({ params }: { params: Promise<{ hash: string }> }) {
  if (!(await dashboardAllowed())) notFound()
  const { hash } = await params
  if (!/^[0-9a-f]{16,128}$/.test(hash)) notFound()
  const res = await loadContactRows()
  const row = res.ok ? res.rows.find((r) => r.hash === hash && r.email) : undefined
  if (!row?.email) notFound()
  if (row.account?.id) redirect(accountHref(row.account.id))
  const status = contactStatus(row)
  return (
    <DashboardShell period={parsePeriod(undefined).key} current="crm" title="Fiche d’un contact" intro="Abonné à la lettre, sans compte sur le site.">
      <p className="m-0 mt-3 text-sm">
        <Link href={CONTACTS_PATH} className="text-ink-2 underline underline-offset-2">Retour aux contacts</Link>
      </p>
      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title={<span className="[overflow-wrap:anywhere]">{row.email}</span>}>
            <p className="m-0"><Badge tone={status.tone}>{status.label}</Badge></p>
            <p className="m-0 text-sm text-ink-2">Venu par : {trackingSource(row)}</p>
            {row.listedAt ? <p className="m-0 text-sm text-ink-2">Inscrit le {shortMoment(row.listedAt)}</p> : null}
          </Card>
          <NextEmail next={nextForRow(row, planOptions())} email={row.email} unsubscribed={isUnsubscribed(row)} />
        </div>
        <Card title="E-mails reçus">
          {row.sends.length === 0 ? <p className="m-0 text-sm text-ink-2">Aucun e-mail individuel enregistré. La lettre mensuelle part en campagne Brevo et n’apparaît pas ici.</p> : (
            <Rows>
              {row.sends.map((s, i) => (
                <ListRow key={`${s.label}-${i}`} main={s.label} detail={s.at ? shortMoment(s.at) : 'Date non enregistrée'} aside={s.state === 'sent' ? undefined : TRACKING_STATE_LABEL[s.state]} />
              ))}
            </Rows>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}
