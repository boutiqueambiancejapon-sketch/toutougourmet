import type { ComponentType } from 'react'
import { getBrandBySlug } from '@/data/brands'
import { IconBowl, IconDog, IconHeart, IconPaw, IconScale, IconTarget, type IconProps } from '@/components/icons'
import { AffiliateNote } from './AffiliateNote'
import { frTypo } from '@/lib/utils'

// @cdc 04-pages — « Quelle marque pour ton chien ? » par profil (audit design-cro §3) : une marque,
// une raison vérifiable, un seul lien partenaire. Chaque raison reprend un fait déjà publié (source en
// commentaire). Pas de donnée, pas de profil. Marque absente ou en rupture : ligne masquée.

interface Profile {
  id: string
  label: string
  Icon: ComponentType<IconProps>
  slug: string
  why: string
}

const PROFILES: Profile[] = [
  {
    // Source : data/brands.ts (pros Dog Chef : ration recalculée quand le poids change).
    id: 'surpoids',
    label: 'Chien en surpoids',
    Icon: IconScale,
    slug: 'dog-chef',
    why: 'La ration est calculée sur le profil du chien et recalculée quand son poids change.',
  },
  {
    // Source : data/brands.ts (pros mono-protéine) et fiche Franklin (recette Canard, Pomme & Carotte).
    id: 'allergique',
    label: 'Allergie ou digestion sensible',
    Icon: IconHeart,
    slug: 'franklin',
    why: "Une seule source de viande par recette, par exemple le canard seul : plus simple pour écarter un allergène.",
  },
  {
    // Source : content/blog/avis-dogfy-diet-repas-frais-chien.mdx (appétence citée dans les avis Trustpilot).
    id: 'difficile',
    label: 'Chien difficile',
    Icon: IconBowl,
    slug: 'dogfy-diet',
    why: 'Dans les avis Trustpilot, ces repas cuits sous vide reviennent souvent comme mieux acceptés que les croquettes.',
  },
  {
    // Source : content/blog/avis-ultra-premium-direct.mdx (3 à 5 € le kg, vente directe).
    id: 'budget',
    label: 'Petit budget',
    Icon: IconTarget,
    slug: 'ultra-premium-direct',
    why: 'Vendues en direct, ces croquettes coûtent 3 à 5 € le kilo selon la gamme.',
  },
  {
    // Source : content/blog/avis-ultra-premium-direct.mdx (FAQ « chiot de grande race », recette N°2).
    id: 'chiot-grande-race',
    label: 'Chiot de grande race',
    Icon: IconDog,
    slug: 'ultra-premium-direct',
    why: 'La recette N°2 vise les chiots de plus de 25 kg adultes, avec un rapport calcium et phosphore contrôlé.',
  },
  {
    // Source : data/brands.ts (pros « Boosters ciblés : Puppy… ») et fiche Dog Chef (Puppy Booster).
    id: 'chiot',
    label: 'Chiot de petite ou moyenne race',
    Icon: IconPaw,
    slug: 'dog-chef',
    why: 'Le Puppy Booster ajoute calcium et phosphore à une ration calculée sur le poids adulte estimé.',
  },
  {
    // Source : fiche Elmut (menu Saumon & Brocoli : 65 % de poisson, oméga-3 EPA et DHA).
    id: 'senior',
    label: 'Chien senior',
    Icon: IconPaw,
    slug: 'elmut',
    why: "Le menu Saumon & Brocoli contient 65 % de poisson, source d'oméga-3 EPA et DHA.",
  },
]

export function BrandProfiles() {
  const rows = PROFILES.flatMap((p) => {
    const brand = getBrandBySlug(p.slug)
    return brand && !brand.stockNote ? [{ ...p, brand }] : []
  })
  return (
    <section aria-labelledby="quelle-marque" className="v2 flex flex-col gap-4">
      <div className="flex max-w-prose flex-col gap-2">
        <h2 id="quelle-marque" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">
          Quelle marque pour ton chien&nbsp;?
        </h2>
        <p className="m-0 text-ink-2">Une marque par situation, la raison en une phrase, et le lien vers son offre.</p>
      </div>
      <ul role="list" className="m-0 list-none border-t border-line p-0">
        {rows.map(({ id, label, Icon, brand, why }) => (
          <li key={id} className="grid gap-2 border-b border-line py-5 md:grid-cols-[240px_1fr_auto] md:items-center md:gap-8">
            <p className="m-0 flex items-center gap-3 font-display text-lg font-black leading-tight text-ink">
              <Icon className="size-7 shrink-0" />
              {label}
            </p>
            <p className="m-0 leading-relaxed text-ink-2">
              <strong className="font-semibold text-ink">{brand.name}.</strong> {frTypo(why)}
            </p>
            <div data-cta={`brand-profil-${id}`}>
              <a
                href={brand.affiliateUrl}
                target="_blank"
                rel="sponsored noopener"
                className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold text-orange-ink underline underline-offset-4 hover:text-ink"
              >
                Voir l&apos;offre {brand.name}&nbsp;→
              </a>
            </div>
          </li>
        ))}
      </ul>
      <AffiliateNote single={false} />
    </section>
  )
}
