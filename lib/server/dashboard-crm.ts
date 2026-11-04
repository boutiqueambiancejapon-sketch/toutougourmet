import type { Pool } from 'pg'
import type { TrackingRow } from '@/lib/dashboard/email-tracking'
import { parisDate } from '@/lib/emails/schedule'
import type { AccountDetail } from './dashboard-account-detail'
import { getPool } from './db'
import { emailHash, emailHashSecret } from './email-hash'
import { accountRemindersEnabled } from '@/lib/emails/account-reminders'
import { nextStepFor, sequenceStart, type PlanOptions, type SequenceStep } from './welcome-sequence'

// @cdc tableau de bord — lectures propres au CRM. Les adresses viennent de loadContactRows, lue à
// l'affichage ; rien n'est recopié dans notre base.

/** Compte revenu : session active ces 30 jours, un jour au moins après la création du compte. */
export async function getReturnedCount(pool: Pool): Promise<number> {
  const res = await pool.query<{ n: number }>(
    `SELECT count(DISTINCT u.id)::int AS n FROM app."user" u JOIN app.session s ON s.user_id = u.id
      WHERE s.updated_at >= now() - interval '30 days' AND s.updated_at >= u.created_at + interval '1 day'`,
  )
  return res.rows[0]?.n ?? 0
}

export function planOptions(now = new Date()): PlanOptions | null {
  const start = sequenceStart(process.env.WELCOME_SEQUENCE_START)
  return start ? { today: parisDate(now), start, reminders: accountRemindersEnabled() } : null
}

export function nextForRow(r: TrackingRow, options: PlanOptions | null): { step: string; inDays: number } | null {
  if (!options) return null
  return nextStepFor(
    {
      contact: r.listedAt ? { createdAt: r.listedAt.toISOString(), blacklisted: r.listStatus === 'desinscrit' } : null,
      account: r.account ? { createdAt: r.account.createdAt.toISOString(), verified: r.account.verified, hasDog: r.account.dogs > 0 } : null,
      sent: new Set(r.sentSteps as SequenceStep[]),
      optedOut: r.optedOut,
    },
    options,
  )
}

/** Prochain e-mail de la fiche d'un compte : lu par empreinte, sans parcourir toute la liste. Brevo illisible : rien d'annoncé. */
export async function nextForDetail(detail: AccountDetail): Promise<{ step: string; inDays: number } | null> {
  const options = planOptions()
  const pool = getPool()
  if (!options || !pool || detail.letter.state === 'unknown' || detail.dogs === null) return null
  try {
    const hash = emailHash(detail.core.email, emailHashSecret())
    const [steps, opt] = await Promise.all([
      pool.query<{ step: string }>('SELECT step FROM analytics.welcome_sends WHERE email_hash = $1', [hash]),
      pool.query('SELECT 1 FROM analytics.email_optouts WHERE email_hash = $1', [hash]),
    ])
    const { letter, core, dogs } = detail
    return nextStepFor(
      {
        contact: letter.state !== 'absent' && letter.createdAt ? { createdAt: letter.createdAt, blacklisted: letter.state === 'unsubscribed' } : null,
        account: { createdAt: core.createdAt.toISOString(), verified: core.verified, hasDog: dogs.length > 0 },
        sent: new Set(steps.rows.map((r) => r.step as SequenceStep)),
        optedOut: (opt.rowCount ?? 0) > 0,
      },
      options,
    )
  } catch {
    return null
  }
}
