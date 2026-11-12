import type { PrixMaxiZoo } from '@/lib/scanner/prix'
import { getPool } from './db'

// @cdc scanner — lecture du prix Maxi Zoo d'une fiche (app.food_price, rempli par l'import de nuit).

export async function prixDe(foodAnalysisId: string): Promise<PrixMaxiZoo | null> {
  const pool = getPool()
  if (!pool) return null
  const { rows } = await pool
    .query<{ prix: string; prix_kg: string | null; prix_ancien: string | null; releve: string }>(
      "SELECT prix, prix_kg, prix_ancien, to_char(maj_le AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD') AS releve FROM app.food_price WHERE food_analysis_id = $1",
      [foodAnalysisId],
    )
    .catch(() => ({ rows: [] }))
  const r = rows[0]
  return r ? { prix: Number(r.prix), prixKg: r.prix_kg === null ? null : Number(r.prix_kg), prixAncien: r.prix_ancien === null ? null : Number(r.prix_ancien), releve: r.releve } : null
}
