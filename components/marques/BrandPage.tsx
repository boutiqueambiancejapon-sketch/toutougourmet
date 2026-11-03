import Link from 'next/link'
import { brandOfferLabel, type Brand } from '@/data/brands'
import { brandDescriptions, brandFaqs, brandRecipes, brandVerdicts, fullReviews, relatedComparatifs } from '@/data/brand-content'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { frTypo } from '@/lib/utils'
import { getPromoPage, promoPath } from '@/data/promo-codes'
import { shortDiscount, isOfferSlug } from '@/data/partner-discounts'
import { BrandHero, BrandIdentity } from './BrandHero'
import { BrandPresentation, BrandProsCons, BrandRecipes } from './BrandDetails'
import { BrandVerdict } from './BrandVerdict'
import { StickyBrandCTA } from './StickyBrandCTA'

// @cdc 04-pages — fiche marque V2 (/chien/marque/[slug]) : en-tête, bande encre d'identité,
// présentation, points forts et limites, recettes, un seul CTA principal, FAQ, liens utiles.
// JSON-LD : FAQPage + Product sans aggregateRating (aucune note client vérifiable).

const SITE = 'https://www.toutou-gourmet.com'

export function BrandPage({ brand }: { brand: Brand }) {
  const faqs = brandFaqs[brand.slug] ?? []
  const verdict = brandVerdicts[brand.slug] ?? brand.tagline
  // Page « code promo » du partenaire, en tête : c'est le lien le plus cherché (« code promo X »).
  const promo = isOfferSlug(brand.slug) && getPromoPage(brand.slug) ? [{ href: promoPath(brand.slug), label: `Code promo ${brand.name} : ${shortDiscount(brand.slug)}, mode d'emploi` }] : []
  const links = [
    ...promo,
    ...(fullReviews[brand.slug] ? [fullReviews[brand.slug]] : []),
    ...(relatedComparatifs[brand.slug] ?? []).map((c) => ({ href: `/chien/marque/${c.slug}`, label: c.label })),
    { href: '/comparateur', label: 'Comparer les 6 marques' },
    { href: '/chien/marque', label: 'Quelle marque pour ton chien ?' },
  ]
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: brand.name,
    brand: { '@type': 'Brand', name: brand.name },
    description: brand.tagline,
    url: `${SITE}/chien/marque/${brand.slug}`,
  }

  return (
    <>
      {faqs.length > 0 ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-6 pb-24 md:px-8 md:pt-10">
        <div className="flex flex-col gap-6">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Guides', href: '/chien' }, { label: 'Marques', href: '/chien/marque' }, { label: brand.name }]} />
          <BrandHero brand={brand} />
          <BrandIdentity brand={brand} />
        </div>
        <BrandPresentation brand={brand} paragraphs={brandDescriptions[brand.slug] ?? []} />
        <BrandProsCons brand={brand} />
        <BrandRecipes brand={brand} recipes={brandRecipes[brand.slug] ?? []} />
        <BrandVerdict brand={brand} verdict={frTypo(verdict)} />

        {faqs.length > 0 ? (
          <section aria-labelledby="faq" className="flex max-w-prose flex-col gap-2">
            <h2 id="faq" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">Questions fréquentes sur {brand.name}</h2>
            <FaqList>
              {faqs.map((f) => (
                <FaqItem key={f.q} question={frTypo(f.q)}>
                  <p className="m-0">{frTypo(f.a)}</p>
                </FaqItem>
              ))}
            </FaqList>
          </section>
        ) : null}

        <nav aria-label="Pour aller plus loin" className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-xl font-black text-ink">Pour aller plus loin</h2>
          <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-semibold text-orange-ink underline underline-offset-4 hover:text-ink">{frTypo(l.label)}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {brand.stockNote ? null : <StickyBrandCTA brandName={brand.name} affiliateUrl={brand.affiliateUrl} offer={brandOfferLabel(brand)} />}
    </>
  )
}
