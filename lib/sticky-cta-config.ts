// @cdc affiliation — fallback sticky CTA quand l'article n'a pas d'affiliateA en frontmatter
// Routing intent-based : la catégorie de l'article détermine quel CTA est servi.
// - Urgences / Santé → CTA soft vers le bilan "Bien nourri ?" (non commercial)
// - Alimentation / Race / Comportement → double CTA Dog Chef + Elmut (les 2 leaders du frais)
// - Default → Dog Chef enrichi

import type { StickyCtaConfig } from '@/components/blog/StickyCta'

export type { StickyCtaConfig }

// ────────────────────────────────────────────────────────────
// Configs individuels
// ────────────────────────────────────────────────────────────

export const DOG_CHEF_CTA: StickyCtaConfig = {
  brandName: 'Dog Chef',
  url: 'https://www.dogchef.com/fr/code/WZU7090',
  label: 'le menu sur-mesure pour ton chien',
  badge: '-35%',
  code: 'WZU7090',
  socialProof: '★ 4.8/5 · validé par 1 000+ vétérinaires',
  buttonLabel: 'Calculer →',
}

export const ELMUT_CTA: StickyCtaConfig = {
  brandName: 'Elmut',
  url: 'https://c3po.link/QWMW4k6mbU',
  label: 'repas frais cuisinés en France',
  badge: '-40%',
  socialProof: '★ 4.7/5 · qualité humaine, cuisson douce',
  buttonLabel: 'Essayer →',
}

/**
 * Soft CTA — pour articles à intent éducative/anxiogène (Urgences, Santé).
 * Sur ces pages, pousser une marque tombe à plat ; un bilan gratuit
 * "Est-ce que ton chien est bien nourri ?" rebondit sur l'anxiété naturelle
 * créée par la lecture, capte la curiosité et requalifie le trafic.
 * À la fin du bilan, on route vers Dog Chef ou Elmut selon le profil.
 */
export const BIEN_NOURRI_CTA: StickyCtaConfig = {
  brandName: 'Est-ce que ton chien est bien nourri ?',
  url: '/outils/bien-nourri',
  label: 'fais le bilan gratuit en 2 min',
  buttonLabel: 'Faire le bilan →',
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
 * Mapping `category` (libellé exact du frontmatter) → sticky CTA à servir.
 *
 * Ordre de priorité dans les pages article :
 *   1. Article a `affiliateA + affiliateB` en frontmatter → StickyCtaDouble (override marqué)
 *   2. Article a `affiliateA` seul → StickyCta avec le config issu du frontmatter
 *   3. Fallback → cette fonction (intent-based)
 */
export function getStickyCtaForArticle(category: string): StickyCtaSelection {
  // Articles anxiogènes ou santé → bilan gratuit (pas de marque)
  if (category === 'Urgences & Intoxications' || category === 'Santé') {
    return { kind: 'single', config: BIEN_NOURRI_CTA }
  }

  // Articles à intent achat (alim, race, comportement) → double CTA
  if (
    category === 'Alimentation' ||
    category === 'Race' ||
    category === 'Comportement'
  ) {
    return {
      kind: 'double',
      eyebrow: 'Les 2 leaders du repas frais en France',
      subProof: 'Offre de bienvenue exclusive · sans engagement',
      brandA: { label: 'Dog Chef · -35%', href: DOG_CHEF_CTA.url },
      brandB: { label: 'Elmut · -40%', href: ELMUT_CTA.url },
    }
  }

  // Default (Avis & Comparatif sans affiliateA, autres) → Dog Chef enrichi
  return { kind: 'single', config: DOG_CHEF_CTA }
}
