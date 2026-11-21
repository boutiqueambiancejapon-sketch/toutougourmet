import Link from 'next/link'
import { SITE } from '@/lib/seo-dash/config'
import { hrefOf, MAIN_TABS, TOOLS, type NavItem } from '@/lib/seo-dash/nav'
import { openSeoPage, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'

// @cdc tableau de bord SEO — menu complet (onglet « Menu » de la barre du bas sur iPhone) : site, écrans, outils.

export const dynamic = 'force-dynamic'

function List({ items, query, desc }: { items: NavItem[]; query: string; desc: boolean }) {
  return (
    <ul className="sd-menu-list">
      {items.map((t) => (
        <li key={t.slug}>
          <Link href={hrefOf(t.slug, t.tool ? '' : query)}>
            <span>
              <b>{t.label}</b>
              {desc ? <small>{t.desc}</small> : null}
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default async function MenuPage(props: SeoPageProps) {
  const { query } = await openSeoPage(props)
  return (
    <SeoShell current="menu" title="Menu">
      <div className="sd-menu-page">
        <section className="sd-card">
          <h2>Site</h2>
          <nav className="sd-seg sd-gap" aria-label="Sites">
            {SITE.sites.map((s) => (
              <a key={s.key} href={s.url} aria-current={s.key === SITE.key ? 'true' : undefined}>
                {s.label}
              </a>
            ))}
          </nav>
        </section>
        <section className="sd-card">
          <h2>Tableau de bord</h2>
          <List items={MAIN_TABS} query={query} desc />
        </section>
        <section className="sd-card">
          <h2>Outils</h2>
          <List items={TOOLS} query={query} desc={false} />
        </section>
      </div>
    </SeoShell>
  )
}
