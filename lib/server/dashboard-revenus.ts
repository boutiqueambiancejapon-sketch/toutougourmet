import type { Pool } from 'pg'
import { valeurClic } from '@/data/partner-values'
import type { Period } from '@/lib/dashboard/period'
import type { Row } from './dashboard-queries'

// @cdc tableau de bord — revenus estimés : clics partenaires × valeur d'un clic (data/partner-values.ts), par page,
// par emplacement et par marque, sur la période choisie.

export interface RevenusData {
  total: number
  clicsValorises: number
  clicsSansValeur: number
  parMarque: Row[]
  parPage: Row[]
  parPlace: Row[]
}

export const EMPTY_REVENUS: RevenusData = { total: 0, clicsValorises: 0, clicsSansValeur: 0, parMarque: [], parPage: [], parPlace: [] }

const somme = (map: Map<string, number>): Row[] =>
  [...map].map(([label, value]) => ({ label, value: Math.round(value * 10) / 10 })).filter((r) => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 10)

export async function getRevenus(pool: Pool, period: Period): Promise<RevenusData> {
  const { rows } = await pool.query<{ marque: string; page: string; place: string; n: number }>(
    `SELECT coalesce(props->>'brand', '') AS marque, page, coalesce(nullif(props->>'place', ''), '(non précisé)') AS place, count(*)::int AS n
       FROM analytics.events WHERE name = 'Affiliate Click' AND ts >= now() - $1::interval GROUP BY 1, 2, 3`,
    [period.interval],
  )
  const marque = new Map<string, number>()
  const page = new Map<string, number>()
  const place = new Map<string, number>()
  let total = 0
  let valorises = 0
  let sans = 0
  for (const r of rows) {
    const v = valeurClic(r.marque) * r.n
    if (v > 0) valorises += r.n
    else sans += r.n
    total += v
    marque.set(r.marque, (marque.get(r.marque) ?? 0) + v)
    page.set(r.page, (page.get(r.page) ?? 0) + v)
    place.set(r.place, (place.get(r.place) ?? 0) + v)
  }
  return { total: Math.round(total), clicsValorises: valorises, clicsSansValeur: sans, parMarque: somme(marque), parPage: somme(page), parPlace: somme(place) }
}
