// @cdc lot 6 — classement des friandises et snacks pour chien notés sur 100 (barème friandise,
// jamais mélangé aux croquettes). Adresse propre et indexable (décision du 2026-11-03 : la
// requête « meilleures friandises chien » n'a pas de classement fondé sur la composition dans
// les premiers résultats). Mêmes règles que /croquettes : noindex sous RANKING_MIN_REVIEWED
// fiches et sur les pages filtrées. Segment statique : prioritaire sur /croquettes/[slug].
import type { Metadata } from 'next'
import { RankingView, type RankingSearchParams } from '@/components/scanner/RankingView'
import { rankingMetadata } from '@/components/scanner/ranking-meta'

type SearchParams = Promise<RankingSearchParams>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return rankingMetadata('treat', await searchParams)
}

export default async function TreatsRankingPage({ searchParams }: { searchParams: SearchParams }) {
  return <RankingView kind="treat" sp={await searchParams} />
}
