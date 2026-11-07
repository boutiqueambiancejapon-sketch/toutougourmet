// @cdc mesure — noms d'événements partagés entre le navigateur (lib/analytics.ts)
// et la route serveur POST /api/e.

export const ANALYTICS_EVENTS = [
  'Affiliate Click',
  'Tool Result',
  'Newsletter Signup',
  'Food Search',
  'Quiz Complete',
  'Account Signup',
  'Premium Activated',
  'Scan Barcode',
  'Food Saved',
  'Assistant Question',
  'Assistant Signup Asked',
  'Assistant Open',
  'Scan Result',
  'Scan Share',
  'Scan Download',
  'Account Invite View',
  'Account Invite Click',
  'Guide Signup',
  'Guide Download',
  'Guide Popup View',
  'Tool Email Sent',
  'Sitter Sheet Started',
  'Sitter Sheet Created',
  'Sitter Template Download',
  'Pageview',
] as const

/**
 * Écrits par le serveur seulement (lib/server/signup-source.ts), jamais acceptés de /api/e :
 * un visiteur ne peut pas gonfler les comptes créés ou confirmés.
 */
export const SERVER_EVENTS = ['Account Created', 'Account Verified', 'Dog Added', 'Account Return'] as const

export type ServerEvent = (typeof SERVER_EVENTS)[number]

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

export function isAnalyticsEvent(name: unknown): name is AnalyticsEvent {
  return typeof name === 'string' && (ANALYTICS_EVENTS as readonly string[]).includes(name)
}

/** Robots et outils automatiques : leurs appels ne comptent pas comme des actions. */
export const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|python|curl|wget|httpclient|preview/i

export function deviceOf(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobi|iphone|android/i.test(ua)) return 'mobile'
  return 'desktop'
}
