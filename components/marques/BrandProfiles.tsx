import type { ComponentType } from 'react'
import Link from 'next/link'
import { getBrandBySlug, brandTone } from '@/data/brands'
import { IconBowl, IconDog, IconHeart, IconScale, IconTarget, type IconProps } from '@/components/icons'

// @cdc 04-pages — choix des marques par profil de chien (audit design-cro §3 « Marques et comparateur »).
// Chaque raison reprend un fait déjà publié : data/brands.ts, fiches marques ou tests de la rubrique Avis.

interface Pick {
  slug: string
  why: string
}

interface Profile {
  label: string
  Icon: ComponentType<IconProps>
  picks: Pick[]
}

const PROFILES: Profile[] = [
  {
    label: 'Chien en surpoids',
    Icon: IconScale,
    picks: [
      { slug: 'franklin', why: 'La recette Light contient 64 % de dinde et 11 % de matières grasses, pour un surpoids modéré.' },
      { slug: 'dog-chef', why: 'Les portions sont calculées sur le profil du chien et se réajustent quand son poids change.' },
    ],
  },
  {
    label: 'Chien allergique ou sensible',
    Icon: IconHeart,
    picks: [
      { slug: 'franklin', why: "Une seule source de viande par recette, ce qui simplifie l'éviction d'un allergène." },
    ],
  },
  {
    label: 'Chien difficile',
    Icon: IconBowl,
    picks: [
      { slug: 'dogfy-diet', why: 'Dans les avis Trustpilot, ces repas cuits sous vide sont souvent jugés plus appétents que des croquettes.' },
    ],
  },
  {
    label: 'Budget serré',
    Icon: IconTarget,
    picks: [
      { slug: 'ultra-premium-direct', why: "La vente directe ramène le prix jusqu'à 40 % sous celui de marques équivalentes en animalerie." },
    ],
  },
  {
    label: 'Chiot',
    Icon: IconDog,
    picks: [
      { slug: 'dog-chef', why: 'Le Puppy Booster ajoute calcium et phosphore, avec une ration calculée sur le poids adulte estimé.' },
    ],
  },
]

export function BrandProfiles() {
  return (
    <section aria-labelledby="choisir-selon-ton-chien" className="v2 mb-14 flex flex-col gap-4">
      <div className="flex max-w-prose flex-col gap-1">
        <h2 id="choisir-selon-ton-chien" className="m-0 font-display text-2xl font-black text-ink">Choisir selon ton chien</h2>
        <p className="m-0 text-ink-2">Une ou deux marques par situation, et la raison. Les liens partenaires sont sur chaque fiche.</p>
      </div>
      <ul role="list" className="m-0 flex list-none flex-col p-0">
        {PROFILES.map(({ label, Icon, picks }) => (
          <li key={label} className="grid gap-3 border-b border-line py-4 md:grid-cols-[220px_1fr] md:gap-6">
            <p className="m-0 flex items-center gap-2 font-display text-lg font-black text-ink">
              <Icon className="size-6 shrink-0" />
              {label}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {picks.map(({ slug, why }) => {
                const brand = getBrandBySlug(slug)
                if (!brand) return null
                const tone = brandTone(slug)
                return (
                  <Link
                    key={slug}
                    href={`/chien/marque/${slug}`}
                    className="flex flex-col gap-1 rounded-box p-4 no-underline hover:outline hover:outline-2 hover:outline-line-2"
                    style={{ background: tone.bg }}
                  >
                    <span className="font-semibold" style={{ color: tone.ink }}>{brand.name} →</span>
                    <span className="text-sm leading-snug text-ink-2">{why}</span>
                  </Link>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
