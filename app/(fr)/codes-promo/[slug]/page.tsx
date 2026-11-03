import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBrandBySlug } from '@/data/brands'
import { PROMO_PAGES, getPromoPage, promoPath } from '@/data/promo-codes'
import { PromoPageView } from '@/components/promo/PromoPageView'
import { frTypo } from '@/lib/utils'

// @cdc affiliation — route /codes-promo/[slug] : une page par partenaire (data/promo-codes.ts).

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return PROMO_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPromoPage((await params).slug)
  if (!page) return {}
  const url = `https://www.toutou-gourmet.com${promoPath(page.slug)}`
  return {
    title: { absolute: frTypo(page.title) },
    description: frTypo(page.description),
    alternates: { canonical: url },
  }
}

export default async function PromoCodePage({ params }: Props) {
  const page = getPromoPage((await params).slug)
  const brand = page ? getBrandBySlug(page.slug) : undefined
  if (!page || !brand) notFound()
  return <PromoPageView page={page} brand={brand} />
}
