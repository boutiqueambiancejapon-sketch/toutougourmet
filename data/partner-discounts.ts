// @cdc affiliation — seule source des remises partenaires affichées sur le site : fiches marque
// (data/brands.ts), offres du compte (lib/account-offers.ts), boutons BrandCTA des articles,
// comparatifs, e-mails. Remises confirmées par le propriétaire (DECISIONS.md, 2026-11-02).
// Toute autre remise affichée est une erreur : la corriger ici, jamais à la main dans un composant.

export type OfferSlug = 'dog-chef' | 'dogfy-diet' | 'elmut' | 'franklin' | 'ultra-premium-direct'

/** Remises confirmées le 2026-11-02. null : pas de remise affichée. */
export const CONFIRMED_DISCOUNTS: Record<OfferSlug, string | null> = {
  'dog-chef': "−30 % sur la box d'essai, livraison gratuite",
  'dogfy-diet': "−50 % sur la box d'essai de 14 jours",
  elmut: '−40 % sur la première commande',
  franklin: '−30 % en abonnement',
  'ultra-premium-direct': '−20 % sur la première commande en abonnement',
}

/** Remise courte pour une pastille : « −30 % ». Chaîne vide sans remise. */
export function shortDiscount(slug: OfferSlug): string {
  return CONFIRMED_DISCOUNTS[slug]?.match(/^−\d+ %/)?.[0] ?? ''
}

export function isOfferSlug(value: string): value is OfferSlug {
  return Object.hasOwn(CONFIRMED_DISCOUNTS, value)
}

const NAME_PREFIXES: [string, OfferSlug][] = [
  ['Franklin', 'franklin'],
  ['Dog Chef', 'dog-chef'],
  ['Dogfy', 'dogfy-diet'],
  ['Elmut', 'elmut'],
  ['Ultra Premium', 'ultra-premium-direct'],
]

/** Partenaire désigné par un nom de bouton (« Franklin Light Dinde… » → franklin), sinon null. */
export function partnerSlugFromName(name: string): OfferSlug | null {
  return NAME_PREFIXES.find(([prefix]) => name.startsWith(prefix))?.[1] ?? null
}
