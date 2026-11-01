// Types et calcul de la preuve sociale du bandeau StickyCta (séparés du composant client).

export type StickyCtaBadgeColor = 'rose' | 'green' | 'blue' | 'amber'

/**
 * Un tier = un seuil + un template + le nom du champ JSON à lire dans la réponse
 * de l'endpoint. Les tiers sont évalués dans l'ordre, le premier qui matche est
 * affiché. La logique honnête : si « today » a 5 events, on dit « 5 aujourd'hui »
 * (pas « 5 dans la dernière heure »), car la valeur vient réellement du window
 * « today ».
 */
export interface DynamicSocialProofTier {
  /** Champ à lire dans la réponse JSON (ex: 'today', 'last_7d', 'last_30d', 'all_time') */
  field: string
  /** Affiche ce tier uniquement si count >= minCount */
  minCount: number
  /** Template avec {count} (nombre formaté FR) et {plural} ("s" si count >= 2 sinon "") */
  template: string
}

export interface DynamicSocialProofConfig {
  /** Endpoint qui retourne un objet `{ field: number }` selon les fields référencés par les tiers */
  endpoint: string
  /** Tiers évalués dans l'ordre — le premier qui matche est utilisé */
  tiers: DynamicSocialProofTier[]
}

export interface StickyCtaConfig {
  /** Marque ou titre principal (affiché toujours, mobile inclus) */
  brandName: string
  /** Destination — peut être URL externe (https://) ou route interne (/outils/...) */
  url: string
  /** Phrase d'accroche (tronquée sur mobile) — garde < 60 chars */
  label: string
  /** Pastille promo (ex. "-35%", "GRATUIT") — affichée si présente, mobile inclus */
  badge?: string
  /** Couleur du badge — défaut: rose (promo/alerte). green : gratuit · blue : info · amber : nouveau */
  badgeColor?: StickyCtaBadgeColor
  /** Code promo affiché après le label */
  code?: string
  /** Ligne preuve sociale statique (ordinateur seulement). Ex : "★★★★★ 4.8/5 · 7 800+ avis Trustpilot" */
  socialProof?: string
  /** Preuve sociale dynamique — fetch côté client, remplace `socialProof` dès qu'un tier matche. */
  dynamicSocialProof?: DynamicSocialProofConfig
  /** Override du libellé du bouton — défaut: "J'en profite →" si code, "Acheter →" sinon */
  buttonLabel?: string
  /** Sous-label discret sous le bouton (ordinateur seulement). Ex : "Sans inscription · 2 min" */
  subButton?: string
}

/** Formate `{count}` (nombre FR) et `{plural}` ("s" si count >= 2). */
function formatDynamicTemplate(template: string, count: number): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(count)
  const plural = count >= 2 ? 's' : ''
  return template.replace(/\{count\}/g, formatted).replace(/\{plural\}/g, plural)
}

/** Premier tier dont le compteur atteint minCount, formaté ; sinon null. */
export function pickDynamicTier(data: Record<string, number>, tiers: DynamicSocialProofTier[]): string | null {
  for (const tier of tiers) {
    const count = data[tier.field]
    if (typeof count === 'number' && count >= tier.minCount) {
      return formatDynamicTemplate(tier.template, count)
    }
  }
  return null
}
