import Link from 'next/link'
import { SITE } from '@/lib/seo-dash/config'
import { BOTTOM_BAR, hrefOf, MAIN_TABS, TOOLS } from '@/lib/seo-dash/nav'
import { NavIcon } from './Icons'

// @cdc tableau de bord SEO — menu de gauche (ordinateur), en-tête et barre du bas (iPhone). Les filtres suivent
// d'un onglet de pilotage à l'autre (query) ; les outils s'ouvrent sans.

export function SiteSwitcher({ compact = false }: { compact?: boolean }) {
  return (
    <details className="sd-sel plain">
      <summary aria-label="Changer de site">
        {compact ? SITE.name : <span>changer de site</span>}
      </summary>
      <nav className="sd-menu" aria-label="Sites">
        {SITE.sites.map((s) => (
          <a key={s.key} href={s.url} aria-current={s.key === SITE.key ? 'true' : undefined}>
            {s.label}
          </a>
        ))}
      </nav>
    </details>
  )
}

export function Sidebar({ current, query }: { current: string; query: string }) {
  return (
    <aside className="sd-side">
      <div className="sd-brand">
        <i aria-hidden="true" />
        <div>
          {SITE.name}
          <small>
            <SiteSwitcher />
          </small>
        </div>
      </div>
      <nav className="sd-nav" aria-label="Tableau de bord">
        {MAIN_TABS.map((t) => (
          <Link key={t.slug} href={hrefOf(t.slug, query)} aria-current={t.slug === current ? 'page' : undefined}>
            {t.label}
          </Link>
        ))}
        <p className="sd-navh">Outils</p>
        {TOOLS.map((t) => (
          <Link key={t.slug} href={hrefOf(t.slug)} aria-current={t.slug === current ? 'page' : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export function MobileTop({ title }: { title: string }) {
  return (
    <div className="sd-mtop">
      <div>
        <div className="site">
          <SiteSwitcher compact />
        </div>
        <div className="ti">{title}</div>
      </div>
    </div>
  )
}

export function BottomBar({ current, query }: { current: string; query: string }) {
  const tools = TOOLS.some((t) => t.slug === current) || current === 'menu'
  return (
    <nav className="sd-mtab" aria-label="Onglets principaux">
      {BOTTOM_BAR.map((b) => {
        const on = b.slug === 'menu' ? tools || !BOTTOM_BAR.some((x) => x.slug === current) : b.slug === current
        return (
          <Link key={b.slug} href={hrefOf(b.slug, b.slug === 'menu' ? '' : query)} aria-current={on ? 'page' : undefined}>
            <NavIcon name={b.icon} />
            {b.label}
          </Link>
        )
      })}
    </nav>
  )
}
