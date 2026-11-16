// E-mail Black Friday 2026 : crée la campagne Brevo programmée le jeudi 26/11 à 18 h (Paris), envoie un test
// à NEWSLETTER_TEST_EMAIL et note la campagne comme lettre de décembre dans NEWSLETTER_STATE_FILE, pour que
// la lettre mensuelle du 1er décembre ne parte pas en plus (« une lettre par mois, pas plus »).
//   node_modules/.bin/tsx scripts/newsletter-black-friday.ts --dry   (HTML dans /tmp, aucun appel à Brevo)
//   node_modules/.bin/tsx scripts/newsletter-black-friday.ts         (crée la campagne et le test)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { BREVO_UNSUBSCRIBE_TAG } from '../lib/emails/monthly'
import { BLACK_FRIDAY_PREVIEW, BLACK_FRIDAY_SUBJECT, buildBlackFridayEmail } from '../lib/emails/black-friday'
import { sendInstant } from '../lib/emails/schedule'
import { createCampaign, sendCampaignTest } from '../lib/server/brevo-newsletter'

const SEND_DAY = '2026-11-26'
const STATE_MONTH = '2026-12'
const dry = process.argv.includes('--dry')
const stateFile = process.env.NEWSLETTER_STATE_FILE || '/srv/toutou/shared/newsletter-state.json'

async function main(): Promise<void> {
  const mail = buildBlackFridayEmail()
  if (!mail.html.includes(BREVO_UNSUBSCRIBE_TAG)) throw new Error('balise de désinscription absente du HTML')
  const send = sendInstant(SEND_DAY)
  console.log(`[black-friday] objet : ${BLACK_FRIDAY_SUBJECT}\n  aperçu : ${BLACK_FRIDAY_PREVIEW}\n  envoi : ${send.iso}`)
  if (dry) {
    writeFileSync('/tmp/newsletter-black-friday.html', mail.html)
    writeFileSync('/tmp/newsletter-black-friday.txt', mail.text)
    console.log('[black-friday] --dry : HTML dans /tmp/newsletter-black-friday.html')
    return
  }
  const state = existsSync(stateFile) ? (JSON.parse(readFileSync(stateFile, 'utf-8')) as Record<string, unknown>) : {}
  if (state[STATE_MONTH]) throw new Error(`une campagne existe déjà pour ${STATE_MONTH}`)
  if (send.date.getTime() <= Date.now()) throw new Error(`heure d'envoi déjà passée : ${send.iso}`)
  const campaignId = await createCampaign({ name: 'Black Friday 2026', subject: BLACK_FRIDAY_SUBJECT, previewText: BLACK_FRIDAY_PREVIEW, htmlContent: mail.html, scheduledAt: send.iso })
  mkdirSync(dirname(stateFile), { recursive: true })
  writeFileSync(stateFile, `${JSON.stringify({ ...state, [STATE_MONTH]: { campaignId, scheduledAt: send.iso, subject: BLACK_FRIDAY_SUBJECT, createdAt: new Date().toISOString(), note: 'Black Friday, tient lieu de lettre de décembre' } }, null, 2)}\n`)
  console.log(`[black-friday] campagne ${campaignId} programmée pour ${send.iso}. Annulable depuis /tableau-de-bord/emails/lettre.`)
  const testTo = process.env.NEWSLETTER_TEST_EMAIL
  if (testTo) await sendCampaignTest(campaignId, testTo).then(() => console.log(`[black-friday] test envoyé à ${testTo}`))
}

main().catch((err: unknown) => {
  console.error('[black-friday] échec', err instanceof Error ? err.message : err)
  process.exitCode = 1
})
