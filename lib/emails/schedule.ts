// @cdc e-mails — calendrier de la lettre : envoi le premier mardi du mois à 18 h, heure de Paris.
// La campagne est créée la veille. Dates « civiles » au format AAAA-MM-JJ, calculées à Paris.

export const SEND_HOUR = 18
const TZ = 'Europe/Paris'

/** Date civile à Paris (AAAA-MM-JJ) d'un instant. */
export function parisDate(instant: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant)
}

/** Ajoute des jours à une date civile. */
export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Vrai si la date civile est le premier mardi de son mois. */
export function isFirstTuesday(day: string): boolean {
  const d = new Date(`${day}T12:00:00Z`)
  return d.getUTCDay() === 2 && d.getUTCDate() <= 7
}

/** Premier mardi du mois à partir de `day` inclus (cherche sur 40 jours). */
export function nextFirstTuesday(day: string): string {
  for (let i = 0; i < 40; i++) {
    const candidate = addDays(day, i)
    if (isFirstTuesday(candidate)) return candidate
  }
  throw new Error('premier mardi introuvable')
}

/** Décalage de Paris par rapport à UTC à un instant, en minutes (60 l'hiver, 120 l'été). */
function parisOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(instant)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
  return Math.round((asUtc - instant.getTime()) / 60_000)
}

/** Instant de l'envoi (18 h à Paris le jour donné) et sa forme ISO avec décalage, pour Brevo. */
export function sendInstant(day: string): { date: Date; iso: string } {
  const guess = new Date(`${day}T${String(SEND_HOUR).padStart(2, '0')}:00:00Z`)
  const offset = parisOffsetMinutes(guess)
  const date = new Date(guess.getTime() - offset * 60_000)
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const iso = `${day}T${String(SEND_HOUR).padStart(2, '0')}:00:00${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
  return { date, iso }
}
