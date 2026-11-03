import Link from 'next/link'
import { PERIODS, type Period, type PeriodKey } from '@/lib/dashboard/period'

// @cdc tableau de bord — en-tête collant : sélecteur de période (?periode=) et accès aux sections.

const SECTIONS = [
  { id: 'direct', label: 'En direct' },
  { id: 'chiffres', label: 'Chiffres' },
  { id: 'partenaires', label: 'Partenaires' },
  { id: 'lecteurs', label: 'Lecteurs' },
  { id: 'inscriptions', label: 'Inscriptions' },
  { id: 'conversions', label: 'Conversions' },
  { id: 'pays', label: 'Pays' },
  { id: 'ia', label: 'IA' },
  { id: 'messages', label: 'Messages' },
  { id: 'fiches', label: 'Fiches' },
  { id: 'nuit', label: 'Tâche de nuit' },
  { id: 'serveur', label: 'Serveur' },
]

export function DashboardHeader({ period }: { period: Period }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-page flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:px-8">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-lg font-black text-ink">
            Toutou <span className="text-orange-ink">Gourmet</span>
          </p>
          <nav aria-label="Période" className="flex rounded-pill border border-line bg-paper p-0.5 md:hidden">
            <PeriodLinks current={period.key} />
          </nav>
        </div>
        <nav aria-label="Sections" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:ml-6 md:px-0">
          <ul className="flex gap-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-flex min-h-9 items-center whitespace-nowrap rounded-pill px-3 font-semibold text-ink-2 hover:bg-cream-2 hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Période" className="ml-auto hidden rounded-pill border border-line bg-paper p-0.5 md:flex">
          <PeriodLinks current={period.key} />
        </nav>
      </div>
    </header>
  )
}

function PeriodLinks({ current }: { current: PeriodKey }) {
  return (Object.keys(PERIODS) as PeriodKey[]).map((key) => (
    <Link
      key={key}
      href={`?periode=${key}`}
      aria-current={key === current ? 'page' : undefined}
      className={`inline-flex min-h-9 min-w-12 items-center justify-center rounded-pill px-3 text-sm font-semibold ${
        key === current ? 'bg-ink text-cream' : 'text-ink-2 hover:text-ink'
      }`}
    >
      {PERIODS[key].label}
    </Link>
  ))
}
