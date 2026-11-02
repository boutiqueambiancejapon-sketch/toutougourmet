import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dashboardCredentials } from '@/lib/dashboard/auth'
import { getAnalysis, listReports } from '@/lib/server/scanner-review'
import { getDb } from '@/lib/server/drizzle'
import { ScoreDetail } from '@/components/scanner/ScoreDetail'
import { ConfirmSubmit } from '@/components/dashboard/review/ConfirmSubmit'
import { FicheForm } from '@/components/dashboard/review/FicheForm'
import { ReportList } from '@/components/dashboard/review/ReportList'
import { SectionTitle } from '@/components/dashboard/Panel'
import { handleReport, removeFiche, saveFiche } from '../actions'

// @cdc lot 6 — relecture privée d'une fiche du scanner (protégée par proxy.ts, et chaque action
// serveur revérifie l'authentification). Jamais mise en cache ni indexée.

export const dynamic = 'force-dynamic'

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' })
const SOURCE = { photo: 'photos lues par l\'IA', openpetfoodfacts: 'Open Pet Food Facts' } as const

export default async function FicheReviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!dashboardCredentials() || !getDb()) notFound()
  const { id } = await params
  const row = await getAnalysis(id)
  if (!row) notFound()
  const reports = await listReports(row.id)
  const l = row.extracted
  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-2 px-4 pb-16 md:px-8">
      <p className="pt-6 text-sm">
        <Link href="/tableau-de-bord#fiches" className="text-ink-2 underline underline-offset-2">
          Retour aux fiches à relire
        </Link>
      </p>
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-black text-ink">{[row.brand, row.product].filter(Boolean).join(' · ') || 'Fiche sans nom'}</h1>
        <p className="text-sm text-ink-2">
          {`${row.reviewed ? 'Relue, indexable' : 'Non relue, noindex'} · source : ${SOURCE[row.source]} · ${row.model} · créée le ${dateFmt.format(row.createdAt)}`}
          {row.ean ? ` · EAN ${row.ean}` : ''}
          {` · ${row.scanCount} consultation${row.scanCount > 1 ? 's' : ''} · `}
          <Link href={`/croquettes/${row.slug}`} className="underline underline-offset-2">
            {`/croquettes/${row.slug}`}
          </Link>
        </p>
        {l.champsDouteux.length > 0 && (
          <p className="mt-2 rounded-box bg-amber-bg px-3 py-2 text-sm text-amber-ink">{`Lus comme douteux : ${l.champsDouteux.join(', ')}.`}</p>
        )}
        {l.illisibles.length > 0 && <p className="text-sm text-ink-2">{`Passages illisibles : ${l.illisibles.join(' ; ')}.`}</p>}
      </header>

      <SectionTitle id="signalements" title="Signalements" />
      <ReportList reports={reports} handle={(reportId) => handleReport.bind(null, row.id, reportId)} />

      <SectionTitle id="corriger" title="Corriger et valider" intro="La note est recalculée par le barème à chaque enregistrement. L'adresse de la fiche ne change pas." />
      <div className="mt-2">
        <FicheForm row={row} action={saveFiche.bind(null, row.id)} />
      </div>

      <SectionTitle id="note" title="Note actuelle" />
      <div className="mt-2 rounded-card border border-line bg-paper p-4 md:p-6">
        <ScoreDetail details={row.details} />
      </div>

      <SectionTitle id="supprimer" title="Supprimer la fiche" intro="La fiche, son historique de consultations et ses signalements disparaissent. Un nouveau scan du même code-barres la recréera." />
      <form action={removeFiche.bind(null, row.id)} className="mt-2">
        <ConfirmSubmit message="Supprimer définitivement cette fiche ?">Supprimer</ConfirmSubmit>
      </form>
    </main>
  )
}
