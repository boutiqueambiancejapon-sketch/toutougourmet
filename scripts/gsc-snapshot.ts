// Search Console par page et par jour dans analytics.gsc_pages_daily (2026-11-11) : sert au tableau « Nouvelles pages
// dans Google » du tableau de bord. Chaque nuit, les 7 derniers jours sont réécrits (Google complète avec retard).
//   tsx scripts/gsc-snapshot.ts [--jours=7]
import pg from 'pg'
import { GSC_SITE } from '../lib/server/dashboard-recherche'
import { analyseGsc } from '../lib/server/search-console'

const jours = Number(process.argv.find((a) => a.startsWith('--jours='))?.split('=')[1] ?? 7)
const jour = (d: Date) => d.toISOString().slice(0, 10)

async function main(): Promise<void> {
  const fin = new Date()
  const debut = new Date(fin.getTime() - jours * 86_400_000)
  const lignes = []
  for (let start = 0; ; start += 25000) {
    const page = await analyseGsc(GSC_SITE, jour(debut), jour(fin), ['date', 'page'], 25000, start)
    lignes.push(...page)
    if (page.length < 25000) break
  }
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  for (let i = 0; i < lignes.length; i += 500) {
    const lot = lignes.slice(i, i + 500)
    const valeurs = lot.flatMap((l) => [l.keys[0], l.keys[1].split('#')[0], l.clicks, l.impressions, l.position])
    const places = lot.map((_, j) => `($${j * 5 + 1}::date, $${j * 5 + 2}::text, $${j * 5 + 3}::int, $${j * 5 + 4}::int, $${j * 5 + 5}::real)`).join(', ')
    await pool.query(
      `INSERT INTO analytics.gsc_pages_daily (day, page, clicks, impressions, position) SELECT d::date, p, sum(c)::int, sum(i)::int, (sum(pos * i) / nullif(sum(i), 0))::real
         FROM (VALUES ${places}) AS v(d, p, c, i, pos) GROUP BY d, p
       ON CONFLICT (day, page) DO UPDATE SET clicks = EXCLUDED.clicks, impressions = EXCLUDED.impressions, position = EXCLUDED.position`,
      valeurs,
    )
  }
  await pool.end()
  console.log(`Search Console : ${lignes.length} lignes page × jour sur ${jours} jours`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
