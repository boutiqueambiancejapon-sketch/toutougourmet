import { buildMonthlyNewsletter, type MonthlyNewsletter, type TopFood } from '@/lib/emails/monthly'
import { unsubscribeUrlFromEnv } from '@/lib/emails/unsubscribe'
import { welcomeEmail } from '@/lib/emails/welcome'
import { ensureWelcomeAttribute, markWelcomeSent, welcomeAlreadySent } from './brevo-newsletter'
import { getPool } from './db'
import { sendTransactionalEmail } from './mailer'

// @cdc e-mails — envois de la lettre côté site : bienvenue (une fois par adresse, trace dans
// l'attribut Brevo WELCOME_SENT, jamais bloquant), tests vers NEWSLETTER_TEST_EMAIL, croquette du mois.
// Sans BREVO_API_KEY, BREVO_SENDER_EMAIL ou NEWSLETTER_SECRET : rien n'est envoyé.

export type WelcomeResult = 'sent' | 'already' | 'skipped' | 'error'

const inFlight = new Set<string>()

export function newsletterMailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL && process.env.NEWSLETTER_SECRET)
}

function listUnsubscribeHeaders(url: string): Record<string, string> {
  return { 'List-Unsubscribe': `<${url}>` }
}

/**
 * E-mail de bienvenue après une inscription réussie. L'attribut est posé AVANT l'envoi : en cas
 * d'échec d'envoi, l'adresse ne reçoit rien plutôt que deux fois. Ne lève jamais d'erreur.
 */
export async function sendWelcomeOnce(rawEmail: string): Promise<WelcomeResult> {
  const email = rawEmail.trim().toLowerCase()
  const unsubscribe = unsubscribeUrlFromEnv(email)
  if (!newsletterMailConfigured() || !unsubscribe) return 'skipped'
  if (inFlight.has(email)) return 'already'
  inFlight.add(email)
  try {
    await ensureWelcomeAttribute()
    const sent = await welcomeAlreadySent(email)
    if (sent !== false) return sent === true ? 'already' : 'error'
    await markWelcomeSent(email)
    const mail = welcomeEmail(unsubscribe)
    await sendTransactionalEmail({ to: email, ...mail, headers: listUnsubscribeHeaders(unsubscribe), kind: 'bienvenue', tags: ['lettre-bienvenue'] })
    return 'sent'
  } catch (err) {
    console.error('[newsletter] bienvenue non envoyée', err instanceof Error ? err.message : err)
    return 'error'
  } finally {
    inFlight.delete(email)
  }
}

/** Croquette relue la mieux notée parmi les fiches créées ou relues dans les 30 jours avant `date`. */
export async function loadTopFood(date: Date): Promise<TopFood | null> {
  const pool = getPool()
  if (!pool) return null
  const { rows } = await pool.query<{ slug: string; brand: string | null; product: string | null; score: number }>(
    `SELECT slug, brand, product, score FROM app.food_analysis
      WHERE reviewed = true AND score IS NOT NULL AND updated_at >= $1::timestamptz - interval '30 days' AND updated_at <= $1::timestamptz
      ORDER BY score DESC, scan_count DESC LIMIT 1`,
    [date.toISOString()],
  )
  return rows[0] ?? null
}

/** Lettre complète pour l'aperçu et le script mensuel, croquette du mois lue en base. */
export async function monthlyNewsletterFor(date: Date, unsubscribeUrl?: string): Promise<MonthlyNewsletter> {
  const topFood = await loadTopFood(date).catch((err: unknown) => {
    console.error('[newsletter] croquette du mois', err instanceof Error ? err.message : err)
    return null
  })
  return buildMonthlyNewsletter(date, { topFood, unsubscribeUrl })
}

export type TestKind = 'bienvenue' | 'lettre'

/** Envoi de test en transactionnel vers NEWSLETTER_TEST_EMAIL (jamais vers la liste). */
export async function sendTestEmail(kind: TestKind, date: Date): Promise<'ok' | 'config' | 'error'> {
  const to = process.env.NEWSLETTER_TEST_EMAIL
  const unsubscribe = to ? unsubscribeUrlFromEnv(to) : null
  if (!to || !unsubscribe || !newsletterMailConfigured()) return 'config'
  try {
    const mail = kind === 'bienvenue' ? welcomeEmail(unsubscribe) : await monthlyNewsletterFor(date, unsubscribe)
    await sendTransactionalEmail({
      to,
      subject: `[Test] ${mail.subject}`,
      html: mail.html,
      text: mail.text,
      headers: listUnsubscribeHeaders(unsubscribe),
      kind: 'test',
      tags: ['lettre-test'],
    })
    return 'ok'
  } catch (err) {
    console.error('[newsletter] test non envoyé', err instanceof Error ? err.message : err)
    return 'error'
  }
}
