// @cdc affiliation — bandeau collant (StickyBar) des articles : où il a le droit de paraître
// (stickyAllowed, en bas de ce fichier, carte des conversions du 2026-11-03), puis quelle offre
// servir quand l'article n'a pas d'affiliateA en frontmatter (getStickyCtaForArticle).
// Hors des pages de choix d'achat, le bandeau ne paraît plus : les branches Bien Nourri
// ci-dessous ne servent plus que de repli.

import type { StickyCtaConfig } from '@/components/blog/StickyCta'
import type { StickyOfferProps } from '@/components/blog/StickyOffer'
import { pageTypeOf } from '@/lib/page-type'
import { brandOfferLabel, getBrandBySlug, type Brand } from '@/data/brands'
import { compactDiscount, isOfferSlug, partnerSlugFromName, shortDiscount, type OfferSlug } from '@/data/partner-discounts'

export type { StickyCtaConfig }

/** Blocs d'offre où s'efface la barre d'une marque (StickyOffer). */
const STOP_RACE_COMPARE = '[data-cta="race-compare"]'
const STOP_ARTICLE_OFFER = '.mdx-content [data-cta^="brand-"]'
const STOP_PRODUCT_PICKS = '[data-cta="avis-produit"]'
export const STOP_BRAND_PAGE = '[data-cta="brand-fiche"]'

// ────────────────────────────────────────────────────────────
// Configs individuels
// ────────────────────────────────────────────────────────────

/**
 * Dog Chef — CTA commercial principal.
 */
export const DOG_CHEF_CTA: StickyCtaConfig = {
  brandName: 'Dog Chef',
  url: 'https://www.dogchef.com/fr/code/WZU7090',
  label: 'le menu sur-mesure pour ton chien',
  badge: shortDiscount('dog-chef'),
  code: 'WZU7090',
  socialProof: '★★★★★ 4.8/5 · 7 800+ avis Trustpilot',
  buttonLabel: 'Calculer →',
  subButton: 'Livraison incluse · sans engagement',
}

/**
 * Conservé pour usage interne. Le bilan Bien Nourri recommande Dog Chef depuis le 2026-11-04
 * (data/bien-nourri.ts → recommend()).
 */
export const ELMUT_CTA: StickyCtaConfig = {
  brandName: 'Elmut',
  url: 'https://c3po.link/QWMW4k6mbU',
  label: 'repas frais cuisinés en France',
  badge: shortDiscount('elmut'),
  socialProof: 'Repas frais · cuisson douce',
  buttonLabel: 'Essayer →',
  subButton: 'Livraison réfrigérée incluse',
}

/**
 * Soft CTA — pour articles à intent éducative / safety / anxiogène
 * (Urgences, Santé, "chien peut manger X", "chien mange X").
 *
 * Compteur dynamique multi-fenêtres :
 * La route /api/bien-nourri-count compte les événements « Tool Result »
 * (tool = bien-nourri) de notre base analytics.events sur 4 fenêtres réelles
 * (today / last_7d / last_30d / all_time). Les tiers ci-dessous sont évalués
 * dans l'ordre — le PREMIER qui dépasse son seuil est affiché. Comme chaque
 * valeur vient de SA vraie fenêtre, le framing « aujourd'hui » /
 * « cette semaine » / « ce mois » est strictement honnête.
 *
 * STRATÉGIE COLD START : pas de tier all_time low-threshold (qui aurait affiché
 * « Déjà 1 bilan depuis le lancement » et fait paraître le site mort). Le
 * silence est préféré à un faible volume. Quand un tier crosse son seuil, il
 * apparaît — et c'est forcément un chiffre qui valorise.
 *
 * Logique des seuils :
 *  - today >= 3        → activité quotidienne perceptible
 *  - last_7d >= 15     → ~2/jour sur la semaine = site vivant
 *  - last_30d >= 50    → ~1.6/jour sur le mois = adoption régulière
 *  - sinon             → rien d'affiché (cold start)
 *
 * Suivi cold start : le tableau de bord maison (/tableau-de-bord, liste des
 * outils) compte les bilans dès le premier. Ne dépend pas du sticky pour
 * savoir où on en est.
 */
