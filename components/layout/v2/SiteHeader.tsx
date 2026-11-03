import Link from 'next/link'
import { HeaderAccount } from '@/components/cro/HeaderAccount'
import { Brand } from './Brand'
import { NavLink } from './NavLink'
import { DESKTOP_NAV } from './nav-items'

// @cdc 04-pages — en-tête V2 : barre de navigation sur ordinateur, barre simple sur mobile
// (la navigation mobile passe par la barre d'onglets du bas, voir TabBar). Compte : bouton
// « Créer un compte » ou « Mon chien » (components/cro/HeaderAccount, maquette CRO 1A). Sous 640 px,
// « Marques » laisse sa place au bouton compte (marques : pied de page et page d'accueil).
export function SiteHeader() {
  return (
    <header className="v2 sticky top-0 z-40 border-b border-line bg-cream">
      <div className="mx-auto flex max-w-page items-center gap-3 px-4 py-2.5 md:gap-4 md:px-8 md:py-3 xl:gap-7">
        <Brand />
        <nav aria-label="Navigation principale" className="hidden flex-1 gap-1 md:flex">
          {DESKTOP_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              match={item.match}
              className="rounded-control px-2 py-2.5 text-[15px] lg:px-3.5 font-semibold text-ink no-underline hover:bg-cream-2 aria-[current=page]:bg-amber"
            >
              {item.icon ? (
                <span className="inline-flex items-center gap-1.5">
                  <item.icon className="size-[18px]" />
                  {item.label}
                </span>
              ) : (
                item.label
              )}
            </NavLink>
          ))}
        </nav>
        <HeaderAccount />
        <Link
          href="/quiz"
          className="hidden min-h-11 shrink-0 items-center whitespace-nowrap rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline lg:inline-flex"
        >
          <span className="hidden 2xl:inline">Faire le test de mon chien</span>
          <span className="2xl:hidden">Le test</span>
        </Link>
        <Link
          href="/chien/marque"
          className="hidden min-h-11 shrink-0 items-center whitespace-nowrap rounded-control border border-line bg-paper px-3.5 text-[15px] font-semibold text-ink no-underline sm:inline-flex md:hidden"
        >
          Marques
        </Link>
      </div>
    </header>
  )
}
