import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { channelsOf, countBy, sitesOf } from '@/lib/dashboard/traffic'
import { EMPTY_GEO, getGeo } from '@/lib/server/dashboard-geo'
import { safeRead } from '@/lib/server/dashboard-safe'
import { getSessions } from '@/lib/server/dashboard-traffic'
import { BarList } from '@/components/dashboard/BarList'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { GeoPanels } from '@/components/dashboard/GeoPanels'
import { Panel } from '@/components/dashboard/Panel'
import { ChannelList } from '@/components/dashboard/traffic/ChannelList'
import { TrafficNav } from '@/components/dashboard/traffic/TrafficNav'

// @cdc tableau de bord — Trafic, acquisition : canaux, sites, appareils et pays.

export const dynamic = 'force-dynamic'

const DEVICES: Record<string, string> = { mobile: 'Téléphone', tablet: 'Tablette', desktop: 'Ordinateur' }

export default async function TrafficAcquisition(props: TabPageProps) {
  const period = await openTab(props)
  const [sessions, geo] = await Promise.all([
    safeRead('sessions', [], (pool) => getSessions(pool, period)),
    safeRead('pays', EMPTY_GEO, (pool) => getGeo(pool, period)),
  ])
  const rows = sessions.value
  const total = rows.filter((r) => r.current).length
  return (
    <DashboardShell period={period.key} current="trafic" sub="/acquisition" notice={sessions.ok && geo.ok ? null : READ_FAILED}>
      <TrafficNav period={period.key} current="/acquisition" />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel
          title="Par canal"
          hint="D’où vient la session. « Accès direct » réunit aussi les applications qui masquent leur origine, dont une partie des e-mails."
          wide
        >
          <ChannelList rows={channelsOf(rows)} />
        </Panel>
        <Panel title="Sites qui t’envoient du monde">
          <BarList rows={sitesOf(rows).slice(0, 15)} empty="Aucun site sur la période." />
        </Panel>
        <Panel title="Appareils">
          <BarList rows={countBy(rows, (r) => r.device)} total={total} format={(d) => DEVICES[d] ?? d} empty="Aucune session sur la période." />
        </Panel>
        <GeoPanels data={geo.value} />
      </div>
    </DashboardShell>
  )
}
