import type { ReportRow } from '@/lib/server/scanner-review'
import { Empty } from '../Panel'

// @cdc lot 6 — signalements d'erreur des lecteurs sur une fiche (scan_report), à traiter d'abord.

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' })

export function ReportList({ reports, handle }: { reports: ReportRow[]; handle: (reportId: string) => (form: FormData) => Promise<void> }) {
  if (reports.length === 0) return <Empty>Aucun signalement sur cette fiche.</Empty>
  return (
    <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
      {reports.map((r) => (
        <li key={r.id} className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4">
          <p className="m-0 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-2">
            <time dateTime={r.createdAt.toISOString()}>{dateFmt.format(r.createdAt)}</time>
            <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${r.handledAt ? 'bg-green-bg text-green-ink' : 'bg-amber-bg text-amber-ink'}`}>
              {r.handledAt ? 'Traité' : 'À traiter'}
            </span>
          </p>
          <p className="m-0 whitespace-pre-line break-words text-sm text-ink">{r.message}</p>
          {!r.handledAt && (
            <form action={handle(r.id)}>
              <button type="submit" className="min-h-10 rounded-control border-2 border-ink px-4 text-sm font-semibold text-ink hover:underline">
                Traité
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  )
}
