import { NextResponse, type NextRequest } from 'next/server'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { csvFileName, toCsv } from '@/lib/dashboard/csv'
import { parseFilters, type RawParams } from '@/lib/seo-dash/filters'
import { DATASETS } from '@/lib/seo-dash/server/datasets'
import { getPool } from '@/lib/server/db'

// @cdc tableau de bord SEO — export CSV d'un tableau, avec les filtres de l'écran (même requête). Diffusé par
// paquets de 500 lignes ; séparateur « ; » et BOM pour Excel en français. Accès revérifié, jamais en cache.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const NO_STORE = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' }

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await dashboardAllowed())) return new NextResponse(null, { status: 401, headers: NO_STORE })
  const { id } = await ctx.params
  const set = DATASETS[id]
  const pool = getPool()
  if (!set) return new NextResponse('Tableau inconnu', { status: 404, headers: NO_STORE })
  if (!pool) return new NextResponse('Base indisponible', { status: 503, headers: NO_STORE })
  const params: RawParams = Object.fromEntries(req.nextUrl.searchParams.entries())
  let rows
  try {
    // Décimales à la française (virgule) : le séparateur de colonnes est déjà le point-virgule.
    rows = (await set.rows(pool, parseFilters(params), params)).map((r) => r.map((v) => (typeof v === 'number' && !Number.isInteger(v) ? String(v).replace('.', ',') : v)))
  } catch (err) {
    console.error('[tableau-de-bord export]', id, err instanceof Error ? err.message : err)
    return new NextResponse('Lecture impossible', { status: 500, headers: NO_STORE })
  }
  const enc = new TextEncoder()
  let i = 0
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i === 0) controller.enqueue(enc.encode(toCsv(set.header, [])))
      const chunk = rows.slice(i, i + 500)
      i += 500
      if (chunk.length) controller.enqueue(enc.encode(toCsv([], chunk).replace(/^﻿\r\n/, '')))
      if (i >= rows.length) controller.close()
    },
  })
  return new NextResponse(stream, {
    headers: { ...NO_STORE, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${csvFileName(set.file)}"` },
  })
}
