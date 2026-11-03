import { Children, isValidElement, type ReactNode } from 'react'
import { getBrandBySlug } from '@/data/brands'
import { CONFIRMED_DISCOUNTS, type OfferSlug } from '@/lib/account-offers'

// @cdc affiliation — données du comparatif des fiches races (maquette races, version A + carte B
// pour « Notre choix » sur mobile). Une seule source pour les offres : nom et lien dans
// data/brands.ts, remise dans CONFIRMED_DISCOUNTS (lib/account-offers.ts). Les textes propres à
// la race (profil, adéquation, raison, mise en garde, prix) viennent de l'article, en props MDX.

/**
 * Adéquation, résumée depuis le texte de l'article :
 * - tres-adapte : l'article la recommande pour le point faible de la race, sans réserve ;
 * - adapte : recommandée avec une condition ou une mise en garde, ou pour une partie des chiens ;
 * - correct : l'article écrit « correct » ou demande de vérifier avant de choisir.
 */
export type Fit = 'tres-adapte' | 'adapte' | 'correct'

export const FIT_LABELS: Record<Fit, string> = {
  'tres-adapte': 'Très adapté',
  adapte: 'Adapté',
  correct: 'Correct',
}

export interface BrandRowProps {
  /** Slug partenaire (lib/account-offers.ts) ou nom d'une marque non partenaire (sans bouton) */
  brand: string
  /** Format affiché sous le nom, sinon celui du tableau des articles */
  format?: string
  fit: Fit
  /** Une ligne, reprise de l'article */
  reason: string
  /** Mise en garde de l'article (en rose) */
  warning?: string
  /** Prix par jour repris de l'article, ex. « 1,40 à 1,90 € » */
  price?: string
  /** « Notre choix » : une seule marque par comparatif */
  pick?: boolean
}

export interface BrandGroupProps {
  label: string
  children?: ReactNode
}

export interface CompareOffer {
  url: string
  discount: string | null
  code: string | null
}

export interface CompareRow {
  key: string
  name: string
  format: string
  fit: Fit
  reason: string
  warning?: string
  price?: string
  pick: boolean
  /** null : marque non partenaire, citée sans bouton */
  offer: CompareOffer | null
}

export interface CompareGroup {
  label: string
  rows: CompareRow[]
}

/** Formats des tableaux des fiches races, quand l'article n'en donne pas d'autre. */
const DEFAULT_FORMAT: Record<OfferSlug, string> = {
  'dog-chef': 'Repas frais livré',
  elmut: 'Repas frais livré',
  'dogfy-diet': 'Repas frais livré',
  franklin: 'Croquettes premium',
  'ultra-premium-direct': 'Croquettes premium',
}

function isOfferSlug(value: string): value is OfferSlug {
  return Object.hasOwn(CONFIRMED_DISCOUNTS, value)
}

function toRow(props: BrandRowProps): CompareRow {
  const base = { fit: props.fit, reason: props.reason, warning: props.warning, price: props.price, pick: Boolean(props.pick) }
  const brand = isOfferSlug(props.brand) ? getBrandBySlug(props.brand) : undefined
  if (!brand || !isOfferSlug(props.brand)) {
    return { ...base, key: props.brand, name: props.brand, format: props.format ?? '', offer: null }
  }
  return {
    ...base,
    key: brand.slug,
    name: brand.name,
    format: props.format ?? DEFAULT_FORMAT[props.brand],
    offer: { url: brand.affiliateUrl, discount: CONFIRMED_DISCOUNTS[props.brand], code: brand.discountCode },
  }
}

/** Lit les <BrandGroup> et <BrandRow> écrits dans le MDX (props seulement : le MDX bloque le JS). */
export function readGroups(children: ReactNode): CompareGroup[] {
  const groups: CompareGroup[] = []
  Children.forEach(children, (group) => {
    if (!isValidElement<BrandGroupProps>(group) || typeof group.props.label !== 'string') return
    const rows: CompareRow[] = []
    Children.forEach(group.props.children, (row) => {
      if (isValidElement<BrandRowProps>(row) && typeof row.props.brand === 'string') rows.push(toRow(row.props))
    })
    if (rows.length) groups.push({ label: group.props.label, rows })
  })
  return groups
}
