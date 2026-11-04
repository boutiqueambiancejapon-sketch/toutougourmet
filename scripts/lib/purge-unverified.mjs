// @cdc lot 4 — RGPD, durée de conservation : un compte dont l'adresse n'a jamais été confirmée
// est supprimé après 30 jours (sessions, chiens et pesées partent en cascade). Nettoie au passage
// les jetons de vérification et les sessions expirés. Appelée par scripts/purge-unverified.mjs.

export const UNVERIFIED_RETENTION_DAYS = 30

// @cdc e-mails — RGPD, durée de conservation : historique des envois gardé 24 mois (politique de
// confidentialité). guide_sends et welcome_sends suivent : après 24 mois, plus rien à dédoublonner.
// email_optouts n'est jamais purgée : elle fait respecter l'opposition.
export const EMAIL_LOG_RETENTION_MONTHS = 24

const EMAIL_HISTORY_TABLES = ['email_log', 'guide_sends', 'welcome_sends']

/**
 * Une table absente compte pour zéro : la purge des comptes doit passer même si db/analytics.sql
 * n'a pas encore été appliqué.
 * @param {import('pg').Pool | import('pg').Client} db
 * @param {{ months?: number, dry?: boolean }} [options]
 * @returns {Promise<number>} lignes supprimées (ou à supprimer avec dry)
 */
export async function purgeEmailHistory(db, { months = EMAIL_LOG_RETENTION_MONTHS, dry = false } = {}) {
  if (!Number.isInteger(months) || months < 1) throw new Error(`durée invalide : ${months}`)
  let total = 0
  for (const table of EMAIL_HISTORY_TABLES) {
    const { rows } = await db.query('SELECT to_regclass($1) IS NOT NULL AS ok', [`analytics.${table}`])
    if (!rows[0].ok) continue
    const where = 'sent_at < now() - make_interval(months => $1::int)'
    if (dry) {
      const res = await db.query(`SELECT count(*)::int AS n FROM analytics.${table} WHERE ${where}`, [months])
      total += res.rows[0].n
    } else {
      const res = await db.query(`DELETE FROM analytics.${table} WHERE ${where}`, [months])
      total += res.rowCount ?? 0
    }
  }
  return total
}

// @cdc scanner — RGPD, durée de conservation : journal des scans gardé 90 jours (politique de confidentialité).
export const SCANNER_EVENTS_RETENTION_DAYS = 90

/**
 * Table absente : zéro, comme purgeEmailHistory.
 * @param {import('pg').Pool | import('pg').Client} db
 * @param {{ days?: number, dry?: boolean }} [options]
 * @returns {Promise<number>} lignes supprimées (ou à supprimer avec dry)
 */
export async function purgeScannerEvents(db, { days = SCANNER_EVENTS_RETENTION_DAYS, dry = false } = {}) {
  if (!Number.isInteger(days) || days < 1) throw new Error(`durée invalide : ${days}`)
  const { rows } = await db.query("SELECT to_regclass('analytics.scanner_events') IS NOT NULL AS ok")
  if (!rows[0].ok) return 0
  const where = 'created_at < now() - make_interval(days => $1::int)'
  if (dry) {
    const res = await db.query(`SELECT count(*)::int AS n FROM analytics.scanner_events WHERE ${where}`, [days])
    return res.rows[0].n
  }
  const res = await db.query(`DELETE FROM analytics.scanner_events WHERE ${where}`, [days])
  return res.rowCount ?? 0
}

/**
 * @param {import('pg').Pool | import('pg').Client} db
 * @param {{ days?: number, dry?: boolean }} [options]
 * @returns {Promise<{ users: number, verifications: number, sessions: number }>}
 */
export async function purgeUnverifiedUsers(db, { days = UNVERIFIED_RETENTION_DAYS, dry = false } = {}) {
  if (!Number.isInteger(days) || days < 1) throw new Error(`durée invalide : ${days}`)
  const cutoff = `now() - make_interval(days => $1::int)`
  if (dry) {
    const { rows } = await db.query(
      `SELECT
         (SELECT count(*) FROM app."user" WHERE email_verified = false AND created_at < ${cutoff})::int AS users,
         (SELECT count(*) FROM app.verification WHERE expires_at < now())::int AS verifications,
         (SELECT count(*) FROM app.session WHERE expires_at < now())::int AS sessions`,
      [days],
    )
    return rows[0]
  }
  const users = await db.query(`DELETE FROM app."user" WHERE email_verified = false AND created_at < ${cutoff}`, [days])
  const verifications = await db.query('DELETE FROM app.verification WHERE expires_at < now()')
  const sessions = await db.query('DELETE FROM app.session WHERE expires_at < now()')
  return { users: users.rowCount ?? 0, verifications: verifications.rowCount ?? 0, sessions: sessions.rowCount ?? 0 }
}
