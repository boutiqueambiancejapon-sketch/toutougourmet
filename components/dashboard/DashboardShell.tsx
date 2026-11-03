import type { ReactNode } from 'react'
import type { PeriodKey } from '@/lib/dashboard/period'
import { tabOf, type TabSlug } from '@/lib/dashboard/tabs'
import { DashboardHeader } from './DashboardHeader'

// @cdc tableau de bord — cadre commun à l'accueil et aux onglets : en-tête, titre (le nom de
// l'onglet), la question à laquelle il répond, puis ses blocs.

interface ShellProps {
  period: PeriodKey
  current: TabSlug
  /** Titre de la page quand ce n'est pas le nom de l'onglet (sous-page). */
  title?: string
  /** Sous le titre : la question de l'onglet par défaut. */
  intro?: string
  /** Base injoignable ou lecture en échec : dit en clair, la page reste debout. */
  notice?: string | null
  children: ReactNode
}

export function DashboardShell({ period, current, title, intro, notice, children }: ShellProps) {
  const tab = tabOf(current)
  return (
    <>
      <DashboardHeader period={period} current={current} />
      <main className="mx-auto w-full max-w-page px-4 pb-16 md:px-8">
        <div className="pt-5">
          <h1 className="page-title m-0 text-ink">{title ?? (current ? tab.label : 'Tableau de bord')}</h1>
          <p className="m-0 mt-1 max-w-prose text-sm text-ink-2">{intro ?? tab.question}</p>
        </div>
        {notice ? (
          <p role="status" className="m-0 mt-4 rounded-box border border-amber bg-amber-bg px-4 py-3 text-sm text-amber-ink">
            {notice}
          </p>
        ) : null}
        {children}
      </main>
    </>
  )
}
