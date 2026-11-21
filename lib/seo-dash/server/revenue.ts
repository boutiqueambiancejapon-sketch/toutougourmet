import type { Pool } from 'pg'
import { SITE } from '../config'
import type { Filters } from '../filters'
import { tsIn } from './crawl'
import { clipStart, daysOf, logRanges, type Ranges } from './range'
import { clickValue } from './site'
import { filterSql, Params } from './sql'

// @cdc tableau de bord SEO — Revenus : par page, visites → clics partenaires → clients estimés → euros (valeur d'un
// client et taux du site, data/partner-values.ts ; partenaires sans valeur : « valeur inconnue »). Le total du mois
// prend les ventes réelles recopiées du centre de contrôle quand il y en a (analytics.revenue_sales).

export interface RevenuePage {
  page: string
  visits: number
  clicks: number
  clients: number
  revenue: number
  brands: { brand: string; n: number }[]
}

export interface RevenueData {
  ranges: Ranges
  days: string[]
  byBrandDay: { brand: string; values: number[] }[]
  brands: { brand: string; clicks: number; revenue: number | null }[]
  pages: RevenuePage[]
  clicks: number
  views: number
  sellingVisits: number
  clients: number
  revenue: number
  month: { label: string; amount: number; real: boolean; note: string }
}

const TOP_BRANDS = 3

export async function revenueData(pool: Pool, f: Filters): Promise<RevenueData> {
  const ranges = clipStart(logRanges(f))
  const days = daysOf(ranges.cur)
  const p = new Params()
  const where = filterSql(f, p, { pageCol: 'page', deviceCol: 'device', deviceKind: 'hits' })
  const span = tsIn(p, ranges.cur)
  const [clicks, views, real] = await Promise.all([
    pool.query<{ day: string; page: string; brand: string; n: number }>(
      `SELECT (ts AT TIME ZONE 'Europe/Paris')::date::text AS day, page, coalesce(props->>'brand', '?') AS brand, count(*)::int AS n
         FROM analytics.events WHERE name = 'Affiliate Click' AND ${span}${where} GROUP BY 1, 2, 3`,
      p.values,
    ),
    pool.query<{ page: string; n: number }>(`SELECT page, count(*)::int AS n FROM analytics.events WHERE name = 'Pageview' AND ${span}${where} GROUP BY 1`, p.values),
    pool.query<{ amount: number | null; sales: number | null }>(
      `SELECT sum(amount)::float AS amount, sum(sales)::int AS sales FROM analytics.revenue_sales
        WHERE project = $1 AND day >= date_trunc('month', now() AT TIME ZONE 'Europe/Paris')::date`,
      [SITE.controlProject],
    ),
  ])
  const idx = new Map(days.map((d, i) => [d, i]))
  const brandTot = new Map<string, number>()
  const byPage = new Map<string, RevenuePage>()
  const viewsBy = new Map(views.rows.map((r) => [r.page, r.n]))
  for (const r of clicks.rows) brandTot.set(r.brand, (brandTot.get(r.brand) ?? 0) + r.n)
  const top = [...brandTot].sort((a, b) => b[1] - a[1]).slice(0, TOP_BRANDS).map(([b]) => b)
  const series = new Map<string, number[]>([...top, 'autres'].map((b) => [b, days.map(() => 0)]))
  let clients = 0
  let revenue = 0
  for (const r of clicks.rows) {
    const i = idx.get(r.day)
    const s = series.get(top.includes(r.brand) ? r.brand : 'autres')
    if (s && i !== undefined) s[i] += r.n
    const v = clickValue(r.brand)
    clients += v.clients * r.n
    revenue += v.revenue * r.n
    const pg = byPage.get(r.page) ?? { page: r.page, visits: viewsBy.get(r.page) ?? 0, clicks: 0, clients: 0, revenue: 0, brands: [] }
    pg.clicks += r.n
    pg.clients += v.clients * r.n
    pg.revenue += v.revenue * r.n
    const b = pg.brands.find((x) => x.brand === r.brand)
    if (b) b.n += r.n
    else pg.brands.push({ brand: r.brand, n: r.n })
    byPage.set(r.page, pg)
  }
  const pages = [...byPage.values()].sort((a, b) => b.clicks - a.clicks || b.revenue - a.revenue)
  for (const pg of pages) pg.brands.sort((a, b) => b.n - a.n)
  const r0 = real.rows[0]
  const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'Europe/Paris' }).format(new Date())
  const monthEstimate = await monthEstimateOf(pool)
  return {
    ranges,
    days,
    byBrandDay: [...series].map(([brand, values]) => ({ brand, values })),
    brands: [...brandTot].sort((a, b) => b[1] - a[1]).map(([brand, n]) => ({ brand, clicks: n, revenue: SITE.clientValue[brand] ? clickValue(brand).revenue * n : null })),
    pages,
    clicks: [...brandTot.values()].reduce((a, b) => a + b, 0),
    views: views.rows.reduce((a, r) => a + r.n, 0),
    sellingVisits: pages.slice(0, 10).reduce((a, pg) => a + pg.visits, 0),
    clients,
    revenue,
    month: r0?.amount
      ? { label: monthLabel, amount: r0.amount, real: true, note: `ventes enregistrées (${r0.sales ?? 0}) dans le centre de contrôle` }
      : { label: monthLabel, amount: monthEstimate, real: false, note: 'estimation (aucune vente enregistrée ce mois-ci)' },
  }
}

async function monthEstimateOf(pool: Pool): Promise<number> {
  const { rows } = await pool.query<{ brand: string; n: number }>(
    `SELECT coalesce(props->>'brand', '?') AS brand, count(*)::int AS n FROM analytics.events
      WHERE name = 'Affiliate Click' AND ts >= date_trunc('month', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris' GROUP BY 1`,
  )
  return rows.reduce((a, r) => a + clickValue(r.brand).revenue * r.n, 0)
}
