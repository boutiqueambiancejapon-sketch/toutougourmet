// Recalcule les notes enregistrées après un changement de barème, sans appel à l'IA.
//   tsx scripts/rescore-fiches.ts              : compte seulement
//   tsx scripts/rescore-fiches.ts --appliquer  : écrit
import pg from 'pg'
import { analyseLabel, scoreVersionFor } from '../lib/scanner/analyse'
import type { ExtractedLabel } from '../lib/scanner/types'

const apply = process.argv.includes('--appliquer')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const { rows } = await pool.query<{ id: string; extracted: ExtractedLabel; score: number | null; algorithm_version: string }>('SELECT id, extracted, score, algorithm_version FROM app.food_analysis')
let stale = 0
let changed = 0
for (const row of rows) {
  const version = scoreVersionFor(row.extracted)
  if (row.algorithm_version === version) continue
  stale += 1
  const details = analyseLabel(row.extracted)
  if (details.score !== row.score) changed += 1
  if (apply) await pool.query('UPDATE app.food_analysis SET details = $2, score = $3, algorithm_version = $4 WHERE id = $1', [row.id, JSON.stringify(details), details.score, version])
}
console.log(`${rows.length} fiches, ${stale} à recalculer, ${changed} changent de note${apply ? ' : écrit.' : ' (rien n’est écrit).'}`)
await pool.end()
