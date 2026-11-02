// @cdc analytics — nombre de bilans « bien nourri » réalisés sur 4 fenêtres réelles
// (today / last_7d / last_30d / all_time), lus dans notre base : analytics.events,
// name = 'Tool Result' et props->>'tool' = 'bien-nourri' (envoyé par BienNourriEvaluator).
//
// Le sticky CTA pioche la fenêtre la plus flatteuse selon ses seuils (lib/sticky-cta-config.ts) ;
// chaque valeur est vraie pour sa fenêtre. « today » suit le jour civil de Paris.
// Sans DATABASE_URL ou en cas d'erreur : 0 partout, le compteur reste caché.

import { NextResponse } from 'next/server'
import { getPool } from '@/lib/server/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export interface BienNourriCountResponse {
  today: number
  last_7d: number
  last_30d: number
  all_time: number
}

const EMPTY: BienNourriCountResponse = { today: 0, last_7d: 0, last_30d: 0, all_time: 0 }

const SQL = `
  SELECT
    count(*) FILTER (WHERE ts >= date_trunc('day', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris')::int AS today,
    count(*) FILTER (WHERE ts >= now() - interval '7 days')::int AS last_7d,
    count(*) FILTER (WHERE ts >= now() - interval '30 days')::int AS last_30d,
    count(*)::int AS all_time
  FROM analytics.events
  WHERE name = 'Tool Result' AND props->>'tool' = 'bien-nourri'`

const headers = { 'Cache-Control': 'no-store' }

export async function GET() {
  const pool = getPool()
  if (!pool) return NextResponse.json(EMPTY, { headers })
  try {
    const res = await pool.query<BienNourriCountResponse>(SQL)
    return NextResponse.json(res.rows[0] ?? EMPTY, { headers })
  } catch (err) {
    console.warn('[bien-nourri-count] query failed', err instanceof Error ? err.message : err)
    return NextResponse.json(EMPTY, { headers })
  }
}
