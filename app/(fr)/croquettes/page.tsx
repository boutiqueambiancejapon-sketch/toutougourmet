// @cdc lot 6 — classement des croquettes notées sur 100 : seulement les fiches RELUES (reviewed),
// triées par note. Filtres marque et tranche de note en paramètres d'URL, rendus côté serveur.
// noindex tant qu'il y a moins de RANKING_MIN_REVIEWED fiches relues ; pages filtrées en noindex
// (canonique vers le classement complet). Listé par /croquettes/sitemap.xml quand indexable.
import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { RankingFilters } from '@/components/scanner/RankingFilters'
import { RankingList } from '@/components/scanner/RankingList'
import { Pagination } from '@/components/scanner/Pagination'
import { BRAND_MIN_REVIEWED, inBand, parseBand, parsePage, RANKING_MIN_REVIEWED, RANKING_PAGE_SIZE } from '@/lib/scanner/seo'
import { groupByBrand, reviewedItemsSafe } from '@/lib/server/scanner-catalog'

type SearchParams = Promise<{ marque?: string | string[]; note?: string | string[]; page?: string | string[] }>

const URL = 'https://www.toutou-gourmet.com/croquettes'
const TITLE = 'Croquettes pour chien notées sur 100'
const DESCRIPTION =
  'Classement des croquettes pour chien relues par la rédaction et notées sur 100 : protéines, glucides, viande nommée et additifs, selon un barème publié.'

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams
  const items = await reviewedItemsSafe()
  const page = parsePage(sp.page)
  const filtered = first(sp.marque) !== '' || parseBand(sp.note) !== null
  const indexable = items.length >= RANKING_MIN_REVIEWED && !filtered
  const canonical = page > 1 && !filtered ? `${URL}?page=${page}` : URL
  return {
    title: { absolute: page > 1 && !filtered ? `${TITLE}, page ${page}` : `${TITLE} | Toutou Gourmet` },
    description: DESCRIPTION,
    alternates: { canonical },
    openGraph: { title: TITLE, description: DESCRIPTION, url: canonical, type: 'website' },
    robots: indexable ? undefined : { index: false, follow: true },
  }
}

export default async function CroquettesRankingPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const all = await reviewedItemsSafe()
  const brands = groupByBrand(all)
  const brand = first(sp.marque)
  const band = parseBand(sp.note)
  const list = all.filter((it) => (brand === '' || it.brandSlug === brand) && inBand(it.score, band))
  const pages = Math.max(1, Math.ceil(list.length / RANKING_PAGE_SIZE))
  const page = Math.min(parsePage(sp.page), pages)
  const offset = (page - 1) * RANKING_PAGE_SIZE
  const enough = all.length >= RANKING_MIN_REVIEWED

  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-8 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <div className="flex flex-col gap-4">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Scanner', href: '/scanner' }, { label: 'Croquettes notées' }]} />
        <header className="flex flex-col gap-2">
          <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">{TITLE}</h1>
          <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
            {enough
              ? `${all.length} croquettes pour chien relues par la rédaction et notées sur 100 avec le barème du scanner : protéines et glucides sur matière sèche, premier ingrédient, part de viande déclarée, additifs.`
              : 'Le classement se remplit au fil des fiches relues par la rédaction. Chaque note vient du barème publié du scanner, appliqué à l\'étiquette vérifiée.'}
          </p>
        </header>
      </div>

      {!enough ? (
        <section aria-labelledby="bientot" className="flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-5">
          <h2 id="bientot" className="m-0 font-display text-xl font-black text-ink">
            Pourquoi le classement est-il encore court ?
          </h2>
          <p className="m-0 text-[15px] leading-relaxed text-ink-2">
            {`${all.length === 0 ? 'Aucune fiche n\'est' : `${all.length} fiche${all.length > 1 ? 's sont' : ' est'}`} relue${all.length > 1 ? 's' : ''} pour l'instant. Une lecture automatique d'étiquette peut contenir une erreur : on ne classe un produit qu'après vérification, et le classement s'ouvre à partir de ${RANKING_MIN_REVIEWED} fiches.`}
          </p>
          <p className="m-0">
            <Link href="/scanner" className="font-semibold text-orange-ink underline underline-offset-2">
              Scanner un sac de croquettes
            </Link>
          </p>
        </section>
      ) : null}

      {all.length > 0 ? (
        <section aria-labelledby="classement" className="flex flex-col gap-4">
          <h2 id="classement" className="m-0 font-display text-2xl font-black text-ink">
            Quelles croquettes ont la meilleure composition ?
          </h2>
          <RankingFilters brands={brands.map((b) => ({ slug: b.slug, name: b.name }))} brand={brand} band={band} />
          {list.length > 0 ? (
            <RankingList items={list.slice(offset, offset + RANKING_PAGE_SIZE)} start={offset + 1} />
          ) : (
            <p className="m-0 text-[15px] text-ink-2">Aucune fiche relue ne correspond à ces filtres.</p>
          )}
          <Pagination page={page} pages={pages} params={{ marque: brand, note: band ?? '' }} base="/croquettes" />
        </section>
      ) : null}

      {brands.some((b) => b.items.length >= BRAND_MIN_REVIEWED) ? (
        <section aria-labelledby="marques" className="flex flex-col gap-3">
          <h2 id="marques" className="m-0 font-display text-2xl font-black text-ink">
            Quelle note pour chaque marque de croquettes ?
          </h2>
          <ul role="list" className="m-0 flex list-none flex-wrap gap-2 p-0">
            {brands
              .filter((b) => b.items.length >= BRAND_MIN_REVIEWED)
              .map((b) => (
                <li key={b.slug}>
                  <Link href={`/croquettes/marque/${b.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line bg-paper px-4 text-[15px] font-semibold text-ink no-underline hover:border-ink">
                    {b.name}
                    <span className="font-normal text-ink-2">{`${b.average}/100 en moyenne`}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="methode-classement" className="flex flex-col gap-2">
        <h2 id="methode-classement" className="m-0 font-display text-2xl font-black text-ink">
          Comment les croquettes sont-elles notées ?
        </h2>
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          Une IA ou la base ouverte Open Pet Food Facts fournit l&apos;étiquette, la rédaction la vérifie, puis le barème calcule la
          note sur 11 critères. Le même barème s&apos;applique à toutes les marques, partenaires compris. Il est détaillé, sources
          comprises, sur la{' '}
          <Link href="/scanner#methode" className="font-semibold text-orange-ink underline underline-offset-2">
            page du scanner de croquettes
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
