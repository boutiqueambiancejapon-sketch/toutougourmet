// @cdc tableau de bord SEO — relevé Search Console par jour et par appareil : site, pages, requête × page.
// Chaque nuit, les 10 derniers jours sont réécrits (Google complète avec retard). Rattrapage : --depuis=2026-03-05.
// Les ancres (#section) sont additionnées à leur page avant l'écriture.
//   tsx scripts/seo/collect-gsc.ts [--depuis=AAAA-MM-JJ] [--jours=10]
import pg from 'pg'
import { cleanPath, SITE } from '../../lib/seo-dash/config'
import { analyseGsc, type LigneGsc } from '../../lib/server/search-console'

const arg = (name: string): string | undefined => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
const iso = (d: Date) => d.toISOString().slice(0, 10)
const DAY = 86_400_000

interface Acc {
  key: string[]
  c: number
  i: number
  pi: number
}

async function all(day: string, dims: ('query' | 'page' | 'device')[]): Promise<LigneGsc[]> {
  const out: LigneGsc[] = []
  for (let start = 0; ; start += 25_000) {
    const rows = await analyseGsc(SITE.gscSite, day, day, dims, 25_000, start)
    out.push(...rows)
    if (rows.length < 25_000) return out
  }
}

/** Additionne les lignes qui tombent sur la même clé une fois l'adresse nettoyée. */
function merge(rows: LigneGsc[], pageIndex: number | null): Acc[] {
  const m = new Map<string, Acc>()
  for (const r of rows) {
    const key = r.keys.map((k, j) => (j === pageIndex ? cleanPath(k) : k))
    const id = key.join('\u0001')
    const a = m.get(id) ?? { key, c: 0, i: 0, pi: 0 }
    a.c += r.clicks
    a.i += r.impressions
    a.pi += r.position * r.impressions
    m.set(id, a)
  }
  return [...m.values()]
}

async function write(pool: pg.Pool, table: string, cols: string[], day: string, rows: Acc[]): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`DELETE FROM analytics.${table} WHERE day = $1`, [day])
    const all = [...cols, 'clicks', 'impressions', 'position']
    for (let i = 0; i < rows.length; i += 500) {
      const lot = rows.slice(i, i + 500)
      const values = lot.flatMap((r) => [day, ...r.key, r.c, r.i, r.i ? r.pi / r.i : 0])
      const width = all.length + 1
      const places = lot.map((_, j) => `(${Array.from({ length: width }, (_, k) => `$${j * width + k + 1}`).join(',')})`).join(',')
      await client.query(`INSERT INTO analytics.${table} (day, ${all.join(',')}) VALUES ${places}`, values)
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function main(): Promise<void> {
  const end = new Date(Date.now() - DAY)
  const since = arg('depuis')
  const start = since ? new Date(`${since}T00:00:00Z`) : new Date(end.getTime() - (Number(arg('jours') ?? 10) - 1) * DAY)
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
  let days = 0
  let qp = 0
  for (let t = start.getTime(); t <= end.getTime(); t += DAY) {
    const day = iso(new Date(t))
    const [site, pages, pairs] = await Promise.all([all(day, ['device']), all(day, ['page', 'device']), all(day, ['query', 'page', 'device'])])
    if (!site.length) continue
    await write(pool, 'gsc_site_daily', ['device'], day, merge(site, null))
    await write(pool, 'gsc_page_daily', ['page', 'device'], day, merge(pages, 0))
    const merged = merge(pairs, 1)
    await write(pool, 'gsc_qp_daily', ['query', 'page', 'device'], day, merged)
    days++
    qp += merged.length
  }
  await pool.end()
  console.log(`Search Console : ${days} jours relevés (${iso(start)} → ${iso(end)}), ${qp} lignes requête × page`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
