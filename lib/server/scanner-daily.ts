import { getPool } from './db'

// @cdc sécurité — plafond global de lectures d'étiquette par jour (SCANNER_DAILY_CAP, 300 par
// défaut), tous comptes confondus : la facture du fournisseur d'OCR ne peut pas dépasser ce plafond.
// Réservation atomique avant l'appel, rendue si la lecture échoue. Alerte ntfy à 80 % (scripts/alerts.ts).

export const SCANNER_DAILY_CAP = Number(process.env.SCANNER_DAILY_CAP) || 300

const TODAY = "(now() AT TIME ZONE 'Europe/Paris')::date"

/** Réserve une lecture du jour ; false si le plafond est atteint (ou la table absente : on bloque). */
export async function reserveDailyCall(cap = SCANNER_DAILY_CAP): Promise<boolean> {
  const pool = getPool()
  if (!pool) return false
  try {
    const { rows } = await pool.query<{ calls: number }>(
      `INSERT INTO analytics.scanner_daily (day, calls) VALUES (${TODAY}, 1)
       ON CONFLICT (day) DO UPDATE SET calls = analytics.scanner_daily.calls + 1
       WHERE analytics.scanner_daily.calls < $1
       RETURNING calls`,
      [cap],
    )
    return rows.length > 0
  } catch (err) {
    console.error('[scanner] plafond du jour illisible', err instanceof Error ? err.message : err)
    return false
  }
}

export async function releaseDailyCall(): Promise<void> {
  await getPool()
    ?.query(`UPDATE analytics.scanner_daily SET calls = calls - 1 WHERE day = ${TODAY} AND calls > 0`)
    .catch(() => undefined)
}

/** Lectures du jour, pour les alertes et le tableau de bord. */
export async function dailyCalls(): Promise<number | null> {
  const pool = getPool()
  if (!pool) return null
  const { rows } = await pool.query<{ calls: number }>(`SELECT calls FROM analytics.scanner_daily WHERE day = ${TODAY}`)
  return rows[0]?.calls ?? 0
}
