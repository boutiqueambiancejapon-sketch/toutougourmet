import { NavLink } from './NavLink'
import { TAB_NAV } from './nav-items'

// @cdc 04-pages — barre d'onglets mobile façon app (prototype V2), masquée sur ordinateur.
// Hauteur réservée : --tabbar-h (globals.css), reprise par le spacer et les bandeaux collants.
export function TabBar() {
  return (
    <>
      <div aria-hidden="true" className="h-[var(--tabbar-h)] md:hidden" />
      <nav
        aria-label="Navigation mobile"
        className="v2 fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-end border-t border-line bg-paper px-2 pt-1.5 pb-[calc(8px+env(safe-area-inset-bottom))] md:hidden"
      >
        {TAB_NAV.map((item, i) => {
          const fab = i === 2
          return (
            <NavLink
              key={item.href}
              href={item.href}
              match={item.match}
              className="group flex min-h-[52px] flex-col items-center justify-end gap-0.5 overflow-hidden py-1 text-[11px] font-semibold text-ink-2 no-underline aria-[current=page]:text-ink"
            >
              <span
                aria-hidden="true"
                className={
                  fab
                    ? '-mt-[26px] grid size-[58px] place-items-center rounded-box border-4 border-cream bg-orange text-[26px] leading-none'
                    : 'grid h-[30px] w-11 place-items-center rounded-pill text-[21px] leading-none group-aria-[current=page]:bg-amber'
                }
              >
                {item.emoji}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}
