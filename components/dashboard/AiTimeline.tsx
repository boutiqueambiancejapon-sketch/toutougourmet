import type { BucketRow } from '@/lib/server/dashboard-queries'
import { bucketLabel } from '@/lib/dashboard/buckets'
import { Empty } from './Panel'

// @cdc tableau de bord — colonnes empilées par type de robot IA, rendues serveur.
// Palette validée (skill dataviz, validate_palette.js, mode clair) : orange, bleu, vert foncé,
// toujours dans cet ordre. Légende + tableau de données : l'identité ne repose pas sur la couleur seule.

export const AI_SERIES = [
  { key: 'training', label: 'Entraînement', swatch: 'bg-orange' },
  { key: 'search', label: 'Moteur IA', swatch: 'bg-accent-blue' },
  { key: 'user', label: 'Lecture en direct', swatch: 'bg-green-ink' },
] as const

const nf = new Intl.NumberFormat('fr-FR')

export function AiTimeline({ rows, hourly }: { rows: BucketRow[]; hourly: boolean }) {
  const totals = rows.map((r) => r.training + r.search + r.user)
  const max = Math.max(...totals, 0)
  if (max === 0) return <Empty>Aucune visite de robot IA sur la période.</Empty>

  return (
    <figure>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2" aria-label="Légende">
        {AI_SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-pill ${s.swatch}`} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="flex h-32 items-end gap-0.5 border-b border-line-2" aria-hidden="true">
        {rows.map((r, idx) => (
          <div
            key={r.bucket}
            title={`${bucketLabel(r.bucket, hourly)} : ${nf.format(totals[idx])} (entraînement ${r.training}, moteur ${r.search}, direct ${r.user})`}
            className="flex h-full min-w-0 flex-1 flex-col-reverse gap-0.5 hover:opacity-80"
          >
            {AI_SERIES.map((s) =>
              r[s.key] > 0 ? (
                <div key={s.key} className={`${s.swatch} last:rounded-t-sm`} style={{ height: `${(r[s.key] / max) * 100}%` }} />
              ) : null,
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs tabular-nums text-ink-2" aria-hidden="true">
        <span>{bucketLabel(rows[0].bucket, hourly)}</span>
        <span>max {nf.format(max)}</span>
        <span>{bucketLabel(rows[rows.length - 1].bucket, hourly)}</span>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink-2">Voir les chiffres</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-xs text-ink-2">
            <tr>
              <th className="py-1 font-semibold">{hourly ? 'Heure' : 'Jour'}</th>
              {AI_SERIES.map((s) => (
                <th key={s.key} className="py-1 text-right font-semibold">{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.bucket}>
                <td className="py-1">{bucketLabel(r.bucket, hourly)}</td>
                {AI_SERIES.map((s) => (
                  <td key={s.key} className="py-1 text-right">{nf.format(r[s.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
