import type { Pool } from 'pg'
import { SITE } from '../config'
import type { Filters } from '../filters'
import { daysOf, type Range, type Ranges } from './range'
import { filterSql, num, Params } from './sql'

// @cdc tableau de bord SEO — chiffres du site lui-même (balise JS, analytics.events, propriétaire exclu) : visiteurs
// (empreintes du jour additionnées), pages vues, clics partenaires, clients et revenus estimés, comptes créés.
// Les robots n'envoient pas la balise : ces chiffres-là sont des personnes.

export interface SiteDay {
  day: string
  visitors: number
  views: number
  clicks: number
  clients: number
  revenue: number
  accounts: number
}

export interface SiteTotals {
  visitors: number
  views: number
  clicks: number
  clients: number
  revenue: number
  accounts: number
}

const ZERO: SiteTotals = { visitors: 0, views: 0, clicks: 0, clients: 0, revenue: 0, accounts: 0 }

/** Clients et euros estimés d'un clic vers une marque (valeur et taux du site, 0 si inconnus). */
export function clickValue(brand: string): { clients: number; revenue: number } {
  const rate = SITE.clientRate[brand] ?? 0
  return { clients: rate, revenue: rate * (SITE.clientValue[brand] ?? 0) }
}

export async function siteDaily(pool: Pool, f: Filters, r: Range): Promise<SiteDay[]> {
  const p = new Params()
  const where = filterSql(f, p, { pageCol: 'page', deviceCol: 'device', deviceKind: 'hits' })
  const { rows } = await pool.query(
    `SELECT (ts AT TIME ZONE 'Europe/Paris')::date::text AS day, name, coalesce(props->>'brand', '') AS brand,
            count(*)::int AS n, count(DISTINCT visitor)::int AS v
       FROM analytics.events
      WHERE name IN ('Pageview', 'Affiliate Click', 'Account Created')
        AND ts >= (${p.add(r.start)}::date AT TIME ZONE 'Europe/Paris') AND ts < ((${p.add(r.end)}::date + 1) AT TIME ZONE 'Europe/Paris')${where}
      GROUP BY 1, 2, 3`,
    p.values,
  )
  const by = new Map<string, SiteDay>(daysOf(r).map((day) => [day, { day, ...ZERO }]))
  for (const x of rows as { day: string; name: string; brand: string; n: number; v: number }[]) {
    const d = by.get(x.day)
    if (!d) continue
    if (x.name === 'Pageview') {
      d.views += num(x.n)
      d.visitors += num(x.v)
    } else if (x.name === 'Account Created') d.accounts += num(x.n)
    else {
      const v = clickValue(x.brand)
      d.clicks += num(x.n)
      d.clients += v.clients * num(x.n)
      d.revenue += v.revenue * num(x.n)
    }
  }
  return [...by.values()]
}

export function sumDays(days: SiteDay[]): SiteTotals {
  return days.reduce((a, d) => ({
    visitors: a.visitors + d.visitors,
    views: a.views + d.views,
    clicks: a.clicks + d.clicks,
    clients: a.clients + d.clients,
    revenue: a.revenue + d.revenue,
    accounts: a.accounts + d.accounts,
  }), ZERO)
}

export interface SiteKpis {
  ranges: Ranges
  daily: SiteDay[]
  prevDaily: SiteDay[]
  cur: SiteTotals
  prev: SiteTotals | null
}

export async function siteKpis(pool: Pool, f: Filters, ranges: Ranges): Promise<SiteKpis> {
  const [daily, prevDaily] = await Promise.all([siteDaily(pool, f, ranges.cur), ranges.prev ? siteDaily(pool, f, ranges.prev) : Promise.resolve([])])
  return { ranges, daily, prevDaily, cur: sumDays(daily), prev: ranges.prev && !ranges.partial ? sumDays(prevDaily) : null }
}
