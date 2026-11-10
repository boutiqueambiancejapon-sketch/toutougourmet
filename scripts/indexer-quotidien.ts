// Ouverture quotidienne de fiches à Google (décision du propriétaire, 2026-11-10) : 10 par jour, pour remplir les pages
// mères « Avis + marque ». Garde-fous : marque avec page mère, fiabilité haute, une fiche par recette, mieux notées
// d'abord, 3 au plus par marque et par jour, jamais une fiche déjà connue (une fiche désactivée à la main reste fermée).
//   tsx scripts/indexer-quotidien.ts [--n=10] [--appliquer]
import pg from 'pg'
import { marquePage } from '../data/marque-pages'
import { MODEL_REVIEWS } from '../data/model-reviews'
import { horsListes } from '../lib/scanner/baremes/fiche'
import { isTherapeutic } from '../lib/scanner/fiche-lists'
import { nomRecette } from '../lib/scanner/fiches-indexees'
import { fold, recipeKey, recipeName } from '../lib/scanner/rankings'
import type { ScoreResult } from '../lib/scanner/score'
import { baseSlug } from '../lib/scanner/slug'
import type { ExtractedLabel } from '../lib/scanner/types'
import { TYPE_ADRESSE, typeDeFiche } from '../lib/server/dashboard-fiche-index'

const PAR_MARQUE = 3
const option = (nom: string) => process.argv.find((a) => a.startsWith(`--${nom}=`))?.split('=').slice(1).join('=')

type Ligne = { id: string; brand: string; product: string; score: number; extracted: ExtractedLabel; details: ScoreResult & { bareme?: { fiabilite?: string; simple?: boolean } } }

async function main(): Promise<void> {
  const n = Number(option('n') ?? 10)
  const appliquer = process.argv.includes('--appliquer')
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const connues = new Set((await pool.query<{ cle: string }>('SELECT cle FROM app.fiche_index')).rows.map((r) => r.cle))
  const { rows } = await pool.query<Ligne>(
    `SELECT id, brand, product, score, extracted, details FROM app.food_analysis
      WHERE NOT discarded AND score IS NOT NULL AND buy_url IS NOT NULL AND brand IS NOT NULL AND product IS NOT NULL`,
  )
  const meilleures = new Map<string, Ligne>()
  for (const r of rows) {
    const cle = recipeKey(r.brand, r.product)
    if (connues.has(cle) || MODEL_REVIEWS[cle] || !marquePage(r.brand)) continue
    if (r.details?.bareme?.fiabilite !== 'haute' || horsListes(r.details) || isTherapeutic(r)) continue
    if (!TYPE_ADRESSE[typeDeFiche(r.extracted, r.details)]) continue
    if ((meilleures.get(cle)?.score ?? -1) < r.score) meilleures.set(cle, r)
  }
  const parMarque = new Map<string, number>()
  const choix = [...meilleures.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .filter(([, r]) => {
      const k = fold(r.brand)
      const c = (parMarque.get(k) ?? 0) + 1
      parMarque.set(k, c)
      return c <= PAR_MARQUE
    })
    .slice(0, n)
  for (const [cle, r] of choix) {
    const type = TYPE_ADRESSE[typeDeFiche(r.extracted, r.details)] as NonNullable<(typeof TYPE_ADRESSE)[keyof typeof TYPE_ADRESSE]>
    let court = baseSlug(r.brand, recipeName(r.product), null)
    const pris = await pool.query('SELECT cle FROM app.fiche_index WHERE court = $1', [court])
    if (pris.rows[0] && pris.rows[0].cle !== cle) court = `${court.slice(0, 90)}-${r.id.slice(0, 6)}`
    const nom = nomRecette(r.brand, r.product) ?? r.brand
    console.log(`${r.score}\t/${type}/${court}\t${nom}`)
    if (appliquer) {
      await pool.query('INSERT INTO app.fiche_index (food_analysis_id, type, court, cle, nom) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING', [r.id, type, court, cle, nom])
    }
  }
  console.log(`${appliquer ? 'Ouvertes' : 'Essai'} : ${choix.length} fiche(s) · candidates restantes : ${meilleures.size - (appliquer ? choix.length : 0)}`)
  await pool.end()
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
