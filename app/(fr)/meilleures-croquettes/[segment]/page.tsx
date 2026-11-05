import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SegmentPage } from '@/components/scanner/rankings/SegmentPage'
import { PAGE_SEGMENTS } from '@/lib/scanner/rankings'
import { segmentMetadata } from '../segment-meta'

export const revalidate = 3600
type Params = { params: Promise<{ segment: string }> }

const find = (slug: string) => PAGE_SEGMENTS.find((s) => s.slug === slug)

export function generateStaticParams() {
  return PAGE_SEGMENTS.map((s) => ({ segment: s.slug }))
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
