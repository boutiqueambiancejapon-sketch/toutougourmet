import Link from 'next/link'
import { IconChevron } from '@/components/icons'
import { TOOLS, type ToolSlug } from './tool-list'

// @cdc 04-pages — « Autres outils » en bas des pages outils : lignes compactes avec icône
// dessinée et la question à laquelle l'outil répond (pas de grille de cartes).
export function OtherTools({ current }: { current: ToolSlug }) {
  const others = TOOLS.filter((t) => t.slug !== current)
  return (
    <section aria-labelledby="autres-outils" className="flex flex-col gap-2">
      <h2 id="autres-outils" className="m-0 font-display text-2xl font-black text-ink">
        Autres outils
      </h2>
      <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
        {others.map(({ slug, href, question, name, Icon }) => (
          <li key={slug}>
            <Link href={href} className="group flex min-h-14 items-center gap-3 py-3 text-ink no-underline">
              <Icon className="size-8" />
              <span className="flex min-w-0 grow flex-col">
                <span className="font-semibold leading-snug group-hover:underline">{question}</span>
                <span className="text-sm text-ink-2">{name}</span>
              </span>
              <IconChevron className="size-4 text-ink-2" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
