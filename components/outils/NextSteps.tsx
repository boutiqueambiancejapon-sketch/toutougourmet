import Link from 'next/link'
import { IconChevron } from '@/components/icons'

// @cdc 04-pages — « suite logique » sous le résultat d'un outil (audit design-CRO, §3 Outils) :
// une ou deux pages à ouvrir ensuite, en liens simples. Pas de capture d'e-mail tant qu'il
// n'y a pas de service d'envoi.
export interface NextStep {
  href: string
  label: string
  /** Précision courte sous le lien */
  sub?: string
}

export function NextSteps({ steps, title = 'Et ensuite' }: { steps: NextStep[]; title?: string }) {
  if (steps.length === 0) return null
  return (
    <nav aria-label={title} className="v2 mt-5 flex flex-col gap-1 border-t border-line pt-4">
      <p className="m-0 text-sm font-semibold text-ink-2">{title}</p>
      <ul role="list" className="m-0 flex list-none flex-col p-0">
        {steps.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="group flex min-h-11 items-center gap-2 py-1.5 text-ink no-underline">
              <span className="flex grow flex-col">
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
