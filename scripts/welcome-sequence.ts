// Suite de bienvenue : chaque jour, envoie à chaque adresse l'étape due, une seule fois par étape
// et par adresse. Inscrit sans compte : J2 la ration, J4 créer un compte (rappel), J7 l'offre du
// moment (code interne j5), J10 le scanner. Compte confirmé sans chien : J1 et J4 ajouter son chien
// (rappels). Tâche quotidienne : deploy/toutou-welcome.timer (10 h 17, heure de Paris).
//
// Garde-fous :
//   - rien ne part sans WELCOME_EMAIL_ENABLED=1 ni WELCOME_SEQUENCE_START=AAAA-MM-JJ (vide = rien) ;
//   - les 3 rappels ne partent pas sans ACCOUNT_REMINDERS_ENABLED=1 (textes à valider) ;
//   - seuls les contacts et les comptes créés ce jour-là ou après sont concernés ;
//   - trace par étape dans analytics.welcome_sends (empreinte HMAC, jamais l'adresse), posée
//     avant l'envoi, retirée si l'envoi échoue ;
//   - au plus 300 envois par jour (DAILY_CAP), un seul e-mail par adresse et par jour, rien le jour
//     de la lettre mensuelle (premier mardi : la suite reprend le lendemain) ;
//   - adresse désinscrite (liste Brevo, analytics.email_optouts) exclue ;
//   - journal sans adresse en clair (repère #empreinte).
//
// Lancer depuis la racine du site, variables de /srv/toutou/shared/.env chargées :
//   node_modules/.bin/tsx scripts/welcome-sequence.ts                 (envoi)
//   … --dry                    affiche le plan, n'écrit rien, n'envoie rien, HTML dans /tmp
//   … --today=2026-11-20       simule le jour d'exécution
// BREVO_DRY_RUN=1 : contacts fictifs (@example.invalid) au lieu de la liste Brevo.
// Aperçus : tableau de bord, /tableau-de-bord/emails/suite/j2 et /emails/relances/chien-j1.

import { writeFileSync } from 'node:fs'
import { REMINDER_STEPS, accountRemindersEnabled, reminderEmail, type ReminderStep } from '../lib/emails/account-reminders'
import type { EmailKind } from '../lib/emails/email-kinds'
import { isFirstTuesday, parisDate } from '../lib/emails/schedule'
import { unsubscribeUrlFromEnv } from '../lib/emails/unsubscribe'
import { WELCOME_STEPS, welcomeStepEmail, type WelcomeStep } from '../lib/emails/welcome-sequence'
import { getPool } from '../lib/server/db'
import { flushEmailLog } from '../lib/server/email-log'
import { readOptOuts } from '../lib/server/email-optouts'
import { sendTransactionalEmail } from '../lib/server/mailer'
import {
  DAILY_CAP,
  brevoOptedOut,
  capOnePerDay,
  claimStep,
  emailHash,
  fakeContacts,
  fetchAccounts,
  fetchListContacts,
  receivedToday,
  releaseStep,
  sentSteps,
  sentToday,
  sequenceStart,
  shortId,
  stepForAddress,
  type SequenceStep,
} from '../lib/server/welcome-sequence'

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const today = args.find((a) => a.startsWith('--today='))?.slice('--today='.length) ?? parisDate(new Date())
const log = (msg: string) => console.log(`[bienvenue] ${msg}`)
const ALL_STEPS: readonly SequenceStep[] = [...WELCOME_STEPS, ...REMINDER_STEPS]
const isReminder = (step: SequenceStep): step is ReminderStep => (REMINDER_STEPS as readonly string[]).includes(step)
const kindOf = (step: SequenceStep): EmailKind => (isReminder(step) ? step : (`suite-${step satisfies WelcomeStep}` as EmailKind))
const mailFor = (step: SequenceStep, unsubscribe: string) => (isReminder(step) ? reminderEmail(step, unsubscribe) : welcomeStepEmail(step, unsubscribe, new Date(`${today}T12:00:00Z`)))

