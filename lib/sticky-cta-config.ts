// @cdc affiliation — fallback sticky CTA quand l'article n'a pas d'affiliateA en frontmatter
// Routing intent-based : la catégorie + le slug décident quel CTA est servi.
//
// Logique actuelle (phase quick-win, single CTA partout sauf VS frontmatter) :
//   - Urgences & Intoxications        → Bien Nourri (soft, non-commercial)
//   - Santé                            → Bien Nourri
//   - Slugs "chien-peut-manger-*"      → Bien Nourri (intent éducation/safety)
//   - Slugs "chien-mange-*"            → Bien Nourri (intent safety/santé)
//   - Default (Alimentation hors slugs ci-dessus, Race, Comportement, Avis & Comparatif) → Dog Chef enrichi
//
// On teste d'abord le copy enrichi Dog Chef seul pour mesurer le lift.
// L'A/B test Dog Chef vs double Dog Chef+Elmut viendra dans une 2e phase.

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

/**
 * Conservé pour usage interne (recommandation Bien Nourri quand le profil
 * révèle des signes santé/digestif) — pas servi en sticky direct dans la phase
 * actuelle. Voir data/bien-nourri.ts → recommend().
 */
export const ELMUT_CTA: StickyCtaConfig = {
  brandName: 'Elmut',
  url: 'https://c3po.link/QWMW4k6mbU',
  label: 'repas frais cuisinés en France',
  badge: '-40%',
  socialProof: '★ 4.7/5 · qualité humaine, cuisson douce',
  buttonLabel: 'Essayer →',
}

/**
 * Soft CTA — pour articles à intent éducative / safety / anxiogène
 * (Urgences, Santé, "chien peut manger X", "chien mange X").
 * Sur ces pages, pousser une marque tombe à plat ; un bilan gratuit
 * "Est-ce que ton chien est bien nourri ?" rebondit sur la question naturelle
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
