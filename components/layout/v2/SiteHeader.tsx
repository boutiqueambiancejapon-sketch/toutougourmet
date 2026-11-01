import Link from 'next/link'
import { Brand } from './Brand'
import { NavLink } from './NavLink'
import { DESKTOP_NAV } from './nav-items'

// @cdc 04-pages — en-tête V2 : barre de navigation sur ordinateur, barre simple sur mobile
// (la navigation mobile passe par la barre d'onglets du bas, voir TabBar).
export function SiteHeader() {
  return (
    <header className="v2 sticky top-0 z-40 border-b border-line bg-cream">
      <div className="mx-auto flex max-w-page items-center gap-7 px-4 py-2.5 md:px-8 md:py-3">
        <Brand />
        <nav aria-label="Navigation principale" className="hidden flex-1 gap-1 md:flex">
          {DESKTOP_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              match={item.match}
              className="rounded-control px-3.5 py-2.5 text-[15px] font-semibold text-ink no-underline hover:bg-cream-2 aria-[current=page]:bg-amber"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link
          href="/quiz"
          className="ml-auto hidden min-h-11 items-center rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline md:inline-flex"
        >
          Faire le test de mon chien
        </Link>
        <Link
          href="/chien/marque"
          className="ml-auto inline-flex min-h-11 items-center rounded-control border border-line bg-paper px-3.5 text-[15px] font-semibold text-ink no-underline md:hidden"
        >
          Marques
        </Link>
      </div>
    </header>
  )
}
