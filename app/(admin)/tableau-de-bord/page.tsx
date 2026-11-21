import { lastLabel, prevPeriodLabel } from '@/lib/seo-dash/filters'
import { dayLabel, todayLong } from '@/lib/seo-dash/format'
import { hrefOf, pageHref, queryHref } from '@/lib/seo-dash/nav'
import { anomalies, type Anomaly } from '@/lib/seo-dash/server/anomalies'
import { googleCore } from '@/lib/seo-dash/server/google'
import { chartNotes } from '@/lib/seo-dash/server/notes'
import { openSeoPage, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { logRanges } from '@/lib/seo-dash/server/range'
import { siteKpis } from '@/lib/seo-dash/server/site'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { todayActions } from '@/lib/seo-dash/server/today'
import { getStatusLines, getTodoCounts } from '@/lib/server/dashboard-home'
import { GoogleDelay } from '@/components/seo-dash/ui/GoogleDelay'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { TodayTiles } from '@/components/seo-dash/blocks/TodayTiles'
import { TodayActions } from '@/components/seo-dash/blocks/TodayActions'
import { AnomalyList } from '@/components/seo-dash/blocks/AnomalyList'
import { ClicksCard } from '@/components/seo-dash/blocks/GoogleCharts'

// @cdc tableau de bord SEO — Aujourd'hui : tout ce qui demande une décision, rien d'autre. Page privée (proxy.ts +
// revérification), jamais en cache ni indexée.

export const dynamic = 'force-dynamic'

export default async function TodayPage(props: SeoPageProps) {
  const { filters: f, query } = await openSeoPage(props)
  const links = { page: (p: string) => pageHref(p, query), query: (q: string) => queryHref(q, query), google: hrefOf('google', query), exploration: hrefOf('exploration', query), technique: hrefOf('technique', query) }
  const [gsc, site, actions, anoms, status, todo] = await Promise.all([
    readBlock('aujourdhui google', null, (pool) => googleCore(pool, f)),
    readBlock('aujourdhui site', null, (pool) => siteKpis(pool, f, logRanges(f))),
    readBlock('actions', [], (pool) => todayActions(pool, f, links)),
    readBlock('anomalies', [] as Anomaly[], (pool) => anomalies(pool, f, links)),
    getStatusLines().catch(() => []),
    readBlock('à faire', { messages: null, toReview: null, reports: null }, (pool) => getTodoCounts(pool)),
  ])
  const notes = gsc.value ? (await readBlock('notes', [], (pool) => chartNotes(pool, gsc.value!.ranges.cur))).value : []
  const items: Anomaly[] = [
    ...status.map((s): Anomaly => ({ status: 'crit', text: s.text, meta: 'en cours', href: hrefOf(s.tab), hrefLabel: s.tab === 'serveur' ? 'Serveur' : 'Relecture' })),
    ...(todo.value.messages ? [{ status: 'info' as const, text: `${todo.value.messages} message${todo.value.messages > 1 ? 's' : ''} du formulaire de contact à traiter.`, meta: 'contact', href: `${hrefOf('relecture')}#messages`, hrefLabel: 'Messages' }] : []),
    ...anoms.value,
  ]
  const g = gsc.value
  return (
    <SeoShell current="" title="Aujourd’hui" sub={`${todayLong()} · tout ce qui demande une décision, rien d’autre`} filters={f} path={hrefOf('')} fresh={g ? `Google : données jusqu’au ${dayLabel(g.ranges.last)}` : undefined}>
      <GoogleDelay filters={f} last={g?.ranges.last} />
      {g && site.value ? <TodayTiles gsc={{ ...g, prev: g.ranges.partial ? null : g.prev }} site={site.value} /> : <p className="sd-note warn">Lecture des chiffres impossible pour l’instant.</p>}
      <div className="sd-grid sd-g3 sd-gap">
        <div className="sd-span2">
          <TodayActions actions={actions.value} />
        </div>
        <AnomalyList items={items} />
      </div>
      {g ? (
        <div className="sd-gap">
          <ClicksCard daily={g.daily} prevDaily={g.prevDaily} notes={notes} curLabel={lastLabel(f.period)} prevLabel={f.compare === 'annee' ? 'l’an dernier' : prevPeriodLabel(f.period)} week={false} dayHref={hrefOf('google', query)} weekHref={hrefOf('google', query)} detailHref={hrefOf('google', query)} />
        </div>
      ) : null}
    </SeoShell>
  )
}
