// Compare les notes écrites en dur (articles d'avis, pages marques) aux notes en base. Lecture seule.
// À lancer le jour de l'activation des barèmes, avant la mise en ligne, puis à corriger les textes signalés.
//   tsx scripts/notes-citees.ts
import { readdirSync, readFileSync } from 'node:fs'
import pg from 'pg'

const NOTE = /<ProductPick name="([^"]+)" why="[^"]*Note du scanner : (\d+) sur 100\.[^"]*" href="([^"]+)"/g
const PARTENAIRES = ['Dog Chef', 'Dogfy Diet', 'Elmut', 'Franklin Pet Food', 'Ultra Premium Direct']

async function main(): Promise<void> {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  let ecarts = 0
  for (const fichier of readdirSync('content/blog').filter((f) => f.endsWith('.mdx'))) {
    for (const [, nom, citee, lien] of readFileSync(`content/blog/${fichier}`, 'utf8').matchAll(NOTE)) {
      const { rows } = await pool.query<{ score: number | null }>('SELECT score FROM app.food_analysis WHERE buy_url = $1', [lien.replaceAll('&amp;', '&')])
      const reelle = rows[0]?.score
      if (reelle === Number(citee)) continue
      ecarts += 1
      console.log(`${fichier} | ${nom} | citée ${citee} | en base ${reelle ?? 'fiche introuvable'}`)
    }
  }
  console.log(`${ecarts} note(s) d'article à corriger\n`)
  const { rows } = await pool.query<{ brand: string; type: string | null; n: number; min: number; max: number }>(
    `SELECT brand, extracted->>'typeImage' AS type, count(*)::int AS n, min(score)::int AS min, max(score)::int AS max
       FROM app.food_analysis WHERE brand = ANY($1) AND score IS NOT NULL AND NOT discarded GROUP BY 1, 2 ORDER BY 1, 2`,
    [PARTENAIRES],
  )
  console.log('Fourchettes à reporter dans data/brand-hub.ts, data/brand-content.ts et avis-dogfy-diet :')
  for (const r of rows) console.log(`${r.brand} | ${r.type ?? 'sans type'} | ${r.n} fiches | de ${r.min} à ${r.max}`)
  await pool.end()
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
