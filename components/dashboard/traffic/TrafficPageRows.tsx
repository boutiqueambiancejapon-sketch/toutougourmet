import { pageTypeOf, PAGE_TYPE_LABELS } from '@/lib/page-type'
import type { EntryRow, PageCounts, TypeRow } from '@/lib/dashboard/traffic'
import { Empty } from '../Panel'

// @cdc tableau de bord — Trafic, Pages : une liste par ligne de deux étages, lisible sur iPhone
// sans défilement horizontal. Le chemin reste en survol quand un titre le remplace.

const nf = new Intl.NumberFormat('fr-FR')
const whole = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })
const LIMIT = 25

function plural(n: number, word: string): string {
  return `${nf.format(n)} ${word}${n > 1 ? 's' : ''}`
}

function results(clicks: number, emails: number): string {
  return [clicks ? plural(clicks, 'clic') : '', emails ? plural(emails, 'e-mail') : ''].filter(Boolean).join(', ')
}

function Line({ title, path, sub, value, unit }: { title: string; path?: string; sub: string; value: number; unit: string }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0" title={path}>
      <span className="min-w-0 [overflow-wrap:anywhere]">
        <span className="block text-ink">{title}</span>
        <span className="block text-xs text-ink-2">{sub}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-semibold tabular-nums text-ink">{nf.format(value)}</span>
        <span className="block text-xs text-ink-2">{unit}</span>
      </span>
    </li>
  )
}

const LIST = 'm-0 flex list-none flex-col divide-y divide-line p-0 text-sm'

export function TopPages({ rows, titles }: { rows: PageCounts[]; titles: Map<string, string> }) {
  const shown = rows.filter((r) => r.views > 0).slice(0, LIMIT)
  if (shown.length === 0) return <Empty>Aucune page vue sur la période.</Empty>
  return (
    <ol className={LIST}>
      {shown.map((r) => (
        <Line key={r.page} title={titles.get(r.page) ?? r.page} path={r.page} sub={[PAGE_TYPE_LABELS[pageTypeOf(r.page)], results(r.clicks, r.emails)].filter(Boolean).join(' · ')} value={r.views} unit="vues" />
      ))}
    </ol>
  )
}

export function EntryPages({ rows, titles }: { rows: EntryRow[]; titles: Map<string, string> }) {
  const shown = rows.slice(0, LIMIT)
  if (shown.length === 0) return <Empty>Aucune session sur la période.</Empty>
  return (
    <ol className={LIST}>
      {shown.map((r) => (
        <Line key={r.page} title={titles.get(r.page) ?? r.page} path={r.page} sub={`${PAGE_TYPE_LABELS[pageTypeOf(r.page)]} · rebond ${whole.format(r.bounce)}`} value={r.sessions} unit="entrées" />
      ))}
    </ol>
  )
}

export function PageTypes({ rows }: { rows: TypeRow[] }) {
  const shown = rows.filter((r) => r.views > 0)
  if (shown.length === 0) return <Empty>Aucune page vue sur la période.</Empty>
  return (
    <ol className={LIST}>
      {shown.map((r) => (
        <Line key={r.type} title={r.label} sub={results(r.clicks, r.emails)} value={r.views} unit="vues" />
      ))}
    </ol>
  )
}
