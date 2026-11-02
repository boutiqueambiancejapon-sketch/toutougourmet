import { notFound } from 'next/navigation'
import { dashboardCredentials } from '@/lib/dashboard/auth'
import { parsePeriod } from '@/lib/dashboard/period'
import { loadDashboard } from '@/lib/server/dashboard-data'
import { getNightLogs, nightLogDir } from '@/lib/server/dashboard-logs'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ActionsSection } from '@/components/dashboard/ActionsSection'
import { AiSection } from '@/components/dashboard/AiSection'
import { NightSection } from '@/components/dashboard/NightSection'
import { MessagesSection } from '@/components/dashboard/MessagesSection'

// @cdc tableau de bord — page privée du propriétaire, protégée par proxy.ts (HTTP Basic).
// Lue à chaque visite, jamais mise en cache ni indexée, absente du sitemap.

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ periode?: string | string[] }>
}

const updated = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' })

export default async function DashboardPage({ searchParams }: PageProps) {
  // Double verrou : sans identifiants configurés, la page n'existe pas, même si le proxy saute.
  if (!dashboardCredentials()) notFound()

  const period = parsePeriod((await searchParams).periode)
  const [data, logs] = await Promise.all([loadDashboard(period), getNightLogs(7)])

  return (
    <>
      <DashboardHeader period={period} />
      <main className="mx-auto w-full max-w-page px-4 pb-16 md:px-8">
        <div className="pt-6">
          <h1 className="font-display text-3xl font-black text-ink">Tableau de bord</h1>
          <p className="mt-1 text-sm text-ink-2">Mis à jour le {updated.format(new Date())}, heure de Paris.</p>
        </div>
        {data.notice && (
          <p role="status" className="mt-4 rounded-box border border-amber bg-amber-bg px-4 py-3 text-sm text-amber-ink">
            {data.notice}
          </p>
        )}
        <ActionsSection data={data.summary} period={period} />
        <AiSection data={data.ai} period={period} unread={data.unread} articleCount={data.articleCount} />
        <MessagesSection messages={data.messages} />
        <NightSection logs={logs} configured={nightLogDir() !== null} />
      </main>
    </>
  )
}
