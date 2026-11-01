// @cdc mesure — événements Plausible (objectifs à créer dans le tableau de bord Plausible
// avec ces noms exacts). Sans Plausible chargé, l'appel est mis en file puis ignoré.

export type AnalyticsEvent =
  | 'Affiliate Click'
  | 'Tool Result'
  | 'Newsletter Signup'
  | 'Food Search'
  | 'Quiz Complete'

type Props = Record<string, string | number | boolean>

declare global {
  interface Window {
    plausible?: ((event: string, options?: { props?: Props }) => void) & { q?: unknown[] }
  }
}

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === 'undefined') return
  window.plausible?.(event, { props: { page: window.location.pathname, ...props } })
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
    [/c3po\.link\//, 'Autre (c3po)'],
  ]
  return rules.find(([re]) => re.test(href))?.[1] ?? null
}
