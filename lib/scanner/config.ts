// @cdc lot 6 — réglages du scanner (quotas, limites, affichage). Valeurs par défaut modifiables
// par variables d'environnement côté serveur.

/** Analyses par mois et par compte gratuit. Une analyse resservie depuis le cache ne compte pas. */
export const FREE_MONTHLY_SCANS = Number(process.env.SCANNER_FREE_MONTHLY) || 5
/** Analyses par mois avec Premium (gratuit pendant le lancement). Lu via scanLimitFor() côté serveur. */
export const PREMIUM_MONTHLY_SCANS = Number(process.env.SCANNER_PREMIUM_MONTHLY) || 50

export function monthlyScanLimit(plan: 'free' | 'premium'): number {
  return plan === 'premium' ? PREMIUM_MONTHLY_SCANS : FREE_MONTHLY_SCANS
}

/** Taille maximale d'une photo reçue, en octets (contrôlée dans le navigateur ET sur le serveur). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_IMAGES = 3
/** Côté le plus long après redimensionnement (navigateur et serveur). */
export const MAX_IMAGE_SIDE = 2000

/** Limite de débit par compte, en plus du quota mensuel. */
export const RATE_LIMITS = [
  { windowMs: 60_000, max: 3 },
  { windowMs: 24 * 60 * 60_000, max: 20 },
] as const

/** Le bloc « Derniers scans » de /scanner n'apparaît qu'à partir de ce nombre d'analyses distinctes. */
export const RECENT_SCANS_MIN_DISTINCT = Number(process.env.SCANNER_RECENT_MIN) || 5
export const RECENT_SCANS_SHOWN = 8

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const
