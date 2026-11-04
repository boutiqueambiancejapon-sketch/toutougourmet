import Link from 'next/link'
import type { PeriodKey } from '@/lib/dashboard/period'
import { tabHref } from '@/lib/dashboard/tabs'

// @cdc tableau de bord — sous-pages de l'onglet Trafic, défilantes sur mobile, chaque lien sur une ligne.

const VIEWS = [
  { sub: '', label: 'Vue d’ensemble' },
  { sub: '/direct', label: 'En direct' },
  { sub: '/acquisition', label: 'Acquisition' },
  { sub: '/pages', label: 'Pages et parcours' },
] as const

export type TrafficSub = (typeof VIEWS)[number]['sub']

export function TrafficNav({ period, current }: { period: PeriodKey; current: TrafficSub }) {
  return (
    <nav aria-label="Vues du trafic" className="-mx-4 mt-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="m-0 flex list-none gap-4 border-b border-line p-0 text-sm">
        {VIEWS.map((v) => {
          const on = v.sub === current
          return (
            <li key={v.sub} className="shrink-0">
              <Link
                href={tabHref('trafic', period, '', v.sub)}
                aria-current={on ? 'page' : undefined}
                className={`inline-flex min-h-10 items-center whitespace-nowrap border-b-2 font-semibold no-underline ${on ? 'border-orange text-ink' : 'border-transparent text-ink-2 hover:text-ink'}`}
              >
                {v.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