export const BIEN_NOURRI_CTA: StickyCtaConfig = {
  brandName: 'Nourrissez-vous bien votre toutou ?',
  url: '/outils/bien-nourri',
  label: 'diagnostic + 3 axes à améliorer en 2 min',
  badge: 'GRATUIT',
  badgeColor: 'green',
  buttonLabel: 'Faites le test →',
  subButton: 'Sans inscription · 2 min',
  dynamicSocialProof: {
    endpoint: '/api/bien-nourri-count',
    tiers: [
      {
        field: 'today',
        minCount: 3,
        template: 'Déjà {count} bilans réalisés aujourd\'hui',
      },
      {
        field: 'last_7d',
        minCount: 15,
        template: 'Déjà {count} bilans réalisés cette semaine',
      },
      {
        field: 'last_30d',
        minCount: 50,
        template: 'Déjà {count} bilans réalisés ce mois',
      },
      // Pas de fallback all_time low-threshold. Si aucun tier ne matche,
      // le compteur reste caché — c'est volontaire (cf. doc ci-dessus).
    ],
  },
}

// ────────────────────────────────────────────────────────────
// Routing intent-based
// ────────────────────────────────────────────────────────────

export interface CtaBrandPair {
  label: string
  href: string
}

export type StickyCtaSelection =
  | { kind: 'single'; config: StickyCtaConfig }
  | {
      kind: 'double'
      eyebrow: string
      subProof?: string
      brandA: CtaBrandPair
      brandB: CtaBrandPair
    }

/**
 * Slugs qui basculent en CTA Bien Nourri (intent éducation/safety) même
 * quand la catégorie n'est pas Urgences/Santé.
 *
 * Couvre les ~100 articles "chien peut manger X" (poire, banane, raisin…) et
 * les ~12 articles "chien mange X" (herbe, couche, glands, chocolat…) — qui
 * sont taggés Alimentation mais en intent éducation/safety, pas en intent achat.
 */
function isEducationalSafetySlug(slug: string): boolean {
  return slug.startsWith('chien-peut-manger-') || slug.startsWith('chien-mange-')
}

/**
 * Mapping (`category`, `slug`) → sticky CTA à servir.
 *
 * Ordre de priorité dans les pages article :
 *   1. Article a `affiliateA + affiliateB` en frontmatter → StickyCtaDouble (override marqué)
 *   2. Article a `affiliateA` seul → StickyCta avec le config issu du frontmatter
 *   3. Fallback → cette fonction (intent-based, single CTA toujours)
 */
export function getStickyCtaForArticle(category: string, slug: string): StickyCtaSelection {
  // Articles éducatifs/safety/santé/anxiogènes → bilan gratuit (pas de marque pushée)
  if (
    category === 'Urgences & Intoxications' ||
    category === 'Santé' ||
    isEducationalSafetySlug(slug)
  ) {
    return { kind: 'single', config: BIEN_NOURRI_CTA }
  }

  // Tout le reste → Dog Chef enrichi (phase quick-win single CTA)
  return { kind: 'single', config: DOG_CHEF_CTA }
}

// ────────────────────────────────────────────────────────────
// Où le bandeau a le droit d'apparaître (carte des conversions, 2026-11-03)
// ────────────────────────────────────────────────────────────

interface StickyAllowedInput {
  categorySlug: string
  slug: string
  /** Contenu MDX brut : une carte offre (<BrandCTA>) ou un comparatif race y est-il déjà ? */
  rawContent: string
  /** L'encart du milieu pousse déjà une marque partenaire (lien externe) */
  midIsPartner: boolean
}

const OFFER_IN_ARTICLE = /<(BrandCTA|BreedBrandCompare)\b/

/**
 * @cdc cro-carte — règle la plus sobre : le bandeau noir collé en bas ne sert qu'aux pages de choix
 * d'achat (nutrition, croquettes, marques, avis), objectif « clic partenaire » de la carte, et
 * seulement quand aucune offre n'est déjà sur la page (carte BrandCTA, comparatif race, encart du
 * milieu partenaire) : jamais deux fois la même demande. Jamais sur les urgences, les aliments,
 * la santé, les races (barre StickyOffer à la place, voir getStickyOffer), les recettes ni les autres articles.
 */
export function stickyAllowed({ categorySlug, slug, rawContent, midIsPartner }: StickyAllowedInput): boolean {
  if (pageTypeOf(`/chien/${categorySlug}/${slug}`) !== 'nutrition-marques') return false
  if (SENSITIVE_SLUG.test(slug)) return false
  return !midIsPartner && !OFFER_IN_ARTICLE.test(rawContent)
}

