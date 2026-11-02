// @cdc mesure — chaque action part à deux endroits : Plausible (si chargé) et notre propre
// base via POST /api/e (tableau de bord maison). sendBeacon survit à la navigation, donc un
// clic sur un lien partenaire est bien enregistré même si la page change aussitôt.

import type { AnalyticsEvent } from './analytics-events'

export type { AnalyticsEvent }

type Props = Record<string, string | number | boolean>

declare global {
  interface Window {
    plausible?: ((event: string, options?: { props?: Props }) => void) & { q?: unknown[] }
  }
}

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === 'undefined') return
  window.plausible?.(event, { props: { page: window.location.pathname, ...props } })
  try {
    const payload = JSON.stringify({ n: event, p: window.location.pathname, r: document.referrer, props })
    const blob = new Blob([payload], { type: 'application/json' })
    if (!navigator.sendBeacon?.('/api/e', blob)) {
      void fetch('/api/e', { method: 'POST', body: payload, keepalive: true, cache: 'no-store' })
    }
  } catch {
    // La mesure ne doit jamais casser la page.
  }
}

/** Marque d'un lien partenaire, sinon null. */
export function affiliateBrand(href: string): string | null {
  const rules: [RegExp, string][] = [
    [/dogchef\.com\/fr\/code/, 'Dog Chef'],
    [/c3po\.link\/QWMW4k6mbU/, 'Elmut'],
    [/c3po\.link\/(Q3xbJhfapn|QdMASYq2T2)/, 'Franklin'],
    [/c3po\.link\/QqJYNnzYD8/, 'Ultra Premium Direct'],
    [/tidd\.ly\/(4jT3Tqg|42O6yHG)/, 'Dogfy Diet'],
    [/tidd\.ly\/(48rl0Z3|43sUPyF)/, 'Fidelis'],
    [/(amzn\.to|amazon\.fr\/.*tag=toutougourmet)/, 'Amazon'],
    [/tidd\.ly\/3PnVz4E/, 'Maxi Zoo'],
    [/tidd\.ly\//, 'Autre (tidd.ly)'],
    [/c3po\.link\//, 'Autre (c3po)'],
  ]
  return rules.find(([re]) => re.test(href))?.[1] ?? null
}
