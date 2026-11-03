import type { ScoreResult } from '@/lib/scanner/score'

// @cdc lot 6 — fiche A4 : chaque critère avec sa barre de points et son explication.

function barColor(ratio: number): string {
  if (ratio >= 0.75) return 'bg-green-strong'
  if (ratio >= 0.5) return 'bg-amber-ink'
  return 'bg-rose-ink'
}

export function FicheCriteria({ details }: { details: ScoreResult }) {
  return (
    <section className="flex flex-col gap-2 print:break-inside-avoid-page">
      <h2 className="m-0 font-display text-xl font-black text-ink print:text-[16px]">Le détail des critères</h2>
      <ul role="list" className="m-0 grid list-none gap-x-6 gap-y-3 p-0 sm:grid-cols-2 print:grid-cols-2 print:gap-y-1.5">
        {details.criteria.map((c) => {
          const ratio = c.points === null ? 0 : c.points / c.max
          return (
            <li key={c.id} className="flex flex-col gap-1 print:break-inside-avoid">
              <p className="m-0 flex items-baseline justify-between gap-2 text-[15px] print:text-[11px]">
                <span className="font-semibold text-ink">{c.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">{c.points === null ? 'non évalué' : `${c.points}/${c.max}`}</span>
              </p>
              <span className="block h-2 overflow-hidden rounded-pill bg-cream-2 print:h-1.5" aria-hidden="true">
                <span className={`block h-full rounded-pill ${barColor(ratio)}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
              </span>
              <p className="m-0 text-sm leading-snug text-ink-2 print:text-[10px]">{c.explanation}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
