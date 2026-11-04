import { parseRobotFilter } from '@/lib/dashboard/robots'
import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { EMPTY_ROBOTS, getRobots } from '@/lib/server/dashboard-robots'
import { safeRead } from '@/lib/server/dashboard-safe'
import { loadRobots } from '@/lib/server/dashboard-tabs'
import { pageTitles } from '@/lib/server/dashboard-traffic'
import { AiSection } from '@/components/dashboard/AiSection'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

// @cdc tableau de bord — onglet Robots IA : couverture, filtres par robot et par type de visite,
// graphiques, pages lues, visiteurs envoyés par une IA, vraies erreurs et articles jamais lus.

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ periode?: string | string[]; robot?: string | string[]; visite?: string | string[] }> } & TabPageProps

export default async function RobotsTab(props: Props) {
  const period = await openTab(props)
  const sp = await props.searchParams
  const filter = parseRobotFilter(sp.robot, sp.visite)
  const [{ data, ok }, robots] = await Promise.all([loadRobots(period), safeRead('robots', EMPTY_ROBOTS, (pool) => getRobots(pool, period, filter))])
  const titles = pageTitles()
  const articles = [...titles.entries()].map(([path, title]) => ({ path, title }))
  return (
    <DashboardShell period={period.key} current="robots" notice={ok && robots.ok ? null : READ_FAILED}>
      <AiSection data={robots.value} ai={data.ai} period={period} filter={filter} articles={articles} titles={titles} />
    </DashboardShell>
  )
}
