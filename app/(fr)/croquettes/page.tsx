// @cdc lot 6 — classement des croquettes et pâtées notées sur 100 (aliments complets) : seulement
// les fiches publiées, triées par note. noindex tant qu'il y a moins de RANKING_MIN_REVIEWED
// fiches ; pages filtrées en noindex (canonique vers le classement complet). Listé par
// /sitemaps/croquettes.xml quand indexable. Les friandises ont leur classement indexable à part,
// /croquettes/friandises ; l'ancien onglet ?type=friandises y redirige (301).
import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { RankingView, type RankingSearchParams } from '@/components/scanner/RankingView'
import { rankingMetadata } from '@/components/scanner/ranking-meta'

type SearchParams = Promise<RankingSearchParams & { type?: string | string[] }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return rankingMetadata('complete', await searchParams)
}

export default async function CroquettesRankingPage({ searchParams }: { searchParams: SearchParams }) {
  const { type, ...sp } = await searchParams
  if ((Array.isArray(type) ? type[0] : type) === 'friandises') {
    const q = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' && v !== '' ? [[k, v]] : [])))
    const s = q.toString()
    permanentRedirect(s ? `/croquettes/friandises?${s}` : '/croquettes/friandises')
  }
  return <RankingView kind="complete" sp={sp} />
}
