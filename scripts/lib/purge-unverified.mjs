// @cdc lot 4 — RGPD, durée de conservation : un compte dont l'adresse n'a jamais été confirmée
// est supprimé après 30 jours (sessions, chiens et pesées partent en cascade). Nettoie au passage
// les jetons de vérification et les sessions expirés. Appelée par scripts/purge-unverified.mjs.

export const UNVERIFIED_RETENTION_DAYS = 30

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
