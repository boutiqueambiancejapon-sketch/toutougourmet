// Relit la composition des fiches Open Pet Food Facts après une correction de la lecture, sans appel à l'IA.
// Fiches relues à la main : jamais touchées. Un contrôle IA encore valable le reste : seule la lecture
// des pourcentages change, pas ce qui a été contrôlé.
//   tsx scripts/reparse-opff-fiches.ts              : compte seulement
//   tsx scripts/reparse-opff-fiches.ts --appliquer  : écrit
import pg from 'pg'
import { analyseLabel, scoreVersionFor } from '../lib/scanner/analyse'
import { parseIngredientText } from '../lib/scanner/ingredient-text'
import { partialAnimalShare } from '../lib/scanner/opff'
import type { ExtractedLabel } from '../lib/scanner/types'

interface Row {
  id: string
  extracted: ExtractedLabel
  score: number | null
  text: string
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--appliquer')
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const { rows } = await pool.query<Row>(
    `SELECT f.id, f.extracted, f.score, coalesce(nullif(o.ingredients_text_fr, ''), o.ingredients_text) AS text
       FROM app.food_analysis f JOIN app.opff_product o ON o.ean = f.ean
      WHERE f.source = 'openpetfoodfacts' AND NOT f.reviewed AND NOT f.extracted ? 'corrigee' AND coalesce(nullif(o.ingredients_text_fr, ''), o.ingredients_text) <> ''`,
  )
  let read = 0
  let scored = 0
  for (const row of rows) {
    const parsed = parseIngredientText(row.text)
    const share = partialAnimalShare(parsed.partiels)
    if (JSON.stringify(row.extracted.ingredients) === JSON.stringify(parsed.ingredients) && row.extracted.partAnimaleDeclaree === share) continue
    read += 1
    const extracted: ExtractedLabel = { ...row.extracted, ingredients: parsed.ingredients, partAnimaleDeclaree: share }
    const details = analyseLabel(extracted)
    if (details.score !== row.score) scored += 1
    if (!apply) continue
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const before = await client.query<{ hash: string }>('SELECT md5(extracted::text) AS hash FROM app.food_analysis WHERE id = $1', [row.id])
      await client.query('UPDATE app.food_analysis SET extracted = $2, details = $3, score = $4, algorithm_version = $5 WHERE id = $1', [row.id, JSON.stringify(extracted), JSON.stringify(details), details.score, scoreVersionFor(extracted)])
      await client.query(
        `UPDATE app.food_check c SET content_hash = md5(f.extracted::text) FROM app.food_analysis f
          WHERE c.food_analysis_id = f.id AND f.id = $1 AND c.content_hash = $2`,
        [row.id, before.rows[0]?.hash],
      )
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
  console.log(`${rows.length} fiches lues, ${read} lectures modifiées, ${scored} notes modifiées${apply ? ' : écrit.' : ' (rien n’est écrit).'}`)
  await pool.end()
}

void main()
