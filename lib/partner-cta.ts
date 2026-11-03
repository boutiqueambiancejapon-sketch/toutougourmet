import { affiliateBrand } from '@/lib/analytics'
import { getBrandBySlug } from '@/data/brands'
import { partnerSlugFromName, shortDiscount } from '@/data/partner-discounts'

// @cdc affiliation — libellé du bouton d'une offre partenaire, à partir du seul lien : un code
// promo connu (data/brands.ts › discountCode, aujourd'hui Dog Chef seulement) donne « Voir le
// code promo » ; une remise par lien (data/partner-discounts.ts) donne « Profiter de −50 % » ;
// sinon le libellé d'origine du composant. Aucune remise ni aucun code écrits ailleurs.

export interface PartnerCta {
  /** Code à copier au clic, null quand la remise passe par le lien */
  code: string | null
  /** Libellé du bouton */
  label: string
}

export const CODE_LABEL = 'Voir le code promo'

export function partnerCta(href: string, fallback: string): PartnerCta {
  const name = affiliateBrand(href)
  const slug = name ? partnerSlugFromName(name) : null
  if (!slug) return { code: null, label: fallback }
  const code = getBrandBySlug(slug)?.discountCode ?? null
  if (code) return { code, label: CODE_LABEL }
  const discount = shortDiscount(slug)
  return { code: null, label: discount ? `Profiter de ${discount.replace(' ', ' ')}` : fallback }
}
