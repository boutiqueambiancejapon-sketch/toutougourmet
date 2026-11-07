// Ouvre à Google les meilleures recettes d'une marque (une fiche par recette), comme le bouton du tableau de bord.
//   tsx scripts/indexer-meilleures.ts --marque="Real Nature" [--n=10] [--appliquer]
import pg from 'pg'
import { MODEL_REVIEWS } from '../data/model-reviews'
import { horsListes } from '../lib/scanner/baremes/fiche'
import { isTherapeutic } from '../lib/scanner/fiche-lists'
import { nomRecette } from '../lib/scanner/fiches-indexees'
import { fold, recipeKey, recipeName } from '../lib/scanner/rankings'
import type { ScoreResult } from '../lib/scanner/score'
import { baseSlug } from '../lib/scanner/slug'
import type { ExtractedLabel } from '../lib/scanner/types'
import { TYPE_ADRESSE, typeDeFiche } from '../lib/server/dashboard-fiche-index'

const option = (nom: string) => process.argv.find((a) => a.startsWith(`--${nom}=`))?.split('=').slice(1).join('=')

async function main(): Promise<void> {
  const marque = option('marque')
  const n = Number(option('n') ?? 10)
  const appliquer = process.argv.includes('--appliquer')
  if (!marque) throw new Error('--marque manquant')
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const { rows } = await pool.query<{ id: string; brand: string; product: string; score: number; extracted: ExtractedLabel; details: ScoreResult }>(
    `SELECT id, brand, product, score, extracted, details FROM app.food_analysis
      WHERE NOT discarded AND score IS NOT NULL AND buy_url IS NOT NULL AND brand IS NOT NULL AND product IS NOT NULL`,
  )
  const meilleures = new Map<string, (typeof rows)[number]>()
  for (const r of rows.filter((x) => fold(x.brand) === fold(marque))) {
    const cle = recipeKey(r.brand, r.product)
    const type = TYPE_ADRESSE[typeDeFiche(r.extracted, r.details)]
    if (!type || MODEL_REVIEWS[cle] || horsListes(r.details) || isTherapeutic(r)) continue
    if ((meilleures.get(cle)?.score ?? -1) < r.score) meilleures.set(cle, r)
  }
  const choix = [...meilleures.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, n)
  for (const [cle, r] of choix) {
    const type = TYPE_ADRESSE[typeDeFiche(r.extracted, r.details)] as NonNullable<(typeof TYPE_ADRESSE)[keyof typeof TYPE_ADRESSE]>
    let court = baseSlug(r.brand, recipeName(r.product), null)
    const pris = await pool.query('SELECT cle FROM app.fiche_index WHERE court = $1', [court])
    if (pris.rows[0] && pris.rows[0].cle !== cle) court = `${court.slice(0, 90)}-${r.id.slice(0, 6)}`
    const nom = nomRecette(r.brand, r.product) ?? r.brand
    console.log(`${r.score}\t/${type}/${court}\t${nom}`)
    if (appliquer) {
      await pool.query(
        `INSERT INTO app.fiche_index (food_analysis_id, type, court, cle, nom) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (cle) DO UPDATE SET actif = true, updated_at = now()`,
        [r.id, type, court, cle, nom],
      )
    }
  }
  console.log(appliquer ? `${choix.length} fiches ouvertes à Google` : 'Essai : rien écrit')
  await pool.end()
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
