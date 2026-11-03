import type { Pool } from 'pg'
import type { Period } from '@/lib/dashboard/period'

// @cdc tableau de bord — « Premium payant » (onglet Conversions) : paiements commencés, abonnements
// actifs et fins d'abonnement sur la période, écrits par le serveur (lib/server/premium-events.ts),
// avec la formule (mois ou année). Abonnés actifs aujourd'hui : lus dans app.membership.

export interface PremiumCounts {
  started: number
  subscribed: number
  canceled: number
}

export interface PremiumData {
  total: PremiumCounts
  byInterval: { interval: string; counts: PremiumCounts }[]
  /** Abonnés Stripe actifs (active, trialing, past_due) ; null si la migration 0009 manque */
  activeNow: number | null
  launchNow: number
}

const ZERO: PremiumCounts = { started: 0, subscribed: 0, canceled: 0 }

export const EMPTY_PREMIUM: PremiumData = { total: ZERO, byInterval: [], activeNow: null, launchNow: 0 }

interface Row extends PremiumCounts {
  interval: string
}

export async function getPremium(pool: Pool, period: Period): Promise<PremiumData> {
  const events = await pool.query<Row>(
    `SELECT coalesce(props->>'interval', 'inconnu') AS interval,
            count(*) FILTER (WHERE name = 'Premium Checkout Started')::int AS started,
            count(*) FILTER (WHERE name = 'Premium Subscribed')::int AS subscribed,
            count(*) FILTER (WHERE name = 'Premium Canceled')::int AS canceled
     FROM analytics.events
     WHERE name IN ('Premium Checkout Started', 'Premium Subscribed', 'Premium Canceled') AND ts >= now() - $1::interval
     GROUP BY 1 ORDER BY 1`,
    [period.interval],
  )
  const ready = await pool.query<{ ok: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app' AND table_name = 'membership' AND column_name = 'status') AS ok`,
  )
  const members = ready.rows[0]?.ok
    ? await pool.query<{ active: number; launch: number }>(
        `SELECT count(*) FILTER (WHERE source = 'stripe' AND status IN ('active', 'trialing', 'past_due'))::int AS active,
                count(*) FILTER (WHERE source = 'launch-free' AND plan = 'premium')::int AS launch
         FROM app.membership`,
      )
    : await pool.query<{ active: null; launch: number }>(
        `SELECT NULL::int AS active, count(*) FILTER (WHERE plan = 'premium')::int AS launch FROM app.membership`,
      )
  const total = events.rows.reduce<PremiumCounts>(
    (acc, r) => ({ started: acc.started + r.started, subscribed: acc.subscribed + r.subscribed, canceled: acc.canceled + r.canceled }),
    ZERO,
  )
  return {
    total,
    byInterval: events.rows.map((r) => ({ interval: r.interval, counts: { started: r.started, subscribed: r.subscribed, canceled: r.canceled } })),
    activeNow: members.rows[0]?.active ?? null,
    launchNow: members.rows[0]?.launch ?? 0,
  }
}
