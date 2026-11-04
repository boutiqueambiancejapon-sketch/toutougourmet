// @cdc guide — mémoire du panneau du guide (components/guide/GuidePopup.tsx), dans le navigateur
// seulement (localStorage et sessionStorage, aucun cookie) :
// - dernière apparition : le panneau ne revient pas avant 7 jours ;
// - inscription réussie (guide, lettre ou e-mail de résultat d'outil) : il ne revient plus ;
// - début de la visite : compte les 40 s passées sur le site, d'une page à l'autre.
// Panneau ouvert : html[data-popup] et l'événement « tg-popup », lus par le bandeau collant
// (components/blog/StickyBar.tsx) pour ne jamais s'afficher en même temps.

const SHOWN_KEY = 'tg-guide-popup-at'
const SUBSCRIBED_KEY = 'tg-subscribed'
const VISIT_KEY = 'tg-visit-start'
export const POPUP_EVENT = 'tg-popup'
export const POPUP_EVERY_MS = 7 * 24 * 60 * 60 * 1000

function read(storage: 'localStorage' | 'sessionStorage', key: string): string | null {
  try {
    return window[storage].getItem(key)
  } catch {
    return null
  }
}

function write(storage: 'localStorage' | 'sessionStorage', key: string, value: string): void {
  try {
    window[storage].setItem(key, value)
  } catch {
    // Navigation privée stricte : la règle vaut pour la page en cours.
  }
}

export function shownRecently(now = Date.now()): boolean {
  const at = Number(read('localStorage', SHOWN_KEY))
  return Number.isFinite(at) && at > 0 && now - at < POPUP_EVERY_MS
}

export function rememberShown(): void {
  write('localStorage', SHOWN_KEY, String(Date.now()))
}

export function isSubscribed(): boolean {
  return read('localStorage', SUBSCRIBED_KEY) !== null
}

/** À appeler après chaque inscription réussie (guide, lettre, e-mail de résultat). */
export function rememberSubscribed(): void {
  write('localStorage', SUBSCRIBED_KEY, String(Date.now()))
}

/** Millisecondes passées sur le site depuis le début de la visite (onglet en cours). */
export function msOnSite(now = Date.now()): number {
  const start = Number(read('sessionStorage', VISIT_KEY))
  if (Number.isFinite(start) && start > 0) return now - start
  write('sessionStorage', VISIT_KEY, String(now))
  return 0
}

/** Bandeau cookies ouvert (components/consent/ConsentBanner.tsx) : la barre partenaire attend qu'il soit fermé. */
export const CONSENT_BANNER_EVENT = 'tg-consent-banner'

export function isConsentBannerOpen(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.consentBanner === '1'
}

export function setConsentBannerOpen(open: boolean): void {
  if (open) document.documentElement.dataset.consentBanner = '1'
  else delete document.documentElement.dataset.consentBanner
  window.dispatchEvent(new Event(CONSENT_BANNER_EVENT))
}

export function isPopupOpen(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.popup === '1'
}

export function setPopupOpen(open: boolean): void {
  if (open) document.documentElement.dataset.popup = '1'
  else delete document.documentElement.dataset.popup
  window.dispatchEvent(new Event(POPUP_EVENT))
}
