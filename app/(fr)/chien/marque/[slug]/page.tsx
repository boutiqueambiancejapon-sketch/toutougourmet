import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { brands, brandOfferLabel, getBrandBySlug, getDuelPairs, DUEL_BRAND_SLUGS, type Brand } from '@/data/brands'
import { getComparatif } from '@/lib/mdx'
import { BrandPage } from '@/components/marques/BrandPage'
import { BrandDuel } from '@/components/marques/BrandDuel'
import { ComparatifEditorial } from '@/components/marques/ComparatifEditorial'

// @cdc 04-pages — route /chien/marque/[slug] : fiche marque, duel éditorial MDX ou duel automatique.

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const brandSlugs = brands.map((b) => ({ slug: b.slug }))
  // Duels : seulement les paires qui existaient déjà (pas de nouveau duel pour les marques ajoutées).
  const vsSlugs = getDuelPairs().map(([a, b]) => ({ slug: `${a.slug}-vs-${b.slug}` }))
  return [...brandSlugs, ...vsSlugs]
}

const isDuelBrand = (b: Brand | undefined): b is Brand => !!b && DUEL_BRAND_SLUGS.includes(b.slug)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (slug.includes('-vs-')) {
    const [slugA, slugB] = slug.split('-vs-')
    const a = getBrandBySlug(slugA)
    const b = getBrandBySlug(slugB)
    if (!isDuelBrand(a) || !isDuelBrand(b)) return {}
    return {
      title: `${a.name} vs ${b.name} : comparatif 2026`,
      description: `Comparaison ${a.name} vs ${b.name} : composition, prix, fabrication, livraison et verdict. Quelle marque choisir pour ton chien ?`,
      alternates: { canonical: `https://www.toutou-gourmet.com/chien/marque/${slug}` },
    }
  }

  const brand = getBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: `${brand.name} : avis, prix, code promo`,
    description: `Avis ${brand.name} : composition, prix, avantages et inconvénients. ${brandOfferLabel(brand)}.`,
    alternates: { canonical: `https://www.toutou-gourmet.com/chien/marque/${slug}` },
  }
}

export default async function MarqueOrVsPage({ params }: Props) {
  const { slug } = await params

  if (slug.includes('-vs-')) {
    const comparatif = getComparatif(slug)
    if (comparatif) {
      return (
        <ComparatifEditorial
          comparatif={comparatif}
          brandA={getBrandBySlug(comparatif.frontmatter.brandA)}
          brandB={getBrandBySlug(comparatif.frontmatter.brandB)}
        />
      )
    }
    const brandA = brands.find((b) => slug.startsWith(b.slug + '-vs-'))
    const brandB = getBrandBySlug(brandA ? slug.replace(brandA.slug + '-vs-', '') : '')
    if (!isDuelBrand(brandA) || !isDuelBrand(brandB)) notFound()
    return <BrandDuel brandA={brandA} brandB={brandB} />
  }

  const brand = getBrandBySlug(slug)
  if (!brand) notFound()
  return <BrandPage brand={brand} />
}
