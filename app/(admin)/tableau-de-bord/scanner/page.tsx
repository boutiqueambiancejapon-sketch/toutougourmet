import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { parsePeriod } from '@/lib/dashboard/period'
import { READ_FAILED } from '@/lib/dashboard/tab-page'
import { getFicheChecks } from '@/lib/server/dashboard-fiche-checks'
import { getScannerHealth } from '@/lib/server/dashboard-scanner'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Empty } from '@/components/dashboard/Panel'
import { FicheCheckCard } from '@/components/dashboard/scanner/FicheCheckCard'
import { RecentFailures, RecentScans } from '@/components/dashboard/scanner/ScannerLists'
import { DailyCap, ScannerTiles } from '@/components/dashboard/scanner/ScannerNumbers'

// @cdc tableau de bord — santé du scanner, sous-page de l'onglet Contenu. Identifiants revérifiés
// ici (guard.ts), jamais indexée, jamais en cache.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Santé du scanner — Tableau de bord' },
  robots: { index: false, follow: false, nocache: true },
}

const NOT_YET = 'Le journal du scanner n’existe pas encore sur ce serveur (db/analytics.sql à appliquer) : les scans par code-barres et par photo ne sont pas encore comptés.'

export default async function ScannerHealthPage() {
  if (!(await dashboardAllowed())) notFound()
  const [health, checks] = await Promise.all([getScannerHealth(), getFicheChecks()])
  const { today, week } = health.counts
  const nothingYet = health.journal && week.code + week.photo + today.code + today.photo === 0
  return (
    <DashboardShell
      period={parsePeriod(undefined).key}
      current="contenu"
      title="Santé du scanner"
      intro="Chaque essai de scan compte, réussi ou non. Les chiffres partent de la mise en service du journal."
      notice={!health.journal ? NOT_YET : health.partial ? READ_FAILED : null}
    >
      <p className="m-0 mt-3 text-sm">
        <Link href="/tableau-de-bord/contenu" className="text-ink-2 underline underline-offset-2">
          Retour à l’onglet Contenu
        </Link>
      </p>
      {nothingYet ? (
        <div className="mt-4">
          <Empty>Aucun scan sur les 7 derniers jours. Dès qu’un visiteur scanne un produit, réussi ou non, les chiffres s’affichent ici.</Empty>
        </div>
      ) : null}
      <ScannerTiles counts={health.counts} reports={health.reports} />
      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <DailyCap calls={health.calls} cap={health.cap} />
          <RecentFailures rows={health.failures} journal={health.journal} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <FicheCheckCard checks={checks} />
          <RecentScans rows={health.scans} checks={checks.byFood} />
        </div>
      </div>
    </DashboardShell>
  )
}
