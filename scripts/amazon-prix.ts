// Prix Amazon des fiches, chaque heure (Amazon : un prix ne se garde pas plus d'1 heure). Relit les ASIN déjà trouvés par
// scripts/amazon-offres.ts, 10 par requête, et met à jour prix, prix au kilo, disponibilité et heure du relevé.
// La fiche et les classements n'affichent un prix Amazon que s'il a moins de 70 minutes.
//   tsx scripts/amazon-prix.ts
import pg from 'pg'
import { getItems, PAUSE_MS } from './lib-amazon-api'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  for (const k of ['AMAZON_CREATORS_ID', 'AMAZON_CREATORS_SECRET', 'AMAZON_PARTNER_TAG', 'DATABASE_URL']) if (!process.env[k]) throw new Error(`${k} manquant`)
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const { rows } = await pool.query<{ asin: string }>('SELECT DISTINCT asin FROM app.food_amazon')
  const asins = rows.map((r) => r.asin)
  let ok = 0, gone = 0
  for (let i = 0; i < asins.length; i += 10) {
    const lot = asins.slice(i, i + 10)
    let res: Awaited<ReturnType<typeof getItems>> | null = null
    for (let essai = 0; essai < 4 && res === null; essai++) {
      try { res = await getItems(lot) } catch { await sleep(30_000 * 2 ** essai) }
    }
    if (res === null) { console.error('arrêt : Amazon refuse encore après 4 essais'); break }
    for (const asin of lot) {
      const o = res.get(asin)
      if (o && o.dispo && o.prix !== null) {
        ok++
        // Prix au kilo recalculé sur le poids lu dans le titre ; invraisemblable (hors 0,50 à 80 €/kg) : non affiché.
        await pool.query(
          `UPDATE app.food_amazon SET prix = $2, dispo = true, maj_le = now(),
             prix_kg = CASE WHEN poids_kg > 0 AND $2::numeric / poids_kg BETWEEN 0.5 AND 80 THEN round($2::numeric / poids_kg, 2) ELSE NULL END
           WHERE asin = $1`,
          [asin, o.prix],
        )
      } else {
        gone++
        await pool.query('UPDATE app.food_amazon SET dispo = false, maj_le = now() WHERE asin = $1', [asin])
      }
    }
    await sleep(PAUSE_MS)
  }
  console.log(`${asins.length} ASIN relus, ${ok} avec prix, ${gone} indisponibles`)
  await pool.end()
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
