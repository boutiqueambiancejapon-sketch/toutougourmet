import type { Metadata } from 'next'
import { SITE_URL } from '@/components/scanner/ranking-copy'
import type { RankSegment } from '@/lib/scanner/rankings'
import { segmentIndexable, segmentRecipes } from '@/lib/server/rankings'

// @cdc cluster scanner — métadonnées d'une page de classement : noindex sous le seuil de recettes et de marques.
export async function segmentMetadata(segment: RankSegment): Promise<Metadata> {
  const url = `${SITE_URL}${segment.path}`
  const open = segmentIndexable(segment, await segmentRecipes(segment))
  return {
    title: { absolute: segment.title },
    description: segment.description,
    alternates: { canonical: url },
    openGraph: { title: segment.title, description: segment.description, url, type: 'website' },
    robots: open ? undefined : { index: false, follow: true },
  }
}
