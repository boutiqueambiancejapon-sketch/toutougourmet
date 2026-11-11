import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SegmentPage } from '@/components/scanner/rankings/SegmentPage'
import { WET_SEGMENTS } from '@/lib/scanner/rankings'
import { segmentMetadata } from '../../meilleures-croquettes/segment-meta'

// @cdc cluster scanner — sous-classements des pâtées (accord du propriétaire du 2026-11-11, questions longues de la Search Console) : senior, chiot, petit chien.

export const revalidate = 3600
type Params = { params: Promise<{ segment: string }> }

const find = (slug: string) => WET_SEGMENTS.find((s) => s.path === `/meilleures-patees/${slug}`)

export function generateStaticParams() {
  return WET_SEGMENTS.map((s) => ({ segment: s.path.split('/').pop() ?? '' }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const segment = find((await params).segment)
  return segment ? segmentMetadata(segment) : { robots: { index: false, follow: false } }
}

export default async function Page({ params }: Params) {
  const segment = find((await params).segment)
  if (!segment) notFound()
  return <SegmentPage segment={segment} />
}
