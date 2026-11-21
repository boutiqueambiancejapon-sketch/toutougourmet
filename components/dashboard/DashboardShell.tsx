import type { ReactNode } from 'react'
import Link from 'next/link'
import { PERIODS, type PeriodKey } from '@/lib/dashboard/period'
import { tabHref, tabOf, type TabSlug } from '@/lib/dashboard/tabs'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'

// @cdc tableau de bord — cadre des outils (anciens écrans) : même menu que le tableau de bord SEO, avec leur
// propre sélecteur de période (?periode=24h|7j|30j|90j) quand ils en ont un.

interface ShellProps {
  period: PeriodKey
  current: TabSlug
  /** Sous-page de l'onglet, gardée quand on change de période. */
  sub?: string
  noPeriod?: boolean
  /** Titre de la page quand ce n'est pas le nom de l'onglet (sous-page). */
  title?: string
  /** Sous le titre : la question de l'onglet par défaut. */
  intro?: string
  /** Base injoignable ou lecture en échec : dit en clair, la page reste debout. */
  notice?: string | null
  /** Vrai sur l'écran Sécurité. */
  security?: boolean
  /** Entrée du menu à allumer quand elle diffère de l'onglet d'origine (ex. « scanner », « assistant »). */
  tool?: string
  children: ReactNode
}

const NAV_OF: Record<string, string> = { robots: 'exploration', trafic: '' }

export function DashboardShell({ period, current, sub, noPeriod, title, intro, notice, security = false, tool, children }: ShellProps) {
  const tab = tabOf(current)
  const nav = tool ?? (security ? 'securite' : (NAV_OF[current] ?? current))
  return (
    <SeoShell current={nav} title={title ?? (current ? tab.label : 'Tableau de bord')} sub={intro ?? tab.question} legacy>
      {noPeriod ? null : (
        <nav aria-label="Période" className="flex w-fit gap-0.5 rounded-pill bg-cream-2 p-0.5">
          {(Object.keys(PERIODS) as PeriodKey[]).map((key) => (
            <Link
              key={key}
              href={tabHref(current, key, '', sub)}
              aria-current={key === period ? 'true' : undefined}
              className={`inline-flex min-h-9 min-w-10 items-center justify-center whitespace-nowrap rounded-pill px-2 text-sm font-semibold no-underline ${key === period ? 'bg-ink text-cream' : 'text-ink-2 hover:text-ink'}`}
            >
              {PERIODS[key].label}
            </Link>
          ))}
        </nav>
      )}
      {notice ? (
        <p role="status" className="m-0 mt-4 rounded-box border border-amber bg-amber-bg px-4 py-3 text-sm text-amber-ink">
          {notice}
        </p>
      ) : null}
      {children}
    </SeoShell>
  )
}
