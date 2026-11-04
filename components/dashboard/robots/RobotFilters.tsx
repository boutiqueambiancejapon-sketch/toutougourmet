import Link from 'next/link'
import { periodQuery, type PeriodKey } from '@/lib/dashboard/period'
import { ROBOT_KINDS, robotHref, type RobotFilter } from '@/lib/dashboard/robots'
import { tabHref } from '@/lib/dashboard/tabs'

// @cdc tableau de bord — filtres des robots dans l'URL, une rangée par dimension, défilante sur mobile.

const chip = 'inline-flex min-h-10 items-center whitespace-nowrap rounded-pill border px-3 font-semibold no-underline'
const on = 'border-ink bg-ink text-cream'
const off = 'border-line bg-paper text-ink'

function Row({ label, items }: { label: string; items: { key: string; text: string; href: string; active: boolean }[] }) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="m-0 flex list-none gap-1.5 p-0 text-sm">
        {items.map((i) => (
          <li key={i.key} className="shrink-0">
            <Link href={i.href} scroll={false} aria-current={i.active ? 'true' : undefined} className={`${chip} ${i.active ? on : off}`}>
              {i.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function RobotFilters({ period, filter, operators }: { period: PeriodKey; filter: RobotFilter; operators: string[] }) {
  const base = tabHref('robots', '7j')
  const href = (next: RobotFilter) => robotHref(base, periodQuery(period), next)
  return (
    <div className="mt-4 flex flex-col gap-2">
      <Row
        label="Filtrer par robot"
        items={[{ key: 'tous', text: 'Tous les robots', href: href({ ...filter, robot: null }), active: filter.robot === null }, ...operators.map((o) => ({ key: o, text: o, href: href({ ...filter, robot: o }), active: filter.robot === o }))]}
      />
      <Row
        label="Filtrer par type de visite"
        items={[{ key: 'tous', text: 'Toutes les visites', href: href({ ...filter, kind: null }), active: filter.kind === null }, ...ROBOT_KINDS.map((k) => ({ key: k.key, text: k.label, href: href({ ...filter, kind: k.key }), active: filter.kind === k.key }))]}
      />
    </div>
  )
}
