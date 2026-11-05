// @cdc mesure — chaque action part dans notre propre base via POST /api/e (tableau de bord
// maison). sendBeacon survit à la navigation, donc un
// clic sur un lien partenaire est bien enregistré même si la page change aussitôt.

import type { AnalyticsEvent } from './analytics-events'
import { pageTypeOf } from './page-type'

export type { AnalyticsEvent }

type Props = Record<string, string | number | boolean>

// @cdc mesure — chaque action (hors page vue, dont le type se déduit du chemin) porte le type de
// page de la carte des conversions (lib/page-type.ts) : clic partenaire, invitation compte vue ou
// cliquée, inscription, résultat d'outil, téléchargement… Un `pageType` passé à la main l'emporte.
export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === 'undefined') return
  try {
    const path = window.location.pathname
    const withType = event === 'Pageview' ? props : { pageType: pageTypeOf(path), ...props }
    const payload = JSON.stringify({ n: event, p: path, r: document.referrer, props: withType })
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
    [/c3po\.link\/QqJYNnzYD8|ultrapremiumdirect\.com\/.*ae=1346/, 'Ultra Premium Direct'],
    [/tidd\.ly\/(4jT3Tqg|42O6yHG)/, 'Dogfy Diet'],
    [/tidd\.ly\/(48rl0Z3|43sUPyF)/, 'Fidelis'],
    [/(amzn\.to|amazon\.fr\/.*tag=(toutougourmet|ambiancejap0a))/, 'Amazon'],
    // Les autres liens tidd.ly sont des fiches Maxi Zoo (Royal Canin, Eukanuba…)
    [/tidd\.ly\/|awin1\.com\/(cread\.php\?awinmid=68698|pclick\.php\?[^#]*m=68698)/, 'Maxi Zoo'],
    [/c3po\.link\//, 'Autre (c3po)'],
  ]
  return rules.find(([re]) => re.test(href))?.[1] ?? null
}
