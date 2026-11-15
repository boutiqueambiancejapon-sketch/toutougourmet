import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BF_PAGES, bfPath, getBfPage } from '@/data/black-friday'
import { BfBrandView } from '@/components/black-friday/BfBrandView'
import { frTypo } from '@/lib/utils'

// @cdc affiliation — route /black-friday-croquettes-chien/[marque] : une page par marque (data/black-friday.ts).

interface Props {
  params: Promise<{ marque: string }>
}

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return BF_PAGES.map((p) => ({ marque: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getBfPage((await params).marque)
  if (!page) return {}
  return {
    title: { absolute: frTypo(page.title) },
    description: frTypo(page.description),
    alternates: { canonical: `https://www.toutou-gourmet.com${bfPath(page.slug)}` },
  }
}

export default async function BlackFridayBrandPage({ params }: Props) {
  const page = getBfPage((await params).marque)
  if (!page) notFound()
  return <BfBrandView page={page} />
}
