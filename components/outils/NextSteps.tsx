import Link from 'next/link'
import { IconChevron } from '@/components/icons'

// @cdc 04-pages — « suite logique » sous le résultat d'un outil (audit design-cro §3 Outils) :
// une ou deux pages à ouvrir ensuite, choisies selon le résultat, en lignes compactes.
export interface NextStep {
  href: string
  label: string
  /** Précision courte sous le lien */
  sub?: string
}

export function NextSteps({ steps, title = 'Et ensuite' }: { steps: NextStep[]; title?: string }) {
  if (steps.length === 0) return null
  return (
    <nav aria-label={title} className="flex flex-col gap-1">
      <h3 className="m-0 text-sm font-semibold text-ink-2">{title}</h3>
      <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line p-0">
        {steps.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="group flex min-h-12 items-center gap-2 py-2 text-ink no-underline">
              <span className="flex min-w-0 grow flex-col">
                <span className="font-semibold text-orange-ink group-hover:underline">{s.label}</span>
                {s.sub ? <span className="text-sm text-ink-2">{s.sub}</span> : null}
              </span>
              <IconChevron className="size-4 text-orange-ink" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
