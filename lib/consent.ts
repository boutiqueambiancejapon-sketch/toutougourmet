// @cdc legal — consentement à la mesure Google Analytics (CNIL) : choix gardé 6 mois dans le
// navigateur (localStorage, pas de cookie), « Refuser » aussi simple que « Accepter ».
// Sans choix ou après un refus, GA4 reste en mode « refusé » (aucun cookie déposé).

export type ConsentChoice = 'granted' | 'denied'

const KEY = 'tg-consent'
const MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000
export const CONSENT_OPEN_EVENT = 'tg-consent-open'

type Gtag = (...args: unknown[]) => void

export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const { v, at } = JSON.parse(raw) as { v?: unknown; at?: unknown }
    if ((v !== 'granted' && v !== 'denied') || typeof at !== 'number' || Date.now() - at > MAX_AGE_MS) return null
    return v
  } catch {
    return null
  }
}

/** Transmet le choix à GA4 (Consent Mode). Les stockages publicitaires restent toujours refusés. */
export function applyConsent(choice: ConsentChoice): void {
  const gtag = (window as Window & { gtag?: Gtag }).gtag
  gtag?.('consent', 'update', { analytics_storage: choice })
}

export function saveConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: choice, at: Date.now() }))
  } catch {
    // Navigation privée stricte : le choix vaut pour la page en cours.
  }
  applyConsent(choice)
}
