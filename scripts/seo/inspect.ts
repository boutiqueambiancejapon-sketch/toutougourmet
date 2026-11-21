// @cdc tableau de bord SEO — inspection d'URL de Google chaque nuit, 2 000 adresses au plus (quota de Google), par
// priorité : pages nouvelles ou modifiées, jamais inspectées, pages qui ramènent des clics, jamais vues par Googlebot,
// puis les relevés les plus anciens. Résultat dans analytics.url_inspection (état + raison donnée par Google).
//   tsx scripts/seo/inspect.ts [--max=2000]
import pg from 'pg'
import { SITE } from '../../lib/seo-dash/config'
import { publications } from '../../lib/seo-dash/server/content'
import { sitemapEntries } from '../../lib/seo-dash/server/sitemap'
import { inspectUrl } from '../../lib/server/search-console'

const MAX = Math.min(2000, Number(process.argv.find((a) => a.startsWith('--max='))?.split('=')[1] ?? 2000))
const DAY = 86_400_000

async function main(): Promise<void> {
  const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
  const map = await sitemapEntries()
  const [checked, top, crawled] = await Promise.all([
    db.query<{ path: string; at: Date }>(`SELECT path, checked_at AS at FROM analytics.url_inspection`),
    db.query<{ page: string }>(`SELECT page FROM analytics.gsc_page_daily WHERE day >= current_date - 28 GROUP BY 1 HAVING sum(clicks) > 0 ORDER BY sum(clicks) DESC LIMIT 300`),
    db.query<{ path: string }>(`SELECT DISTINCT path FROM analytics.hits WHERE bot = 'Googlebot' AND status < 400`),
  ])
  const at = new Map(checked.rows.map((r) => [r.path, r.at.getTime()]))
  const age = (p: string) => (at.has(p) ? Date.now() - (at.get(p) ?? 0) : Infinity)
  const recent = new Set(publications().filter((p) => Date.now() - new Date(`${p.date}T00:00:00Z`).getTime() < 14 * DAY || (p.updatedAt && Date.now() - new Date(`${p.updatedAt}T00:00:00Z`).getTime() < 7 * DAY)).map((p) => p.path))
  const topSet = new Set(top.rows.map((r) => r.page))
  const seen = new Set(crawled.rows.map((r) => r.path.replace(/\/$/, '') || '/'))
  const score = (e: { path: string; lastmod: string | null }): number => {
    const a = age(e.path)
    if (a < DAY / 2) return -1
    const changed = recent.has(e.path) || (e.lastmod !== null && Date.now() - new Date(`${e.lastmod}T00:00:00Z`).getTime() < 3 * DAY)
    if (changed && a > 2 * DAY) return 5
    if (a === Infinity) return 4
    if (topSet.has(e.path) && a > 7 * DAY) return 3
    if (!seen.has(e.path) && a > 7 * DAY) return 2
    return a > 14 * DAY ? 1 : 0
  }
  const queue = map.map((e) => ({ e, s: score(e) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || age(b.e.path) - age(a.e.path)).slice(0, MAX)
  let ok = 0
  let failed = 0
  for (const { e } of queue) {
    try {
      const r = await inspectUrl(SITE.gscSite, `${SITE.baseUrl}${e.path === '/' ? '/' : e.path}`)
      await db.query(
        `INSERT INTO analytics.url_inspection (path, checked_at, verdict, coverage, indexing_state, page_fetch, robots, last_crawl, google_canonical, user_canonical, error)
         VALUES ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, NULL)
         ON CONFLICT (path) DO UPDATE SET checked_at = now(), verdict = $2, coverage = $3, indexing_state = $4, page_fetch = $5, robots = $6,
           last_crawl = $7, google_canonical = $8, user_canonical = $9, error = NULL`,
        [e.path, r.verdict, r.coverageState, r.indexingState, r.pageFetchState, r.robotsTxtState, r.lastCrawlTime, r.googleCanonical, r.userCanonical],
      )
      ok++
    } catch (err) {
      failed++
      const msg = err instanceof Error ? err.message : String(err)
      // Quota atteint : on s'arrête, la nuit suivante reprendra.
      if (/ 429 | quota/i.test(msg)) {
        console.error(`quota atteint après ${ok} adresses`)
        break
      }
      if (failed > 20 && ok === 0) throw new Error(`inspection impossible : ${msg}`)
    }
    await new Promise((r) => setTimeout(r, 150))
  }
  await db.end()
  console.log(`Inspection d'URL : ${ok} adresses relevées, ${failed} échecs, ${queue.length} en file sur ${map.length}`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
