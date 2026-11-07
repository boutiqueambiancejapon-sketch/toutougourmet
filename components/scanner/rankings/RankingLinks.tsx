import Link from 'next/link'
import { SEGMENTS } from '@/lib/scanner/rankings'
import { titleTypo } from '@/lib/title-typo'

// @cdc cluster scanner — accès aux classements depuis /scanner et /chien : toutes les listes, en boutons.

export function RankingLinks() {
  return (
    <section aria-labelledby="classements" className="flex flex-col gap-3">
      <h2 id="classements" className="m-0 font-display text-2xl font-black text-ink">{titleTypo('Les classements')}</h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">Les recettes les mieux notées, selon ton chien ou le produit que tu cherches.</p>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 text-sm">
        {SEGMENTS.filter((s) => !s.slug.startsWith('friandises-')).map((s) => (
          <li key={s.slug}>
            <Link href={s.path} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border border-line bg-paper px-3 font-semibold text-ink no-underline hover:underline">
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
