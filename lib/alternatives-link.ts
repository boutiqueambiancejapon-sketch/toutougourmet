import { brands } from '@/data/brands'
import { extractToc } from '@/lib/article-toc'
import { partnerSlugFromName } from '@/data/partner-discounts'
import type { Article } from '@/lib/mdx'

// @cdc cro-carte — avis d'une marque sans offre de notre part (Royal Canin, Acana…) : un lien vers les
// alternatives dès le haut de la page, sans chiffre ni remise (audit mobile 2026-11-04 : premier bouton
// partenaire à 5 391 px). Cible : la section de l'article qui propose une marque partenaire, sinon le
// hub des marques. Les avis d'un partenaire ont leur barre collante (lib/sticky-cta-config.ts).

export interface AlternativesLinkData {
  href: string
  brandName?: string
}

const PARTNER_CTA = /<BrandCTA\b[^>]*?\bbrandName=["']([^"']+)/g
const HUB = '/chien/marque'

function isOurBrand(name: string): boolean {
  return partnerSlugFromName(name) !== null || brands.some((b) => name.startsWith(b.name))
}

/** Section de l'article qui contient la première offre partenaire. */
function partnerSection(rawContent: string): string | null {
  for (const match of rawContent.matchAll(PARTNER_CTA)) {
    if (!partnerSlugFromName(match[1])) continue
    const heading = extractToc(rawContent.slice(0, match.index)).at(-1)
    if (heading) return `#${heading.id}`
  }
  return null
}

export function getAlternativesLink({ slug, frontmatter, rawContent }: Article): AlternativesLinkData | null {
  if (frontmatter.categorySlug !== 'avis-marques' || !slug.startsWith('avis-')) return null
  const brandName = frontmatter.affiliateA?.name ?? frontmatter.review?.brand
  if (brandName && isOurBrand(brandName)) return null
  return { href: partnerSection(rawContent) ?? HUB, brandName }
}
