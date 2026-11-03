// @cdc lot 6 — page marque du classement : toutes les fiches RELUES d'une marque et leur note
// moyenne. noindex sous BRAND_MIN_REVIEWED fiches relues. Lien vers la fiche marque du site
// quand la marque est partenaire (data/brands.ts).
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { RankingList } from '@/components/scanner/RankingList'
import { ScoreBadge } from '@/components/scanner/ScoreBadge'
import { BAND_LABELS, bandFor } from '@/lib/scanner/score'
import { BRAND_MIN_REVIEWED, partnerBrand } from '@/lib/scanner/seo'
import { groupByBrand, reviewedItemsSafe } from '@/lib/server/scanner-catalog'

export const revalidate = 300

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams(): { slug: string }[] {
  return []
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
  return {
    title: { absolute: `Croquettes ${group.name} : avis et notes sur 100`.slice(0, 60) },
    description: `${n} croquette${n > 1 ? 's' : ''} ${group.name} relue${n > 1 ? 's' : ''} et notée${n > 1 ? 's' : ''} sur 100 : ${group.average}/100 en moyenne. Protéines, glucides, premier ingrédient et additifs, selon notre barème publié.`,
    alternates: { canonical: url },
    openGraph: { title: `Croquettes ${group.name} : ${group.average}/100 en moyenne`, url, type: 'website' },
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
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-8 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <div className="flex flex-col gap-4">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Croquettes notées', href: '/croquettes' }, { label: group.name }]} />
        <header className="flex flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">
            {`Croquettes ${group.name} : avis et notes sur 100`}
          </h1>
          <div className="flex items-center gap-4">
            <ScoreBadge score={group.average} size="lg" />
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              {`${n} recette${n > 1 ? 's' : ''} ${group.name} relue${n > 1 ? 's' : ''} par la rédaction, ${group.average}/100 en moyenne (${BAND_LABELS[bandFor(group.average)].toLowerCase()}). La meilleure : ${best.product ?? 'produit sans nom'}, ${best.score}/100.`}
            </p>
          </div>
        </header>
      </div>

      <section aria-labelledby="recettes" className="flex flex-col gap-3">
        <h2 id="recettes" className="m-0 font-display text-2xl font-black text-ink">
          {`Quelles croquettes ${group.name} ont la meilleure note ?`}
        </h2>
        <RankingList items={group.items} showBrand={false} />
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
        , identique pour toutes les marques. Une autre recette de la marque sous la main ?{' '}
        <Link href="/scanner" className="font-semibold text-orange-ink underline underline-offset-2">
          Scanne son code-barres
        </Link>
        .
      </p>
    </div>
  )
}
