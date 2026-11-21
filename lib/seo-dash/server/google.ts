import type { Pool } from 'pg'
import type { Filters } from '../filters'
import { EMPTY_TOTALS, deltas, gscAgg, gscDaily, gscTotals, type Agg, type DayPoint, type DeltaRow, type Totals } from './gsc-core'
import { cannibals, decays, lowCtr, striking, type Cannibal, type Decay, type LowCtr, type Striking } from './gsc-opps'
import { gscRanges, type Ranges } from './range'

// @cdc tableau de bord SEO — tout ce que montre l'écran Google, lu en une fois (les requêtes partent en parallèle).

export interface GoogleData {
  ranges: Ranges
  cur: Totals
  prev: Totals | null
  daily: DayPoint[]
  prevDaily: DayPoint[]
  queries: { up: DeltaRow[]; down: DeltaRow[]; tracked: number }
  pages: { up: DeltaRow[]; down: DeltaRow[] }
  striking: { rows: Striking[]; total: number }
  lowCtr: LowCtr[]
  cannibals: { rows: Cannibal[]; total: number }
  decays: Decay[]
}

export async function googleCore(pool: Pool, f: Filters): Promise<Pick<GoogleData, 'ranges' | 'cur' | 'prev' | 'daily' | 'prevDaily'>> {
  const ranges = await gscRanges(pool, f)
  const [cur, prev, daily, prevDaily] = await Promise.all([
    gscTotals(pool, f, ranges.cur),
    ranges.prev ? gscTotals(pool, f, ranges.prev) : Promise.resolve(null),
    gscDaily(pool, f, ranges.cur),
    ranges.prev ? gscDaily(pool, f, ranges.prev) : Promise.resolve([]),
  ])
  return { ranges, cur, prev, daily, prevDaily }
}

export async function googleData(pool: Pool, f: Filters): Promise<GoogleData> {
  const core = await googleCore(pool, f)
  const { ranges } = core
  // La comparaison des requêtes et des pages se fait toujours contre la période d'avant (ou l'an dernier).
  const prevRange = ranges.prev ?? { start: ranges.cur.start, end: ranges.cur.start }
  const [qCur, qPrev, pCur, pPrev] = await Promise.all([
    gscAgg(pool, f, ranges.cur, 'query'),
    ranges.prev ? gscAgg(pool, f, prevRange, 'query') : Promise.resolve([] as Agg[]),
    gscAgg(pool, f, ranges.cur, 'page'),
    ranges.prev ? gscAgg(pool, f, prevRange, 'page') : Promise.resolve([] as Agg[]),
  ])
  const [st, lc, can, dec] = await Promise.all([
    striking(pool, f, ranges.cur, qCur),
    lowCtr(pool, f, ranges.cur, pCur),
    cannibals(pool, f, ranges.cur),
    decays(pool, f, ranges.last),
  ])
  const q = deltas(qCur, qPrev)
  return {
    ...core,
    queries: { ...q, tracked: qCur.length },
    pages: deltas(pCur, pPrev),
    striking: st,
    lowCtr: lc,
    cannibals: can,
    decays: dec,
  }
}

export const EMPTY_GOOGLE: Omit<GoogleData, 'ranges'> = {
  cur: EMPTY_TOTALS,
  prev: null,
  daily: [],
  prevDaily: [],
  queries: { up: [], down: [], tracked: 0 },
  pages: { up: [], down: [] },
  striking: { rows: [], total: 0 },
  lowCtr: [],
  cannibals: { rows: [], total: 0 },
  decays: [],
}
