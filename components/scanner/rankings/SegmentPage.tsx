import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { ToolCta } from '@/components/article/ToolCta'
import { capByBrand, displayBrand, displayName, SEGMENTS, type RankSegment } from '@/lib/scanner/rankings'
import { segmentRecipes } from '@/lib/server/rankings'
import { titleTypo } from '@/lib/title-typo'
import { RankingJsonLd } from '../RankingJsonLd'
import { RankRow } from './RankRow'
import { RankingLead } from './RankingLead'

// @cdc cluster scanner — page de classement : réponse d'abord, 20 recettes, appel au scanner, autres
// classements, méthode. Tout en rendu serveur, pour Google et les moteurs IA.

const SHOWN = 20

export async function SegmentPage({ segment }: { segment: RankSegment }) {
  const list = await segmentRecipes(segment)
  const shown = capByBrand(list, 3).slice(0, SHOWN)
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-6 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <RankingJsonLd name={segment.h1} path={segment.path} items={shown.map((r) => ({ slug: r.slug, brand: displayBrand(r.brand), product: displayName(r.name) }))} start={1} total={shown.length} />
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Scanner', href: '/scanner' }, { label: segment.label === 'Toutes' ? 'Classement des croquettes' : segment.label }]} />
      <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">{titleTypo(segment.h1)}</h1>
      <RankingLead segment={segment} list={list} />
      <nav aria-label="Autres classements" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="m-0 flex list-none gap-1.5 p-0 text-sm">
          {SEGMENTS.map((s) => (
            <li key={s.slug} className="shrink-0">
              <Link href={s.path} aria-current={s.slug === segment.slug ? 'page' : undefined} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border border-line bg-paper px-3 font-semibold text-ink no-underline aria-[current=page]:bg-ink aria-[current=page]:text-cream">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section aria-labelledby="classement" className="flex flex-col gap-3">
        <h2 id="classement" className="m-0 font-display text-2xl font-black text-ink">{titleTypo(segment.listTitle)}</h2>
        <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
          {shown.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
        </ol>
        <p className="m-0 text-sm text-ink-2">{"Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. Le rang ne dépend que de l'étiquette."}</p>
      </section>
      <ToolCta tool="scanner" />
      <section aria-labelledby="methode" className="flex flex-col gap-2">
        <h2 id="methode" className="m-0 font-display text-2xl font-black text-ink">{titleTypo('Comment ce classement est-il calculé ?')}</h2>
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          {"On lit la composition et l'analyse affichées sur les pages produit, et le barème du scanner donne une note sur 100. Une recette vendue en plusieurs tailles compte une fois, avec sa note la plus basse, et chaque marque montre ses 3 meilleures recettes. Le classement couvre les produits lus à ce jour, pas tout le marché, et les aliments vétérinaires n'y figurent pas."}{' '}
          <Link href="/scanner#methode" className="font-semibold text-orange-ink underline underline-offset-2">Voir le barème</Link>.
        </p>
      </section>
    </div>
  )
}
