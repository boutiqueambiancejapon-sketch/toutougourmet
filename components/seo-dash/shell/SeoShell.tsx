import type { ReactNode } from 'react'
import { filterQuery, type Filters } from '@/lib/seo-dash/filters'
import { FilterBar } from './FilterBar'
import { BottomBar, MobileTop, Sidebar } from './Sidebar'
import '../seo-dash.css'

// @cdc tableau de bord SEO — cadre commun : menu de gauche, titre et phrase d'intro, barre de filtres, puis la page.
// Sur iPhone : nom du site et titre en haut, barre de 5 onglets en bas.

interface Props {
  current: string
  title: string
  sub?: string
  filters?: Filters
  /** Chemin de la page, pour les liens des filtres. */
  path?: string
  keep?: Record<string, string>
  fresh?: string
  hide?: ('compare' | 'pages' | 'device')[]
  /** Contenu d'un outil (anciens écrans) : pas de styles de tableau du nouveau tableau de bord. */
  legacy?: boolean
  children: ReactNode
}

export function SeoShell({ current, title, sub, filters, path, keep, fresh, hide, legacy = false, children }: Props) {
  const query = filters ? filterQuery(filters) : ''
  return (
    <div className="sd">
      <div className="sd-app">
        <Sidebar current={current} query={query} />
        <main className={`sd-main ${legacy ? 'sd-old' : 'sd-v'}`}>
          <MobileTop title={title} />
          <div className="sd-top sd-v">
            <div>
              <h1>{title}</h1>
              {sub ? <p className="sd-sub">{sub}</p> : null}
            </div>
          </div>
          {filters && path ? <FilterBar filters={filters} path={path} keep={keep} fresh={fresh} hide={hide} /> : null}
          {children}
        </main>
      </div>
      <BottomBar current={current} query={query} />
    </div>
  )
}
