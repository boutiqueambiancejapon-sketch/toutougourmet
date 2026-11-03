import Link from 'next/link'
import { IconChevron } from '@/components/icons'
import type { PeriodKey } from '@/lib/dashboard/period'
import { tabHref } from '@/lib/dashboard/tabs'
import type { TodoCounts } from '@/lib/server/dashboard-home'

// @cdc tableau de bord — « À faire » : seulement ce qui attend une action, avec son nombre et un
// lien vers l'onglet. Un compte illisible s'affiche aussi : il mérite un coup d'œil.

const ITEMS: { key: keyof TodoCounts; label: string; hash: string }[] = [
  { key: 'messages', label: 'Messages de contact à traiter', hash: '#messages' },
  { key: 'toReview', label: 'Fiches croquettes à relire', hash: '#fiches' },
  { key: 'reports', label: 'Erreurs signalées par des lecteurs', hash: '#fiches' },
]

export function TodoList({ counts, period }: { counts: TodoCounts; period: PeriodKey }) {
  const pending = ITEMS.filter((i) => counts[i.key] !== 0)
  return (
    <section aria-labelledby="a-faire" className="mt-8">
      <h2 id="a-faire" className="m-0 font-display text-xl font-black text-ink">
        À faire
      </h2>
      {pending.length === 0 ? (
        <p className="m-0 mt-3 rounded-box border border-line bg-paper px-3 py-3 text-sm text-ink-2">Rien n’attend pour l’instant.</p>
      ) : (
        <ul className="m-0 mt-3 list-none divide-y divide-line overflow-hidden rounded-box border border-line bg-paper p-0">
          {pending.map((i) => {
            const n = counts[i.key]
            return (
              <li key={i.key}>
                <Link
                  href={tabHref('contenu', period, i.hash)}
                  className="flex min-h-12 items-center justify-between gap-3 px-3 py-2.5 text-ink no-underline hover:bg-cream"
                >
                  <span className="min-w-0">{i.label}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="rounded-pill bg-orange px-2 text-xs font-semibold tabular-nums leading-5 text-ink">
                      {n === null ? 'illisible' : n}
                    </span>
                    <IconChevron className="size-4 text-ink-2" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
