import type { Metadata } from 'next'
import { SegmentPage } from '@/components/scanner/rankings/SegmentPage'
import { segmentBySlug, type RankSegment } from '@/lib/scanner/rankings'
import { segmentMetadata } from '../meilleures-croquettes/segment-meta'

export const revalidate = 3600
const segment = segmentBySlug('friandises') as RankSegment

export function generateMetadata(): Promise<Metadata> {
  return segmentMetadata(segment)
}

export default function Page() {
  return <SegmentPage segment={segment} />
}