async function main(): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error(`--today invalide : ${today}`)
  const start = sequenceStart(process.env.WELCOME_SEQUENCE_START)
  if (!start) return log('WELCOME_SEQUENCE_START vide ou invalide : rien à envoyer.')
  if (!dry && process.env.WELCOME_EMAIL_ENABLED !== '1') return log('WELCOME_EMAIL_ENABLED différent de 1 : rien à envoyer.')
  if (isFirstTuesday(today)) return log('premier mardi : la lettre mensuelle part ce soir, la suite reprend demain.')
  const secret = process.env.NEWSLETTER_SECRET
  if (!secret) throw new Error('NEWSLETTER_SECRET absent (lien de désinscription impossible)')
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent')

  try {
    const fake = process.env.BREVO_DRY_RUN === '1'
    const contacts = fake ? fakeContacts(today, start) : await fetchListContacts()
    const accounts = await fetchAccounts(pool)
    const optOuts = await readOptOuts(pool)
    const reminders = accountRemindersEnabled() && optOuts !== null
    if (accountRemindersEnabled() && !optOuts) log('table email_optouts absente : aucun rappel de compte aujourd\'hui (appliquer db/analytics.sql).')

    const byEmail = new Map(contacts.map((c) => [c.email.trim().toLowerCase(), c]))
    const emails = [...new Set([...byEmail.keys(), ...(reminders ? accounts.keys() : [])])]
    const hashes = new Map(emails.map((email) => [email, emailHash(email, secret)]))
    const sent = await sentSteps(pool, [...hashes.values()])
    let budget = Math.max(0, DAILY_CAP - (await sentToday(pool)))
    log(`${today} · départ ${start} · ${contacts.length} contacts${fake ? ' fictifs' : ''}, ${accounts.size} comptes · rappels ${reminders ? 'actifs' : 'coupés'} · ${budget} envois possibles aujourd'hui${dry ? ' · à blanc' : ''}`)

    const due: { email: string; hash: string; step: SequenceStep }[] = []
    for (const email of emails) {
      const hash = hashes.get(email) ?? ''
      const contact = byEmail.get(email)
      const step = stepForAddress(
        {
          contact: contact ? { createdAt: contact.createdAt, blacklisted: contact.blacklisted } : null,
          account: accounts.get(email) ?? null,
          sent: sent.get(hash) ?? new Set(),
          optedOut: optOuts?.has(hash) ?? false,
        },
        { today, start, reminders },
      )
      if (step) due.push({ email, hash, step })
    }
    const { kept: plan, postponed } = capOnePerDay(due, await receivedToday(pool))
    if (postponed > 0) log(`${postponed} adresses ont déjà reçu un e-mail aujourd'hui : reportées à demain`)
    for (const step of ALL_STEPS) log(`${step} : ${plan.filter((p) => p.step === step).length} à envoyer`)
    if (plan.length > budget) log(`plafond de ${DAILY_CAP} par jour : ${plan.length - budget} reportés à demain`)

    const counts = { sent: 0, already: 0, failed: 0, unsubscribed: 0 }
    for (const p of plan) {
      if (budget <= 0) break
      const unsubscribe = unsubscribeUrlFromEnv(p.email)
      if (!unsubscribe) throw new Error('NEWSLETTER_SECRET absent')
      const mail = mailFor(p.step, unsubscribe)
      if (dry) {
        log(`${p.step} → ${shortId(p.hash)} · « ${mail.subject} »`)
        budget--
        continue
      }
      try {
        // Compte hors de la liste : Brevo seul sait s'il s'est désinscrit d'une campagne.
        if (p.step.startsWith('chien-') && !fake && (await brevoOptedOut(p.email))) {
          counts.unsubscribed++
          continue
        }
        if (!(await claimStep(pool, p.hash, p.step))) {
          counts.already++
          continue
        }
      } catch (err) {
        counts.failed++
        log(`${p.step} reporté → ${shortId(p.hash)} : ${err instanceof Error ? err.message : String(err)}`)
        continue
      }
      budget--
      try {
        await sendTransactionalEmail({
          to: p.email,
          ...mail,
          headers: { 'List-Unsubscribe': `<${unsubscribe}>` },
          kind: kindOf(p.step),
          tags: [isReminder(p.step) ? `rappel-${p.step}` : `lettre-bienvenue-${p.step}`],
        })
        counts.sent++
        log(`${p.step} envoyé → ${shortId(p.hash)}`)
      } catch (err) {
        counts.failed++
        await releaseStep(pool, p.hash, p.step).catch(() => undefined)
        log(`${p.step} échec → ${shortId(p.hash)} : ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    if (dry) {
      for (const step of ALL_STEPS) {
        const out = `/tmp/welcome-${step}.html`
        writeFileSync(out, mailFor(step, 'https://www.toutou-gourmet.com/newsletter/desinscription?apercu').html)
        log(`aperçu ${step} : ${out}`)
      }
      return log('--dry : rien écrit en base, rien envoyé.')
    }
    log(`terminé : ${counts.sent} envoyés, ${counts.already} déjà partis, ${counts.unsubscribed} désinscrits, ${counts.failed} échecs.`)
    if (counts.failed > 0) process.exitCode = 1
  } finally {
    await flushEmailLog()
    await pool.end()
  }
}

main().catch((err: unknown) => {
  console.error('[bienvenue] échec :', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
