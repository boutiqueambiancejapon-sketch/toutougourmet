// Suite de bienvenue : chaque jour, envoie à chaque contact de la liste Brevo l'étape due
// (J2 la ration, J5 l'offre du moment, J10 le scanner), une seule fois par étape et par adresse.
// Tâche quotidienne : deploy/toutou-welcome.timer (10 h 17, heure de Paris).
//
// Garde-fous :
//   - rien ne part sans WELCOME_EMAIL_ENABLED=1 ni WELCOME_SEQUENCE_START=AAAA-MM-JJ (vide = rien) ;
//   - seuls les contacts créés dans Brevo ce jour-là ou après reçoivent la suite ;
//   - trace par étape dans analytics.welcome_sends (empreinte HMAC, jamais l'adresse), posée
//     avant l'envoi, retirée si l'envoi échoue ;
//   - au plus 300 envois par jour (DAILY_CAP), un seul e-mail par contact et par jour ;
//   - journal sans adresse en clair (repère #empreinte).
//
// Lancer depuis la racine du site, variables de /srv/toutou/shared/.env chargées :
//   node_modules/.bin/tsx scripts/welcome-sequence.ts                 (envoi)
//   … --dry                    affiche le plan, n'écrit rien, n'envoie rien, HTML dans /tmp
//   … --today=2026-11-20       simule le jour d'exécution
// BREVO_DRY_RUN=1 : contacts fictifs (@example.invalid) au lieu de la liste Brevo.
// Aperçus : tableau de bord, /tableau-de-bord/emails/bienvenue-suite.

import { writeFileSync } from 'node:fs'
import { parisDate } from '../lib/emails/schedule'
import { unsubscribeUrlFromEnv } from '../lib/emails/unsubscribe'
import { STEP_DAY, WELCOME_STEPS, welcomeStepEmail, type WelcomeStep } from '../lib/emails/welcome-sequence'
import { getPool } from '../lib/server/db'
import { sendTransactionalEmail } from '../lib/server/mailer'
import {
  DAILY_CAP,
  afterStart,
  claimStep,
  daysSince,
  dueStep,
  emailHash,
  fakeContacts,
  fetchListContacts,
  releaseStep,
  sentSteps,
  sentToday,
  sequenceStart,
  shortId,
} from '../lib/server/welcome-sequence'

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const today = args.find((a) => a.startsWith('--today='))?.slice('--today='.length) ?? parisDate(new Date())
const log = (msg: string) => console.log(`[bienvenue] ${msg}`)

async function main(): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error(`--today invalide : ${today}`)
  const start = sequenceStart(process.env.WELCOME_SEQUENCE_START)
  if (!start) return log('WELCOME_SEQUENCE_START vide ou invalide : rien à envoyer.')
  if (!dry && process.env.WELCOME_EMAIL_ENABLED !== '1') return log('WELCOME_EMAIL_ENABLED différent de 1 : rien à envoyer.')
  const secret = process.env.NEWSLETTER_SECRET
  if (!secret) throw new Error('NEWSLETTER_SECRET absent (lien de désinscription impossible)')
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent')

  try {
    const fake = process.env.BREVO_DRY_RUN === '1'
    const contacts = fake ? fakeContacts(today, start) : await fetchListContacts()
    const eligible = contacts.filter((c) => !c.blacklisted && afterStart(c.createdAt, start))
    const hashes = eligible.map((c) => emailHash(c.email, secret))
    const sent = await sentSteps(pool, hashes)
    let budget = Math.max(0, DAILY_CAP - (await sentToday(pool)))
    log(`${today} · départ ${start} · ${contacts.length} contacts${fake ? ' fictifs' : ''}, ${eligible.length} inscrits depuis le départ · ${budget} envois possibles aujourd'hui${dry ? ' · à blanc' : ''}`)

    const plan: { email: string; hash: string; step: WelcomeStep }[] = []
    eligible.forEach((c, i) => {
      const step = dueStep(daysSince(c.createdAt, today), sent.get(hashes[i]) ?? new Set())
      if (step) plan.push({ email: c.email, hash: hashes[i], step })
    })
    for (const step of WELCOME_STEPS) log(`${step} (jour ${STEP_DAY[step]}) : ${plan.filter((p) => p.step === step).length} à envoyer`)
    if (plan.length > budget) log(`plafond de ${DAILY_CAP} par jour : ${plan.length - budget} reportés à demain`)

    const counts = { sent: 0, already: 0, failed: 0 }
    for (const p of plan) {
      if (budget <= 0) break
      const unsubscribe = unsubscribeUrlFromEnv(p.email)
      if (!unsubscribe) throw new Error('NEWSLETTER_SECRET absent')
      const mail = welcomeStepEmail(p.step, unsubscribe, new Date(`${today}T12:00:00Z`))
      if (dry) {
        log(`${p.step} → ${shortId(p.hash)} · « ${mail.subject} »`)
        budget--
        continue
      }
      if (!(await claimStep(pool, p.hash, p.step))) {
        counts.already++
        continue
      }
      budget--
      try {
        await sendTransactionalEmail({ to: p.email, ...mail, headers: { 'List-Unsubscribe': `<${unsubscribe}>` }, tags: [`lettre-bienvenue-${p.step}`] })
        counts.sent++
        log(`${p.step} envoyé → ${shortId(p.hash)}`)
      } catch (err) {
        counts.failed++
        await releaseStep(pool, p.hash, p.step).catch(() => undefined)
        log(`${p.step} échec → ${shortId(p.hash)} : ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    if (dry) {
      const at = new Date(`${today}T12:00:00Z`)
      for (const step of WELCOME_STEPS) {
        const out = `/tmp/welcome-${step}.html`
        writeFileSync(out, welcomeStepEmail(step, 'https://www.toutou-gourmet.com/newsletter/desinscription?apercu', at).html)
        log(`aperçu ${step} : ${out}`)
      }
      return log('--dry : rien écrit en base, rien envoyé.')
    }
    log(`terminé : ${counts.sent} envoyés, ${counts.already} déjà partis, ${counts.failed} échecs.`)
    if (counts.failed > 0) process.exitCode = 1
  } finally {
    await pool.end()
  }
}

main().catch((err: unknown) => {
  console.error('[bienvenue] échec :', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
