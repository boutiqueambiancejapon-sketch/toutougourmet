import type { Row } from '@/lib/server/dashboard-queries'
import { Empty } from './Panel'

// @cdc tableau de bord — barres horizontales rendues serveur (une seule série, une seule teinte).
// Libellé au-dessus de la barre pour tenir sur iPhone, valeur à droite en encre, survol par title.

const nf = new Intl.NumberFormat('fr-FR')

interface BarListProps {
  rows: Row[]
  empty: string
  unit?: string
  format?: (label: string) => string
  /** Total de référence : ajoute la part en % à côté de chaque valeur. */
  total?: number
}

const pf = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })

export function BarList({ rows, empty, unit = '', format, total }: BarListProps) {
  if (rows.length === 0) return <Empty>{empty}</Empty>
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ol className="flex flex-col gap-3">
      {rows.map((r) => {
        const label = format ? format(r.label) : r.label
        const share = total ? ` · ${pf.format(r.value / total)}` : ''
        const value = `${nf.format(r.value)}${unit}${share}`
        return (
          <li key={r.label} title={`${label} : ${value}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 break-words [overflow-wrap:anywhere] text-ink">{label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-ink">{value}</span>
            </div>
            <div className="mt-1 h-2 rounded-pill bg-cream-2" aria-hidden="true">
              <div className="h-2 rounded-pill bg-orange" style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Variante sans barre : liste simple (pages jamais lues, etc.). */
export function PlainList({ items, empty }: { items: { key: string; label: string; href?: string }[]; empty: string }) {
  if (items.length === 0) return <Empty>{empty}</Empty>
  return (
    <ul className="flex flex-col divide-y divide-line text-sm">
      {items.map((i) => (
        <li key={i.key} className="py-2 text-ink">
          {i.href ? (
            <a href={i.href} className="break-words underline decoration-line-2 underline-offset-2">
              {i.label}
            </a>
          ) : (
            i.label
          )}
        </li>
      ))}
    </ul>
  )
}
