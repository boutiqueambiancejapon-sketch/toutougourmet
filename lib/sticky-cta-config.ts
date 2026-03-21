// @cdc affiliation — fallback sticky CTA quand l'article n'a pas d'affiliateA en frontmatter
import type { StickyCtaConfig } from '@/components/blog/StickyCta'

export type { StickyCtaConfig }

export const DOG_CHEF_CTA: StickyCtaConfig = {
  brandName: 'Dog Chef',
  url: 'https://www.dogchef.com/fr/code/WZU7090',
  label: 'repas frais personnalisés',
  badge: '-35%',
  code: 'WZU7090',
}
