import Link from 'next/link'
import { SECURITY_PATH } from '@/lib/dashboard/login/policy'
import { PERIODS, type PeriodKey } from '@/lib/dashboard/period'
import { TABS, tabHref, type TabSlug } from '@/lib/dashboard/tabs'

// @cdc tableau de bord — en-tête collant : sélecteur de période (?periode=, gardé d'un onglet à
// l'autre) et barre d'onglets, défilante sur mobile. Chaque lien tient sur une ligne.

interface HeaderProps {
  period: PeriodKey
  current: TabSlug
  securityLink?: boolean
  onSecurity?: boolean
}

const pill = 'inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-pill font-semibold'

export function DashboardHeader({ period, current, securityLink = false, onSecurity = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto w-full max-w-page px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3 pb-2">
          <Link href={tabHref('', period)} className="whitespace-nowrap font-display text-lg font-black text-ink no-underline">
            Toutou <span className="text-orange-ink">Gourmet</span>
          </Link>
          <nav aria-label="Période" className="flex shrink-0 gap-0.5 rounded-pill bg-cream-2 p-0.5">
            {(Object.keys(PERIODS) as PeriodKey[]).map((key) => (
              <Link
                key={key}
                href={tabHref(current, key)}
                aria-current={key === period ? 'true' : undefined}
                className={`${pill} min-w-11 px-2.5 text-sm ${key === period ? 'bg-ink text-cream' : 'text-ink-2 hover:text-ink'}`}
              >
                {PERIODS[key].label}
              </Link>
            ))}
          </nav>
        </div>
        <nav aria-label="Onglets du tableau de bord" className="-mx-4 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
          <ul className="m-0 flex list-none gap-1.5 p-0 text-sm">
            {TABS.map((t) => {
              const on = !onSecurity && t.slug === current
              return (
                <li key={t.slug} className="shrink-0">
                  <Link
                    href={tabHref(t.slug, period)}
                    aria-current={on ? 'page' : undefined}
                    className={`${pill} border-2 px-3.5 no-underline ${on ? 'border-ink bg-ink text-cream' : 'border-line text-ink hover:border-line-2'}`}
                  >
                    {t.label}
                  </Link>
                </li>
              )
            })}
            {securityLink ? (
              <li className="shrink-0">
                <Link
                  href={SECURITY_PATH}
                  aria-current={onSecurity ? 'page' : undefined}
                  className={`${pill} border-2 px-3.5 no-underline ${onSecurity ? 'border-ink bg-ink text-cream' : 'border-line text-ink hover:border-line-2'}`}
                >
                  Sécurité
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  )
}
