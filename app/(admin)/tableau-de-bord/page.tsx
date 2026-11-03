import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { parsePeriod } from '@/lib/dashboard/period'
import { loadDashboard } from '@/lib/server/dashboard-data'
import { getNightLogs, nightLogDir } from '@/lib/server/dashboard-logs'
import { getServerHealth } from '@/lib/server/dashboard-health'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ActionsSection } from '@/components/dashboard/ActionsSection'
import { AiSection } from '@/components/dashboard/AiSection'
import { GeoSection } from '@/components/dashboard/GeoSection'
import { NightSection } from '@/components/dashboard/NightSection'
import { MessagesSection } from '@/components/dashboard/MessagesSection'
import { LiveSection } from '@/components/dashboard/LiveSection'
import { HealthBanner } from '@/components/dashboard/HealthBanner'
import { ServerSection } from '@/components/dashboard/ServerSection'
import { ReviewSection } from '@/components/dashboard/ReviewSection'
import { EmailsSection } from '@/components/dashboard/EmailsSection'
import { listToReview, type ReviewRow } from '@/lib/server/scanner-review'
import { getDb } from '@/lib/server/drizzle'
import { getPool } from '@/lib/server/db'
import { EMPTY_SIGNUPS, getSignups, type SignupsData } from '@/lib/server/dashboard-signups'
import { SignupsSection } from '@/components/dashboard/SignupsSection'
import { EMPTY_CONVERSIONS, getConversions, type ConversionsData } from '@/lib/server/dashboard-conversions'
import { ConversionsSection } from '@/components/dashboard/ConversionsSection'
import type { Period } from '@/lib/dashboard/period'

async function loadReview(): Promise<{ rows: ReviewRow[]; error: boolean }> {
  if (!getDb()) return { rows: [], error: true }
  return listToReview()
    .then((rows) => ({ rows, error: false }))
    .catch((err: unknown) => {
      console.error('[tableau-de-bord] fiches à relire', err instanceof Error ? err.message : err)
      return { rows: [], error: true }
    })
}

/** Section « Inscriptions » lue à part : une panne n'efface pas le reste du tableau de bord. */
async function loadSignups(period: Period): Promise<SignupsData> {
  const pool = getPool()
  if (!pool) return EMPTY_SIGNUPS
  return getSignups(pool, period).catch((err: unknown) => {
    console.error('[tableau-de-bord] inscriptions', err instanceof Error ? err.message : err)
    return EMPTY_SIGNUPS
  })
}

/** Section « Conversions par type de page » lue à part, comme les inscriptions. */
async function loadConversions(period: Period): Promise<ConversionsData> {
  const pool = getPool()
  if (!pool) return EMPTY_CONVERSIONS
  return getConversions(pool, period).catch((err: unknown) => {
    console.error('[tableau-de-bord] conversions', err instanceof Error ? err.message : err)
    return EMPTY_CONVERSIONS
  })
}

// @cdc tableau de bord — page privée du propriétaire, protégée par proxy.ts (HTTP Basic).
// Lue à chaque visite, jamais mise en cache ni indexée, absente du sitemap.

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ periode?: string | string[] }>
}

const updated = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' })

export default async function DashboardPage({ searchParams }: PageProps) {
  // Double verrou : sans identifiants configurés, la page n'existe pas, même si le proxy saute.
  if (!(await dashboardAllowed())) notFound()

  const period = parsePeriod((await searchParams).periode)
  const [data, logs, health, review, signups, conversions] = await Promise.all([
    loadDashboard(period),
    getNightLogs(7),
    getServerHealth(),
    loadReview(),
    loadSignups(period),
    loadConversions(period),
  ])

  return (
    <>
      <DashboardHeader period={period} />
      <main className="mx-auto w-full max-w-page px-4 pb-16 md:px-8">
        <div className="pt-6">
          <h1 className="font-display text-3xl font-black text-ink">Tableau de bord</h1>
          <p className="mt-1 text-sm text-ink-2">Mis à jour le {updated.format(health.now)}, heure de Paris.</p>
        </div>
        <HealthBanner alerts={health.alerts} />
        {data.notice && (
          <p role="status" className="mt-4 rounded-box border border-amber bg-amber-bg px-4 py-3 text-sm text-amber-ink">
            {data.notice}
          </p>
        )}
        <LiveSection />
        <ActionsSection data={data.summary} period={period} />
        <SignupsSection data={signups} period={period} />
        <ConversionsSection data={conversions} period={period} />
        <GeoSection data={data.geo} period={period} />
        <AiSection data={data.ai} period={period} unread={data.unread} articleCount={data.articleCount} />
        <MessagesSection messages={data.messages} />
        <ReviewSection rows={review.rows} error={review.error} />
        <EmailsSection />
        <NightSection logs={logs} configured={nightLogDir() !== null} />
        <ServerSection health={health} />
      </main>
    </>
  )
}
