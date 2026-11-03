import Link from 'next/link'
import { IconChevron } from '@/components/icons'
import type { PeriodKey } from '@/lib/dashboard/period'
import { tabHref } from '@/lib/dashboard/tabs'
import type { StatusLine } from '@/lib/server/dashboard-home'

// @cdc tableau de bord — « Tout va bien ? » : une ligne verte, ou une ligne rouge par problème
// qui mène à l'onglet du détail. La pastille double le texte, elle ne porte pas le sens seule.

const dot = 'size-2.5 shrink-0 rounded-pill'

export function StatusLines({ lines, period }: { lines: StatusLine[]; period: PeriodKey }) {
  return (
    <section aria-labelledby="etat" className="mt-4">
      <h2 id="etat" className="sr-only">
        Tout va bien ?
      </h2>
      {lines.length === 0 ? (
        <p className="m-0 flex items-center gap-2.5 rounded-box bg-green-bg px-3 py-2.5 text-sm font-semibold text-green-ink">
          <span aria-hidden="true" className={`${dot} bg-green-ink`} />
          Tout fonctionne : site, tâche de nuit, sauvegarde, serveur.
        </p>
      ) : (
        <ul role="alert" className="m-0 flex list-none flex-col gap-2 p-0">
          {lines.map((l) => (
            <li key={l.text}>
              <Link
                href={tabHref(l.tab, period)}
                className="flex items-center gap-2.5 rounded-box bg-rose-bg px-3 py-2.5 text-sm font-semibold text-rose-ink no-underline"
              >
                <span aria-hidden="true" className={`${dot} bg-rose-ink`} />
                <span className="min-w-0 flex-1">
                  {l.text} <span className="whitespace-nowrap underline underline-offset-2">Voir le détail</span>
                </span>
                <IconChevron className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
