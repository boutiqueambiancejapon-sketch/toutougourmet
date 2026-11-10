// Ouverture quotidienne de fiches à Google (décision du propriétaire, 2026-11-10) : 10 par jour, pour remplir les pages
// mères « Avis + marque ». Garde-fous : marque avec page mère, fiabilité haute, une fiche par recette, mieux notées
// d'abord, 3 au plus par marque et par jour, jamais une fiche déjà connue (une fiche désactivée à la main reste fermée).
// Mélange (propriétaire, même jour) : 6 mieux notées et 4 mal notées (sous LOW_SCORE_BELOW), qui proposent des
// alternatives partenaires à qui cherche l'avis d'un produit médiocre. Adresse courte, tirée du nom nettoyé.
//   tsx scripts/indexer-quotidien.ts [--n=10] [--appliquer]
import pg from 'pg'
import { marquePage } from '../data/marque-pages'
import { MODEL_REVIEWS } from '../data/model-reviews'
import { horsListes } from '../lib/scanner/baremes/fiche'
import { isTherapeutic, LOW_SCORE_BELOW } from '../lib/scanner/fiche-lists'
import { nomRecette } from '../lib/scanner/fiches-indexees'
import { displayBrand, fold, recipeKey } from '../lib/scanner/rankings'
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
  const plafond = ([, r]: [string, Ligne]) => {
    const k = fold(r.brand)
    const c = (parMarque.get(k) ?? 0) + 1
    parMarque.set(k, c)
    return c <= PAR_MARQUE
  }
  const tri = [...meilleures.entries()].sort((a, b) => b[1].score - a[1].score)
  const mauvaises = Math.round(n * 0.4)
  const bas = [...tri].reverse().filter(([, r]) => r.score < LOW_SCORE_BELOW).filter(plafond).slice(0, mauvaises)
  const haut = tri.filter(([, r]) => r.score >= LOW_SCORE_BELOW).filter(plafond).slice(0, n - bas.length)
  const choix = [...haut, ...bas]
  for (const [cle, r] of choix) {
    const type = TYPE_ADRESSE[typeDeFiche(r.extracted, r.details)] as NonNullable<(typeof TYPE_ADRESSE)[keyof typeof TYPE_ADRESSE]>
    const nom = nomRecette(r.brand, r.product) ?? r.brand
    let court = baseSlug(r.brand, nom.slice(displayBrand(r.brand).length).trim(), null)
    const pris = await pool.query('SELECT cle FROM app.fiche_index WHERE court = $1', [court])
    if (pris.rows[0] && pris.rows[0].cle !== cle) court = `${court.slice(0, 90)}-${r.id.slice(0, 6)}`
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
