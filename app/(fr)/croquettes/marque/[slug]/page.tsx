// @cdc lot 6 — page marque du classement : toutes les fiches PUBLIÉES d'aliments complets d'une
// marque et leur note moyenne. noindex sous BRAND_MIN_REVIEWED fiches. Lien vers la fiche marque
// du site quand la marque est partenaire (data/brands.ts). Title « Croquettes {marque} : avis et
// note de composition », raccourci pour les noms longs (≤ 60) ; description bornée à 155.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { RankingList } from '@/components/scanner/RankingList'
import { RankingJsonLd } from '@/components/scanner/RankingJsonLd'
import { ScoreBadge } from '@/components/scanner/ScoreBadge'
import { frenchDate, isoDay, latestDate } from '@/components/scanner/ranking-copy'
import { BAND_LABELS, bandFor } from '@/lib/scanner/score'
import { BRAND_MIN_REVIEWED, partnerBrand } from '@/lib/scanner/seo'
import { groupByBrand, reviewedItemsSafe } from '@/lib/server/scanner-catalog'
import { titleTypo } from '@/lib/title-typo'

export const revalidate = 300

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams(): { slug: string }[] {
  return []
}

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`

function brandTitle(name: string): string {
  const full = `Croquettes ${name} : avis et note de composition`
  if (full.length <= 60) return full
  const short = `Croquettes ${name} : avis et note`
  return short.length <= 60 ? short : `Croquettes ${name}`.slice(0, 60).trim()
}

function brandDescription(name: string, n: number, average: number): string {
  const head = `${plural(n, 'recette')} ${name} pour chien ${n > 1 ? 'notées' : 'notée'} sur 100, ${average}/100 en moyenne.`
  const full = `${head} Protéines, glucides, premier ingrédient et additifs, selon notre barème publié.`
  if (full.length <= 155) return full
  const mid = `${head} Protéines, glucides et additifs, selon notre barème publié.`
  return mid.length <= 155 ? mid : head.slice(0, 155)
}

async function load(slug: string) {
  return groupByBrand(await reviewedItemsSafe('complete')).find((b) => b.slug === slug) ?? null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const group = await load(slug)
  if (!group) return { title: 'Marque introuvable', robots: { index: false, follow: false } }
  const url = `https://www.toutou-gourmet.com/croquettes/marque/${group.slug}`
  const n = group.items.length
  const description = brandDescription(group.name, n, group.average)
  return {
    title: { absolute: brandTitle(group.name) },
    description,
    alternates: { canonical: url },
    openGraph: { title: `Croquettes ${group.name} : ${group.average}/100 en moyenne`, description, url, type: 'website' },
    robots: n >= BRAND_MIN_REVIEWED ? undefined : { index: false, follow: true },
  }
}

export default async function BrandRankingPage({ params }: Params) {
  const { slug } = await params
  const group = await load(slug)
  if (!group) notFound()
  const partner = partnerBrand(group.name)
  const best = group.items[0]
  const n = group.items.length
  const updated = latestDate(group.items.map((it) => it.updatedAt))
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-8 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Brand',
            name: group.name,
            url: `https://www.toutou-gourmet.com/croquettes/marque/${group.slug}`,
          }),
        }}
      />
      <RankingJsonLd name={`Croquettes ${group.name} classées par note`} path={`/croquettes/marque/${group.slug}`} items={group.items} total={n} />
      <div className="flex flex-col gap-4">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Classement des croquettes', href: '/croquettes' }, { label: group.name }]} />
        <header className="flex flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">
            {titleTypo(`Croquettes ${group.name} : avis et note de composition`)}
          </h1>
          <div className="flex items-center gap-4">
            <ScoreBadge score={group.average} size="lg" />
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              {`${plural(n, 'recette')} ${group.name} (croquettes ou pâtées) ${n > 1 ? 'ont' : 'a'} une fiche publiée, ${group.average}/100 en moyenne (${BAND_LABELS[bandFor(group.average)].toLowerCase()}). La mieux notée : ${best.product ?? 'produit sans nom'}, ${best.score}/100.`}
            </p>
          </div>
          <p className="m-0 text-[15px] leading-relaxed text-ink-2">
            {'Notre avis porte sur la composition écrite sur l\'étiquette, pas sur le goût ni sur la tolérance de ton chien. Mis à jour le '}
            <time dateTime={isoDay(updated)}>{frenchDate(updated)}</time>.
          </p>
        </header>
      </div>

      <section aria-labelledby="recettes" className="flex flex-col gap-3">
        <h2 id="recettes" className="m-0 font-display text-2xl font-black text-ink">
          {titleTypo(`Quelles croquettes ${group.name} ont la meilleure note ?`)}
        </h2>
        <RankingList showCategory items={group.items} showBrand={false} />
      </section>

      {partner ? (
        <p className="m-0 rounded-box border border-line bg-paper p-4 text-[15px] leading-relaxed text-ink-2">
          {`${partner.name} fait partie des marques testées par la rédaction : prix, livraison et avis des clients sont sur sa `}
          <Link href={`/chien/marque/${partner.slug}`} className="font-semibold text-orange-ink underline underline-offset-2">
            {`fiche ${partner.name}`}
          </Link>
          .
        </p>
      ) : null}

      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        Chaque note vient du barème publié sur la{' '}
        <Link href="/scanner#methode" className="font-semibold text-orange-ink underline underline-offset-2">
          page du scanner de croquettes
        </Link>
        , identique pour toutes les marques. Pour comparer avec les autres marques, voir le{' '}
        <Link href="/croquettes" className="font-semibold text-orange-ink underline underline-offset-2">
          classement des meilleures croquettes pour chien
        </Link>
        . Une autre recette de la marque sous la main ?{' '}
        <Link href="/scanner" className="font-semibold text-orange-ink underline underline-offset-2">
          Scanne son code-barres
        </Link>
        .
      </p>
    </div>
  )
}
