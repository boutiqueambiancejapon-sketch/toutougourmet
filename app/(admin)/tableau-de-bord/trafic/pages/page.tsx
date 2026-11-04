import Link from 'next/link'
import { periodQuery } from '@/lib/dashboard/period'
import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { tabHref } from '@/lib/dashboard/tabs'
import { entriesOf, funnelOf, typesOf } from '@/lib/dashboard/traffic'
import { safeRead } from '@/lib/server/dashboard-safe'
import { loadVisitors } from '@/lib/server/dashboard-tabs'
import { getPageCounts, getSessions, pageTitles } from '@/lib/server/dashboard-traffic'
import { ReaderToolsSection } from '@/components/dashboard/AudienceSection'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Panel } from '@/components/dashboard/Panel'
import { TrafficFunnel } from '@/components/dashboard/traffic/TrafficFunnel'
import { TrafficNav } from '@/components/dashboard/traffic/TrafficNav'
import { EntryPages, PageTypes, TopPages } from '@/components/dashboard/traffic/TrafficPageRows'

// @cdc tableau de bord — Trafic, pages et parcours : trois classements au choix, le parcours depuis
// un article, puis les outils et recherches.

export const dynamic = 'force-dynamic'

const LISTS = [
  { key: 'vues', label: 'Les plus vues' },
  { key: 'entrees', label: 'D’entrée' },
  { key: 'types', label: 'Par type' },
] as const

type PagesProps = { searchParams: Promise<{ periode?: string | string[]; liste?: string | string[] }> } & TabPageProps

export default async function TrafficPages(props: PagesProps) {
  const period = await openTab(props)
  const raw = (await props.searchParams).liste
  const list = raw === 'entrees' || raw === 'types' ? raw : 'vues'
  const [sessions, pages, visitors] = await Promise.all([
    safeRead('sessions', [], (pool) => getSessions(pool, period)),
    safeRead('pages', [], (pool) => getPageCounts(pool, period)),
    loadVisitors(period),
  ])
  const titles = pageTitles()
  const base = tabHref('trafic', period.key, '', '/pages')
  const separator = periodQuery(period.key) ? '&' : '?'
  return (
    <DashboardShell period={period.key} current="trafic" sub="/pages" notice={sessions.ok && pages.ok && visitors.ok ? null : READ_FAILED}>
      <TrafficNav period={period.key} current="/pages" />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <section aria-label="Classement des pages" className="rounded-card border border-line bg-paper p-4 md:p-5">
          <nav aria-label="Classement" className="grid grid-cols-3 gap-0.5 rounded-box bg-cream-2 p-0.5 text-sm">
            {LISTS.map((l) => (
              <Link
                key={l.key}
                href={l.key === 'vues' ? base : `${base}${separator}liste=${l.key}`}
                aria-current={l.key === list ? 'true' : undefined}
                className={`inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-box font-semibold no-underline ${l.key === list ? 'bg-paper text-ink' : 'text-ink-2'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4">
            {list === 'vues' ? <TopPages rows={pages.value} titles={titles} /> : null}
            {list === 'entrees' ? <EntryPages rows={entriesOf(sessions.value)} titles={titles} /> : null}
            {list === 'types' ? <PageTypes rows={typesOf(pages.value)} /> : null}
          </div>
        </section>
        <Panel title="Du visiteur au clic" hint="Sessions arrivées par un article, puis ce que ces mêmes sessions ont fait. Chaque étape se compte à part.">
          <TrafficFunnel steps={funnelOf(sessions.value)} />
        </Panel>
      </div>
      <ReaderToolsSection data={visitors.data} />
    </DashboardShell>
  )
}
