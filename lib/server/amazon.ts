import { amazonUrl } from '@/lib/scanner/amazon'
import { getPool } from './db'

// @cdc scanner — même produit chez Amazon pour une fiche (app.food_amazon, rempli chaque nuit par scripts/amazon-offres.ts).

export interface OffreAmazon {
  href: string
  prix: number | null
  prixKg: number | null
  poidsKg: number | null
  /** Date et heure du relevé, heure de Paris (« 28 novembre à 05:30 »), exigées par Amazon à côté d'un prix. */
  releve: string
}

/** Identifiant partenaire Amazon.fr (même compte que les autres sites). */
export const AMAZON_TAG = process.env.AMAZON_PARTNER_TAG || 'ambiancejap0a-21'

export async function amazonDe(foodAnalysisId: string): Promise<OffreAmazon | null> {
  const pool = getPool()
  if (!pool) return null
  const { rows } = await pool
    .query<{ asin: string; prix: string | null; prix_kg: string | null; poids_kg: string | null; releve: string }>(
      `SELECT asin, prix, prix_kg, poids_kg, to_char(maj_le AT TIME ZONE 'Europe/Paris', 'FMDD') || ' ' ||
              (ARRAY['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'])[extract(month FROM maj_le AT TIME ZONE 'Europe/Paris')::int]
              || ' à ' || to_char(maj_le AT TIME ZONE 'Europe/Paris', 'HH24:MI') AS releve
         FROM app.food_amazon WHERE food_analysis_id = $1 AND dispo AND maj_le > now() - interval '70 minutes'`,
      [foodAnalysisId],
    )
    .catch(() => ({ rows: [] }))
  const r = rows[0]
  return r ? { href: amazonUrl(r.asin, AMAZON_TAG), prix: r.prix === null ? null : Number(r.prix), prixKg: r.prix_kg === null ? null : Number(r.prix_kg), poidsKg: r.poids_kg === null ? null : Number(r.poids_kg), releve: r.releve } : null
}
