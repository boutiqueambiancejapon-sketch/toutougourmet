import type { Metadata } from 'next'
import type { ProductKind } from '@/lib/scanner/score'
import { parseBand, parsePage, RANKING_MIN_REVIEWED } from '@/lib/scanner/seo'
import { reviewedItemsSafe } from '@/lib/server/scanner-catalog'
import { RANKING_COPY, SITE_URL } from './ranking-copy'
import { firstParam, type RankingSearchParams } from './RankingView'

// @cdc 06-seo — métadonnées des classements. Indexable à partir de RANKING_MIN_REVIEWED fiches
// publiées du type. Pages filtrées (marque, note) : noindex, canonique vers le classement complet.
// Pages 2 et suivantes sans filtre : canonique sur elles-mêmes, title numéroté.

export async function rankingMetadata(kind: ProductKind, sp: RankingSearchParams): Promise<Metadata> {
  const copy = RANKING_COPY[kind]
  const items = await reviewedItemsSafe(kind)
  const page = parsePage(sp.page)
  const filtered = firstParam(sp.marque) !== '' || parseBand(sp.note) !== null
  const indexable = items.length >= RANKING_MIN_REVIEWED && !filtered
  const base = `${SITE_URL}${copy.path}`
  const canonical = page > 1 && !filtered ? `${base}?page=${page}` : base
  const title = page > 1 && !filtered ? copy.pagedTitle(page) : copy.title
  return {
    title: { absolute: title },
    description: copy.description,
    alternates: { canonical },
    openGraph: { title, description: copy.description, url: canonical, type: 'website' },
    robots: indexable ? undefined : { index: false, follow: true },
  }
}
