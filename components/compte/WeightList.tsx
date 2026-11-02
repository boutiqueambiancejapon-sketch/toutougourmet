import type { WeightEntry } from '@/db/schema'
import { formatDateFr, formatKg } from '@/lib/dog-profile'

// @cdc lot 4 — historique des pesées, la plus récente en premier, avec l'écart à la précédente.
export function WeightList({ entries }: { entries: WeightEntry[] }) {
  if (entries.length === 0) {
    return <p className="m-0 text-base text-ink-2">Aucune pesée pour l&apos;instant.</p>
  }
  return (
    <ol role="list" className="m-0 flex list-none flex-col divide-y divide-line p-0">
      {entries.map((e, i) => {
        const prev = entries[i + 1]
        const diff = prev ? Math.round((e.weightKg - prev.weightKg) * 100) / 100 : null
        return (
          <li key={e.id} className="flex items-baseline justify-between gap-3 py-2.5 text-[15px] text-ink">
            <span>{formatDateFr(e.date)}</span>
            <span className="font-semibold">
              {formatKg(e.weightKg)}
              {diff ? <span className="ml-2 font-normal text-ink-2">{`${diff > 0 ? '+' : '−'}${formatKg(Math.abs(diff))}`}</span> : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
