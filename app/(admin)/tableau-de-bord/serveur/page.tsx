import { openTab, type TabPageProps } from '@/lib/dashboard/tab-page'
import { getServerHealth } from '@/lib/server/dashboard-health'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ServerSection } from '@/components/dashboard/ServerSection'

// @cdc tableau de bord — onglet Serveur : alertes, processeur, mémoire, disque, tâches planifiées
// et sauvegarde de la base. Lu à l'ouverture, sans sondage.

export const dynamic = 'force-dynamic'

export default async function ServerTab(props: TabPageProps) {
  const period = await openTab(props)
  const health = await getServerHealth()
  return (
    <DashboardShell period={period.key} current="serveur" noPeriod>
      <ServerSection health={health} />
    </DashboardShell>
  )
}
