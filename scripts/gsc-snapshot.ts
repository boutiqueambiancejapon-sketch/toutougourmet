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
  // Une page compte aussi sous ses ancres (#section) : tout s'additionne ici, avant l'écriture. Avant le 2026-11-21,
  // l'écriture par lots remplaçait la ligne, et une ancre à 0 clic écrasait parfois la page (relevés faussés).
  const total = new Map<string, { d: string; p: string; c: number; i: number; pi: number }>()
  for (const l of lignes) {
    const p = l.keys[1].split('#')[0]
    const k = `${l.keys[0]}|${p}`
    const t = total.get(k) ?? { d: l.keys[0], p, c: 0, i: 0, pi: 0 }
    t.c += l.clicks
    t.i += l.impressions
    t.pi += l.position * l.impressions
    total.set(k, t)
  }
  const agreges = [...total.values()]
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  for (let i = 0; i < agreges.length; i += 500) {
    const lot = agreges.slice(i, i + 500)
    const valeurs = lot.flatMap((l) => [l.d, l.p, l.c, l.i, l.i ? l.pi / l.i : 0])
    const places = lot.map((_, j) => `($${j * 5 + 1}::date, $${j * 5 + 2}::text, $${j * 5 + 3}::int, $${j * 5 + 4}::int, $${j * 5 + 5}::real)`).join(', ')
    await pool.query(
      `INSERT INTO analytics.gsc_pages_daily (day, page, clicks, impressions, position) SELECT d, p, c, i, pos FROM (VALUES ${places}) AS v(d, p, c, i, pos)
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
