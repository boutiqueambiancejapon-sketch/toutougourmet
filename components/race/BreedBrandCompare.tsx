import type { ReactNode } from 'react'
import { readGroups, type BrandGroupProps, type BrandRowProps } from './compare-data'
import { CompareMobile } from './CompareMobile'
import { CompareTable } from './CompareTable'
import { Disclosure } from './CompareBits'

// @cdc affiliation — comparatif des marques des fiches races, sous le H2 « Quelles marques pour
// un … ? ». Rendu serveur. Usage MDX (props texte seulement, le MDX bloque les expressions JS) :
//
// <BreedBrandCompare breed="Carlin" weight="7 kg">
//   <BrandGroup label="Repas frais · pour les Carlins fragiles">
//     <BrandRow brand="dog-chef" fit="tres-adapte" pick price="1,40 à 1,90 €" reason="…" />
//     <BrandRow brand="dogfy-diet" fit="adapte" reason="…" warning="…" />
//   </BrandGroup>
// </BreedBrandCompare>
//
// Mobile : « Notre choix » en grande carte, puis les autres en lignes. Ordinateur : un tableau.
// Une marque non partenaire (brand="Nom") est affichée sans bouton.

interface BreedBrandCompareProps {
  /** Nom de la race tel qu'écrit dans l'article (« Carlin », « Berger Allemand ») */
  breed: string
  /** Poids du chien pour lequel l'article chiffre le prix par jour */
  weight?: string
  children?: ReactNode
}

export function BreedBrandCompare({ breed, weight, children }: BreedBrandCompareProps) {
  const groups = readGroups(children)
  if (!groups.length) return null
  const priced = groups.some((g) => g.rows.some((r) => r.price))
  return (
    <div data-cta="race-compare" className="v2 not-prose my-6">
      {priced && weight ? (
        <p className="m-0 mb-3 text-sm text-ink-2">
          Prix par jour pour un {breed} de {weight}.
        </p>
      ) : null}
      <CompareMobile groups={groups} priced={priced} />
      <CompareTable groups={groups} breed={breed} priced={priced} />
      <Disclosure />
    </div>
  )
}

/** Marqueur lu par BreedBrandCompare : un profil (« Repas frais · … »). */
export function BrandGroup(props: BrandGroupProps): null {
  void props
  return null
}

/** Marqueur lu par BreedBrandCompare : une marque. */
export function BrandRow(props: BrandRowProps): null {
  void props
  return null
}
