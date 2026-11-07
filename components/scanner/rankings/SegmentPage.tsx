import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { displayBrand, displayName, type RankSegment } from '@/lib/scanner/rankings'
import { MODEL_REVIEWS } from '@/data/model-reviews'
import { segmentRecipes } from '@/lib/server/rankings'
import { addYear, currentYear } from '@/lib/title-year'
import { titleTypo } from '@/lib/title-typo'
import { RankingJsonLd } from '../RankingJsonLd'
import { RANKING_CONTENT } from '@/data/ranking-content'
import { RankingArticle, RankingSources } from './RankingArticle'
import { RankingBody, shownRecipes } from './RankingBody'

// @cdc cluster scanner — page de classement : réponse d'abord, 20 recettes, appel au scanner, autres
// classements, méthode. Tout en rendu serveur, pour Google et les moteurs IA.

const SHOWN = 20

export async function SegmentPage({ segment }: { segment: RankSegment }) {
  const list = await segmentRecipes(segment)
  const shown = shownRecipes(list, SHOWN)
  const content = RANKING_CONTENT[segment.slug]
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-6 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <RankingJsonLd name={segment.h1} path={segment.path} items={shown.map((r) => ({ href: MODEL_REVIEWS[r.key], brand: displayBrand(r.brand), product: displayName(r.name) }))} start={1} total={shown.length} />
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Scanner', href: '/scanner' }, ...(segment.slug.startsWith('friandises-') ? [{ label: 'Friandises', href: '/meilleures-friandises' }] : []), { label: segment.label === 'Toutes' ? 'Classement des croquettes' : segment.label }]} />
      <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">{titleTypo(addYear(segment.h1, currentYear(), Infinity))}</h1>
      <RankingBody segment={segment} list={list} count={SHOWN} />
      {content ? <RankingArticle content={content} /> : null}
      <section aria-labelledby="methode" className="flex flex-col gap-2">
        <h2 id="methode" className="m-0 font-display text-2xl font-black text-ink">{titleTypo('Comment ce classement est-il calculé ?')}</h2>
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          {"On lit la composition et l'analyse affichées sur les pages produit, et le barème du scanner donne une note sur 100. Une recette vendue en plusieurs tailles compte une fois, avec sa note la plus basse, et chaque marque montre ses 3 meilleures recettes. Le classement couvre les produits lus à ce jour, pas tout le marché, et les aliments vétérinaires n'y figurent pas."}{' '}
          <Link href="/scanner#methode" className="font-semibold text-orange-ink underline underline-offset-2">Voir le barème</Link>.
        </p>
      </section>
      {content ? <RankingSources sources={content.sources} /> : null}
    </div>
  )
}
