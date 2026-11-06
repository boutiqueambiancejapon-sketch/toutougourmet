// Un seul rappel aux comptes non confirmés, 24 heures après l'inscription. Rien après : pas d'insistance.
// La suppression à 30 jours reste faite par scripts/purge-unverified.mjs. Trace par empreinte, jamais l'adresse.
//   node_modules/.bin/tsx scripts/rappel-confirmation.ts [--essai]
import { createEmailVerificationToken } from 'better-auth/api'
import { verificationReminderEmail } from '../lib/server/auth-emails'
import { getPool } from '../lib/server/db'
import { flushEmailLog } from '../lib/server/email-log'
import { sendTransactionalEmail } from '../lib/server/mailer'
import { emailHash, emailHashSecret } from '../lib/server/email-hash'

const ETAPE = 'confirmation-rappel'
const LIEN_VALABLE = 7 * 24 * 60 * 60

async function main(): Promise<void> {
  const essai = process.argv.includes('--essai')
  const pool = getPool()
  const secret = process.env.BETTER_AUTH_SECRET
  const base = process.env.BETTER_AUTH_URL
  if (!pool || !secret || !base) throw new Error('Base, BETTER_AUTH_SECRET ou BETTER_AUTH_URL manquant')
  const { rows } = await pool.query<{ email: string; name: string }>(
    `SELECT email, name FROM app."user" WHERE NOT email_verified AND created_at < now() - interval '24 hours' AND created_at > now() - interval '7 days'`,
  )
  let envoyes = 0
  for (const u of rows) {
    const hash = emailHash(u.email, emailHashSecret())
    if (essai) {
      envoyes += 1
      continue
    }
    const pris = await pool.query('INSERT INTO analytics.welcome_sends (email_hash, step) VALUES ($1, $2) ON CONFLICT DO NOTHING', [hash, ETAPE])
    if (pris.rowCount !== 1) continue
    const token = await createEmailVerificationToken(secret, u.email, undefined, LIEN_VALABLE)
    const url = `${base}/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent('/compte?bienvenue=1')}`
    try {
      await sendTransactionalEmail(verificationReminderEmail(u.email, u.name, url))
      envoyes += 1
    } catch (err) {
      await pool.query('DELETE FROM analytics.welcome_sends WHERE email_hash = $1 AND step = $2', [hash, ETAPE])
      console.error('[rappel] échec', err instanceof Error ? err.message : err)
    }
  }
  await flushEmailLog().catch(() => undefined)
  console.log(`${rows.length} compte(s) concerné(s), ${envoyes} rappel(s)${essai ? ' à envoyer' : ' envoyé(s)'}`)
  await pool.end()
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
