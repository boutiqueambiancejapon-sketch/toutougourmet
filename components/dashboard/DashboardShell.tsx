import type { ReactNode } from 'react'
import type { PeriodKey } from '@/lib/dashboard/period'
import { tabOf, type TabSlug } from '@/lib/dashboard/tabs'
import { dashboardAuthMode } from '@/lib/server/dashboard-login/mode'
import { DashboardHeader } from './DashboardHeader'

// @cdc tableau de bord — cadre commun à l'accueil et aux onglets : en-tête, titre (le nom de
// l'onglet), la question à laquelle il répond, puis ses blocs.

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
  /** Vrai sur l'écran Sécurité : aucun onglet allumé. */
  security?: boolean
  children: ReactNode
}

export async function DashboardShell({ period, current, sub, noPeriod, title, intro, notice, security = false, children }: ShellProps) {
  const tab = tabOf(current)
  const hasLogin = (await dashboardAuthMode()) === 'login'
  return (
    <>
      <DashboardHeader period={period} current={current} sub={sub} noPeriod={noPeriod} securityLink={hasLogin} onSecurity={security} />
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
