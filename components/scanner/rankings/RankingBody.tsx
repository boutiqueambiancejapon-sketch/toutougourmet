import Link from 'next/link'
import { ToolCta } from '@/components/article/ToolCta'
import { capByBrand, SEGMENTS, type RankSegment } from '@/lib/scanner/rankings'
import type { RankedRecipe } from '@/lib/server/rankings'
import { titleTypo } from '@/lib/title-typo'
import { RankingLead } from './RankingLead'
import { RankRow } from './RankRow'

// @cdc cluster scanner — le classement lui-même, identique sur une page /meilleures-… et en tête d'article
// (demande du propriétaire du 2026-11-05) : réponse, boutons des autres classements, liste, appel au scanner.

const TYPES = new Set(['tous', 'patees', 'friandises'])

/** Croquettes : leurs filtres puis les types. Pâtées : les types. Friandises : les types puis leurs sous-classements. */
function navSegments(segment: RankSegment): { s: RankSegment; label: string }[] {
  const types = SEGMENTS.filter((s) => TYPES.has(s.slug)).map((s) => ({ s, label: s.slug === 'tous' ? 'Croquettes' : s.label }))
  if (segment.slug.startsWith('friandises')) return [...types, ...SEGMENTS.filter((s) => s.slug.startsWith('friandises-')).map((s) => ({ s, label: s.label }))]
  if (segment.slug === 'patees') return types
  return SEGMENTS.filter((s) => !s.slug.startsWith('friandises-')).map((s) => ({ s, label: s.label }))
}

export const shownRecipes = (list: RankedRecipe[], count: number) => capByBrand(list, 3).slice(0, count)

export function RankingBody({ segment, list, count, note }: { segment: RankSegment; list: RankedRecipe[]; count: number; note?: string }) {
  const shown = shownRecipes(list, count)
  return (
    <>
      <RankingLead segment={segment} list={list} />
      <nav aria-label="Autres classements" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="m-0 flex list-none gap-1.5 p-0 text-sm">
          {navSegments(segment).map(({ s, label }) => (
            <li key={s.slug} className="shrink-0">
              <Link href={s.path} aria-current={s.slug === segment.slug ? 'page' : undefined} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border border-line bg-paper px-3 font-semibold text-ink no-underline aria-[current=page]:bg-ink aria-[current=page]:text-cream">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section aria-label={segment.listTitle} className="flex flex-col gap-3">
        <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo(segment.listTitle)}</h2>
        <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
          {shown.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
        </ol>
        <p className="m-0 text-sm leading-relaxed text-ink-2">{`${note ? `${note} ` : ''}Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. Le rang ne dépend que de l'étiquette.`}</p>
      </section>
      <ToolCta tool="scanner" />
    </>
  )
}
