import { contactsOf, periodStart, summarize } from '@/lib/dashboard/crm'
import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { getReturnedCount } from '@/lib/server/dashboard-crm'
import { loadContactRows } from '@/lib/server/dashboard-email-tracking'
import { safeRead } from '@/lib/server/dashboard-safe'
import { BarList } from '@/components/dashboard/BarList'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Panel } from '@/components/dashboard/Panel'
import { CrmNav } from '@/components/dashboard/crm/CrmNav'

// @cdc tableau de bord — CRM, où en sont-ils : du premier e-mail au retour sur le site, ce qui mérite un coup d'œil, l'origine des contacts.

export const dynamic = 'force-dynamic'

const nf = new Intl.NumberFormat('fr-FR')

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-box border border-line bg-paper px-3 py-2.5">
      <dt className="text-sm leading-snug text-ink-2">{label}</dt>
      <dd className="m-0 font-display text-3xl font-black leading-tight tabular-nums text-ink">{value}</dd>
    </div>
  )
}

export default async function CrmTab(props: TabPageProps) {
  const period = await openTab(props)
  const [res, returned] = await Promise.all([loadContactRows(), safeRead('comptes revenus', 0, getReturnedCount)])
  const rows = res.ok ? contactsOf(res.rows) : []
  const data = summarize(rows, returned.value, periodStart(period.key))
  const notice = !res.ok || !returned.ok ? READ_FAILED : res.notices.includes('list-incomplete') ? 'La liste Brevo ou les comptes ne sont pas lisibles en entier pour le moment : les chiffres peuvent être incomplets.' : null
  return (
    <DashboardShell period={period.key} current="crm" notice={notice}>
      <CrmNav period={period.key} current="" />
      <dl className="m-0 mt-4 grid grid-cols-2 gap-2.5">
        <Tile value={nf.format(data.total)} label="Contacts" />
        <Tile value={`+${nf.format(data.added)}`} label={`Sur ${period.long}`} />
      </dl>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Panel title="Du contact au compte actif" hint="« Revenu » ne concerne que les comptes : un abonné sans compte n’est pas reconnu sur le site." wide>
          <BarList rows={data.funnel} empty="Aucun contact pour le moment." />
        </Panel>
        <Panel title="À regarder">
          <ul className="m-0 flex list-none flex-col divide-y divide-line p-0 text-sm">
            {data.watch.map((w) => (
              <li key={w.label} className="flex justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0 text-ink">{w.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">{nf.format(w.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="D’où viennent les contacts">
          <BarList rows={data.sources.slice(0, 10)} total={data.total} empty="Aucun contact pour le moment." />
        </Panel>
      </div>
    </DashboardShell>
  )
}
