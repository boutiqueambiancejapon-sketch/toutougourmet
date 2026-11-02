import Link from 'next/link'
import { estimateReadTime, type Article } from '@/lib/mdx'
import { articleHref } from '@/components/article/ArticleTile'
import { IconChevron, VerdictIcon } from '@/components/icons'

// @cdc 04-pages — liste dense « question → verdict » des pages piliers (audit design-CRO, §3
// Page pilier) : une ligne par guide (titre, icône du verdict, temps de lecture), deux colonnes
// sur ordinateur. Remplace la grille de cartes identiques.
const VERDICT_LABEL = { oui: 'Oui', moderation: 'Avec modération', danger: 'Danger' } as const

export function GuideList({ articles }: { articles: Article[] }) {
  return (
    <ul role="list" className="v2 m-0 grid list-none grid-cols-1 gap-x-10 border-t border-line p-0 md:grid-cols-2">
      {articles.map((a) => {
        const { verdict, title } = a.frontmatter
        return (
          <li key={a.slug} className="border-b border-line">
            <Link href={articleHref(a)} className="group flex min-h-14 items-center gap-3 py-3 text-ink no-underline">
              {verdict ? (
                <VerdictIcon verdict={verdict} className="size-6 shrink-0" title={VERDICT_LABEL[verdict]} />
              ) : (
                <IconChevron className="size-5 shrink-0 text-ink-2" />
              )}
              <span className="grow font-semibold leading-snug group-hover:underline">{title}</span>
              <span className="shrink-0 text-sm whitespace-nowrap text-ink-2">{estimateReadTime(a.rawContent)} min</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
