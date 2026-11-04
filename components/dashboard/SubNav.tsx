import Link from 'next/link'
import type { PeriodKey } from '@/lib/dashboard/period'
import { tabHref, type TabSlug } from '@/lib/dashboard/tabs'

// @cdc tableau de bord — sous-pages d'un onglet, défilantes sur mobile, chaque lien sur une ligne.

interface SubNavProps {
  tab: TabSlug
  label: string
  views: readonly { sub: string; label: string }[]
  period: PeriodKey
  current: string
}

export function SubNav({ tab, label, views, period, current }: SubNavProps) {
  return (
    <nav aria-label={label} className="-mx-4 mt-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="m-0 flex list-none gap-4 border-b border-line p-0 text-sm">
        {views.map((v) => {
          const on = v.sub === current
          return (
            <li key={v.sub} className="shrink-0">
              <Link
                href={tabHref(tab, period, '', v.sub)}
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
