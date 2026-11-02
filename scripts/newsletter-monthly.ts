// Lettre mensuelle : la veille du premier mardi du mois, crée la campagne Brevo (liste BREVO_LIST_ID,
// envoi programmé le lendemain à 18 h, heure de Paris), envoie un test à NEWSLETTER_TEST_EMAIL et
// note l'identifiant de campagne dans NEWSLETTER_STATE_FILE. Les autres jours : ne fait rien.
//
// Lancer (depuis la racine du site, variables de /srv/toutou/shared/.env chargées) :
//   node_modules/.bin/tsx scripts/newsletter-monthly.ts            (tâche quotidienne)
//   node_modules/.bin/tsx scripts/newsletter-monthly.ts --dry      (affiche sans appeler Brevo)
//   … --dry --force                    (prépare la prochaine lettre quel que soit le jour)
//   … --dry --today=2026-11-30         (simule le jour d'exécution)
// Installation : deploy/toutou-newsletter.service et .timer (voir deploy/README.md).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { BREVO_UNSUBSCRIBE_TAG } from '../lib/emails/monthly'
import { addDays, isFirstTuesday, nextFirstTuesday, parisDate, sendInstant } from '../lib/emails/schedule'
import { CAMPAIGN_PREFIX, createCampaign, sendCampaignTest } from '../lib/server/brevo-newsletter'
import { getPool } from '../lib/server/db'
import { monthlyNewsletterFor } from '../lib/server/newsletter'

interface StateEntry {
  campaignId: number
  scheduledAt: string
  subject: string
  createdAt: string
}

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const force = args.includes('--force')
const todayArg = args.find((a) => a.startsWith('--today='))?.slice('--today='.length)
const stateFile = process.env.NEWSLETTER_STATE_FILE || '/srv/toutou/shared/newsletter-state.json'

function readState(): Record<string, StateEntry> {
  if (!existsSync(stateFile)) return {}
  return JSON.parse(readFileSync(stateFile, 'utf-8')) as Record<string, StateEntry>
}

function writeState(state: Record<string, StateEntry>): void {
  mkdirSync(dirname(stateFile), { recursive: true })
  writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`)
}

async function main(): Promise<void> {
  const today = todayArg ?? parisDate(new Date())
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error(`--today invalide : ${today}`)
  const tomorrow = addDays(today, 1)
  if (!isFirstTuesday(tomorrow) && !force) {
    console.log(`[lettre] ${today} : demain n'est pas le premier mardi du mois, rien à faire.`)
    return
  }
  const sendDay = isFirstTuesday(tomorrow) ? tomorrow : nextFirstTuesday(tomorrow)
  const month = sendDay.slice(0, 7)
  const state = readState()
  if (state[month] && !dry) {
    console.log(`[lettre] campagne ${state[month].campaignId} déjà créée pour ${month}, rien à faire.`)
    return
  }

  const send = sendInstant(sendDay)
  const mail = await monthlyNewsletterFor(send.date)
  if (!mail.html.includes(BREVO_UNSUBSCRIBE_TAG)) throw new Error('balise de désinscription absente du HTML')
  const name = `${CAMPAIGN_PREFIX} ${month}`
  const testTo = process.env.NEWSLETTER_TEST_EMAIL

  console.log(`[lettre] ${name}`)
  console.log(`  objet        : ${mail.subject}`)
  console.log(`  aperçu       : ${mail.previewText}`)
  console.log(`  envoi prévu  : ${send.iso} (liste ${process.env.BREVO_LIST_ID ?? '?'}, expéditeur ${process.env.BREVO_SENDER_EMAIL ?? '?'})`)
  console.log(`  guide du mois: ${mail.featuredSlug}`)
  console.log(`  guides       : ${mail.guideSlugs.join(', ')}`)
  console.log(`  offre        : ${mail.offerSlug} · saison : ${mail.seasonalSlug}`)
  console.log(`  test         : ${testTo ?? '(NEWSLETTER_TEST_EMAIL absent, pas de test)'}`)

  if (dry) {
    const out = `/tmp/newsletter-${month}.html`
    writeFileSync(out, mail.html)
    console.log(`[lettre] --dry : aucun appel à Brevo. HTML écrit dans ${out} (${mail.html.length} octets).`)
    return
  }

  if (send.date.getTime() <= Date.now()) throw new Error(`heure d'envoi déjà passée : ${send.iso}`)
  const campaignId = await createCampaign({ name, subject: mail.subject, previewText: mail.previewText, htmlContent: mail.html, scheduledAt: send.iso })
  writeState({ ...state, [month]: { campaignId, scheduledAt: send.iso, subject: mail.subject, createdAt: new Date().toISOString() } })
  console.log(`[lettre] campagne ${campaignId} créée, programmée pour ${send.iso}. Annulable depuis /tableau-de-bord/emails/lettre.`)
  if (testTo) {
    await sendCampaignTest(campaignId, testTo).then(
      () => console.log(`[lettre] test envoyé à ${testTo}`),
      (err: unknown) => console.error('[lettre] test non envoyé', err instanceof Error ? err.message : err),
    )
  }
}

main()
  .catch((err: unknown) => {
    console.error('[lettre] échec', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => getPool()?.end())
