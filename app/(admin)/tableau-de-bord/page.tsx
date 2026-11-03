import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { insightOf } from '@/lib/dashboard/insight'
import { parsePeriod } from '@/lib/dashboard/period'
import { EMPTY_CONVERSIONS, getConversions } from '@/lib/server/dashboard-conversions'
import { EMPTY_KPIS, getClickBuckets, getHomeKpis, getStatusLines, getTodoCounts, type TodoCounts } from '@/lib/server/dashboard-home'
import { safeRead } from '@/lib/server/dashboard-safe'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { StatusLines } from '@/components/dashboard/home/StatusLines'
import { HomeKpis } from '@/components/dashboard/home/HomeKpis'
import { TodoList } from '@/components/dashboard/home/TodoList'

// @cdc tableau de bord — accueil : trois questions (tout va bien, ça progresse, quoi faire),
// requêtes légères seulement. Le détail vit dans les onglets. Page privée, protégée par proxy.ts
// (HTTP Basic) et revérifiée ici, jamais mise en cache ni indexée, absente du sitemap.

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ periode?: string | string[] }>
}

const NO_TODO: TodoCounts = { messages: null, toReview: null, reports: null }
const updated = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' })

export default async function DashboardHome({ searchParams }: PageProps) {
  // Double verrou : sans identifiants configurés, la page n'existe pas, même si le proxy saute.
  if (!(await dashboardAllowed())) notFound()

  const period = parsePeriod((await searchParams).periode)
  const [status, kpis, buckets, conversions, todo] = await Promise.all([
    getStatusLines(),
    safeRead('chiffres', EMPTY_KPIS, (pool) => getHomeKpis(pool, period)),
    safeRead('histogramme', [], (pool) => getClickBuckets(pool, period)),
    safeRead('à retenir', EMPTY_CONVERSIONS, (pool) => getConversions(pool, period)),
    safeRead('à faire', NO_TODO, getTodoCounts),
  ])
  // Base injoignable : une ligne rouge de plus, les chiffres à zéro ne passent pas pour vrais.
  const lines = kpis.ok ? status : [...status, { text: 'Lecture de la base impossible : les chiffres ci-dessous restent à zéro.', tab: 'serveur' as const }]

  return (
    <DashboardShell period={period.key} current="" intro={`Mis à jour le ${updated.format(new Date())}, heure de Paris.`}>
      <StatusLines lines={lines} period={period.key} />
      <HomeKpis
        kpis={kpis.value}
        buckets={buckets.value}
        period={period}
        insight={conversions.ok ? insightOf(conversions.value.rows) : 'Pas de tendance à donner : la base n’a pas répondu.'}
      />
      <TodoList counts={todo.value} period={period.key} />
    </DashboardShell>
  )
}
