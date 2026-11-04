import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import type { ProductKind } from '@/lib/scanner/score'
import { inBand, parseBand, parsePage, RANKING_MIN_REVIEWED, RANKING_PAGE_SIZE } from '@/lib/scanner/seo'
import { groupByBrand, reviewedItemsSafe } from '@/lib/server/scanner-catalog'
import { Pagination } from './Pagination'
import { RankingBrands, RankingMissing, TreatQuantity } from './RankingExtras'
import { RankingFilters } from './RankingFilters'
import { RankingHeader } from './RankingHeader'
import { RankingJsonLd } from './RankingJsonLd'
import { RankingList } from './RankingList'
import { RankingMethod, RankingTabs } from './RankingTabs'
import { latestDate, RANKING_COPY } from './ranking-copy'
import { titleTypo } from '@/lib/title-typo'

// @cdc lot 6 — corps commun des deux classements (/croquettes et /croquettes/friandises) :
// seulement les fiches publiées du type demandé, triées par note. Filtres marque et tranche de
// note en paramètres d'URL, rendus côté serveur. ItemList JSON-LD = la page de liste affichée.

export type RankingSearchParams = { marque?: string | string[]; note?: string | string[]; page?: string | string[] }

export const firstParam = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export async function RankingView({ kind, sp }: { kind: ProductKind; sp: RankingSearchParams }) {
  const copy = RANKING_COPY[kind]
  const treat = kind === 'treat'
  const every = await reviewedItemsSafe()
  const all = every.filter((it) => it.kind === kind)
  const counts: Record<ProductKind, number> = { complete: every.filter((it) => it.kind === 'complete').length, treat: every.filter((it) => it.kind === 'treat').length }
  const brands = groupByBrand(all)
  const brand = firstParam(sp.marque)
  const band = parseBand(sp.note)
  const list = all.filter((it) => (brand === '' || it.brandSlug === brand) && inBand(it.score, band))
  const pages = Math.max(1, Math.ceil(list.length / RANKING_PAGE_SIZE))
  const page = Math.min(parsePage(sp.page), pages)
  const offset = (page - 1) * RANKING_PAGE_SIZE
  const shown = list.slice(offset, offset + RANKING_PAGE_SIZE)
  const enough = all.length >= RANKING_MIN_REVIEWED

  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-8 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <RankingJsonLd name={copy.h1} path={copy.path} items={shown} start={offset + 1} total={list.length} />
      <div className="flex flex-col gap-4">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Scanner', href: '/scanner' }, { label: copy.crumb }]} />
        <RankingHeader kind={kind} count={all.length} enough={enough} updated={all.length > 0 ? latestDate(all.map((it) => it.updatedAt)) : null} />
      </div>
      <RankingTabs current={kind} counts={counts} />

      {!enough ? (
        <section aria-labelledby="bientot" className="flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-5">
          <h2 id="bientot" className="m-0 font-display text-xl font-black text-ink">
            {titleTypo('Pourquoi le classement est-il encore court ?')}
          </h2>
          <p className="m-0 text-[15px] leading-relaxed text-ink-2">
            {`${all.length === 0 ? "Aucune fiche n'est" : `${all.length} fiche${all.length > 1 ? 's sont' : ' est'}`} publiée${all.length > 1 ? 's' : ''} pour l'instant. Une lecture automatique d'étiquette peut contenir une erreur : on ne classe un produit qu'une fois sa fiche publiée, et le classement s'ouvre à partir de ${RANKING_MIN_REVIEWED} fiches.`}
          </p>
          <p className="m-0">
            <Link href="/scanner" className="font-semibold text-orange-ink underline underline-offset-2">
              {copy.scanLabel}
            </Link>
          </p>
        </section>
      ) : null}

      {all.length > 0 ? (
        <section aria-labelledby="classement" className="flex flex-col gap-4">
          <h2 id="classement" className="m-0 font-display text-2xl font-black text-ink">
            {titleTypo(copy.listTitle)}
          </h2>
          <RankingFilters brands={brands.map((b) => ({ slug: b.slug, name: b.name }))} brand={brand} band={band} base={copy.path} />
          {list.length > 0 ? <RankingList items={shown} start={offset + 1} /> : <p className="m-0 text-[15px] text-ink-2">Aucune fiche publiée ne correspond à ces filtres.</p>}
          <Pagination page={page} pages={pages} params={{ marque: brand, note: band ?? '' }} base={copy.path} />
        </section>
      ) : null}

      {treat ? null : <RankingBrands brands={brands} />}
      <RankingMethod treat={treat} />
      {treat ? <TreatQuantity /> : null}
      {enough ? <RankingMissing kind={kind} /> : null}
    </div>
  )
}
