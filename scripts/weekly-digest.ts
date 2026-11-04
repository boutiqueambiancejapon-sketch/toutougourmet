// Résumé hebdomadaire par e-mail au propriétaire (OWNER_EMAIL), chaque lundi à 8 h 40, heure de
// Paris (deploy/toutou-weekly.timer). Semaine résumée : du lundi au dimanche qui précèdent.
// Envoi en transactionnel Brevo (BREVO_API_KEY, BREVO_SENDER_EMAIL), étiquette « interne ».
//
// Lancer depuis la racine du site, variables de /srv/toutou/shared/.env chargées :
//   node_modules/.bin/tsx scripts/weekly-digest.ts                     (envoi)
//   … --dry                    écrit le HTML dans /tmp/weekly-digest-AAAA-MM-JJ.html, sans envoyer
//   … --week=2026-10-26        résume la semaine qui commence ce lundi-là
// Aperçu : tableau de bord, /tableau-de-bord/emails/hebdo.

import { writeFileSync } from 'node:fs'
import { weeklyDigestEmail } from '../lib/emails/weekly'
import { getPool } from '../lib/server/db'
import { flushEmailLog } from '../lib/server/email-log'
import { sendTransactionalEmail } from '../lib/server/mailer'
import { getWeeklyDigestData, lastWeekStart } from '../lib/server/weekly-digest-data'

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const week = args.find((a) => a.startsWith('--week='))?.slice('--week='.length) ?? lastWeekStart(new Date())

async function main(): Promise<void> {
  if (new Date(`${week}T12:00:00Z`).getUTCDay() !== 1) throw new Error(`--week doit être un lundi : ${week}`)
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent')
  const data = await getWeeklyDigestData(pool, week).finally(() => pool.end())
  const mail = weeklyDigestEmail(data)
  console.log(`[hebdo] semaine du ${week} · objet : ${mail.subject}`)
  console.log(mail.text)
  if (dry) {
    const out = `/tmp/weekly-digest-${week}.html`
    writeFileSync(out, mail.html)
    console.log(`[hebdo] --dry : rien envoyé. HTML écrit dans ${out} (${mail.html.length} octets).`)
    return
  }
  const to = process.env.OWNER_EMAIL
  if (!to) throw new Error('OWNER_EMAIL absent')
  await sendTransactionalEmail({ to, subject: mail.subject, html: mail.html, text: mail.text, kind: 'interne', tags: ['interne'] })
  await flushEmailLog()
  console.log('[hebdo] résumé envoyé à OWNER_EMAIL.')
}

main().catch((err: unknown) => {
  console.error('[hebdo] échec :', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
