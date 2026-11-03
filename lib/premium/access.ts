// @cdc premium — règle d'accès à Premium, sans base ni Stripe (testée par scripts/test-stripe-premium.ts).
// - Abonnement Stripe : actif si le statut est `active` ou `trialing`, et aussi `past_due` (Stripe
//   relance le paiement pendant sa période de grâce ; à la fin des relances il passe l'abonnement
//   en `canceled` ou `unpaid`, et l'accès s'arrête).
// - Premium du lancement (`launch-free`) : actif tant que PREMIUM_LAUNCH_ENDS_AT n'est pas passé
//   (sans date configurée, il reste actif).

export const ACCESS_STATUSES = ['active', 'trialing', 'past_due'] as const

export interface AccessRow {
  plan: string
  source: string
  status: string | null
}

export function subscriptionGivesAccess(status: string | null | undefined): boolean {
  return !!status && (ACCESS_STATUSES as readonly string[]).includes(status)
}

export function hasPremiumAccess(row: AccessRow | null | undefined, now: Date, launchEndsAt: Date | null): boolean {
  if (!row) return false
  if (row.source === 'stripe') return subscriptionGivesAccess(row.status)
  if (row.source === 'launch-free') return row.plan === 'premium' && (launchEndsAt === null || now < launchEndsAt)
  return false
}

/** PREMIUM_LAUNCH_ENDS_AT : date ISO (« 2027-02-01 » ou « 2027-01-31T23:59:59+01:00 »), sinon null. */
export function parseLaunchEnd(value: string | undefined): Date | null {
  if (!value) return null
  const d = new Date(value.trim())
  return Number.isNaN(d.getTime()) ? null : d
}

export function launchEndsAt(): Date | null {
  return parseLaunchEnd(process.env.PREMIUM_LAUNCH_ENDS_AT)
}

/** Stripe exige une fin d'essai au moins 48 h plus tard ; marge d'une heure. */
const MIN_TRIAL_MS = 49 * 60 * 60 * 1000

/**
 * Compte Premium du lancement qui s'abonne avant la fin de la gratuité : le premier prélèvement
 * attend PREMIUM_LAUNCH_ENDS_AT (fin d'essai de l'abonnement Stripe). null sinon.
 */
export function launchTrialEnd(row: Pick<AccessRow, 'plan' | 'source'> | null | undefined, launchEnd: Date | null, now = new Date()): Date | null {
  if (row?.source !== 'launch-free' || row.plan !== 'premium' || !launchEnd) return null
  return launchEnd.getTime() - now.getTime() > MIN_TRIAL_MS ? launchEnd : null
}