// ────────────────────────────────────────────────────────────
// Barre d'une seule marque (StickyOffer), demande du propriétaire du 2026-11-04
// ────────────────────────────────────────────────────────────

/** Maladie rangée hors de la rubrique santé : aucune barre, quelle qu'elle soit. */
const SENSITIVE_SLUG = /diarrhee|vomi|pancreatite|diabet|renale?|cancer|epilepsie|cardiaque|foie|hepat|maladie/

const BRAND_ROW = /<BrandRow\b((?:"[^"]*"|'[^']*'|[^'">])*)>/g
const BRAND_CTA_NAME = /<BrandCTA\b[^>]*?\bbrandName=["']([^"']+)/g

/** Marque `pick` du comparatif d'une fiche race, quelle qu'elle soit (décision du propriétaire) : une seule, sinon rien. */
function racePick(rawContent: string): Brand | null {
  const picks = [...rawContent.matchAll(BRAND_ROW)]
    .map((m) => m[1])
    .filter((attrs) => /\bpick\b/.test(attrs.replace(/"[^"]*"|'[^']*'/g, '')))
  if (picks.length !== 1) return null
  return getBrandBySlug(/\bbrand=["']([^"']+)/.exec(picks[0])?.[1] ?? '') ?? null
}

/** Sujet d'un avis ou d'un comparatif s'il est partenaire et seul partenaire proposé sur la page. */
function reviewedPartner(rawContent: string, mainBrand: string | undefined, twoBrands: boolean): OfferSlug | null {
  if (twoBrands || !mainBrand) return null
  const slug = partnerSlugFromName(mainBrand)
  if (!slug) return null
  for (const [, name] of rawContent.matchAll(BRAND_CTA_NAME)) {
    const other = partnerSlugFromName(name)
    if (other && other !== slug) return null
  }
  return slug
}

interface StickyOfferInput {
  categorySlug: string
  slug: string
  rawContent: string
  verdict?: string
  /** Marque de l'article selon son frontmatter (affiliateA, sinon review.brand) */
  mainBrand?: string
  /** Le frontmatter nomme deux marques (affiliateB) : pas de marque principale */
  twoBrands: boolean
  /** Complément : le produit Maxi Zoo qui correspond au sujet (frontmatter stickyProduct) */
  stickyProduct?: { name: string; url: string }
}

/**
 * @cdc cro-carte — seules les fiches races à comparatif et les avis ou comparatifs de la rubrique
 * avis-marques passent ici : urgences, aliments, santé et maladies en sont exclus. Race : la marque
 * `pick`. Avis : le sujet s'il est le seul partenaire de la page, avec une remise dans
 * CONFIRMED_DISCOUNTS. Sinon null et la page garde sa règle (stickyAllowed). Elle remplace l'interdit « races » de stickyAllowed : la barre s'efface
 * dès que l'offre de la page arrive, donc jamais deux fois la même demande à l'écran.
 */
export function getStickyOffer({ categorySlug, slug, rawContent, verdict, mainBrand, twoBrands, stickyProduct }: StickyOfferInput): StickyOfferProps | null {
  if (verdict === 'danger' || SENSITIVE_SLUG.test(slug)) return null
  if (stickyProduct) return { brandName: stickyProduct.name, href: stickyProduct.url, offer: 'Chez Maxi Zoo', stopAt: STOP_PRODUCT_PICKS }
  const isRace = pageTypeOf(`/chien/${categorySlug}/${slug}`) === 'races'
  if (isRace) {
    const pick = racePick(rawContent)
    if (!pick) return null
    // La marque suit toujours le `pick`, même en rupture : la ligne dit alors la rupture (brandOfferLabel).
    const offer = (isOfferSlug(pick.slug) ? compactDiscount(pick.slug) : null) ?? brandOfferLabel(pick)
    return { brandName: pick.name, href: pick.affiliateUrl, offer, pick: true, stopAt: STOP_RACE_COMPARE }
  }
  if (categorySlug !== 'avis-marques') return null
  const partner = reviewedPartner(rawContent, mainBrand, twoBrands)
  const brand = partner ? getBrandBySlug(partner) : undefined
  const offer = partner ? compactDiscount(partner) : null
  if (!brand || !offer || brand.stockNote) return null
  return {
    brandName: brand.name,
    href: brand.affiliateUrl,
    offer,
    stopAt: STOP_ARTICLE_OFFER,
  }
}
