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
  'Scan Result',
  'Scan Share',
  'Scan Download',
  'Pageview',
] as const

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
