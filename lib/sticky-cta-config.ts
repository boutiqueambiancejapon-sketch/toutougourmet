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

/**
 * Dog Chef — CTA commercial principal.
 */
export const DOG_CHEF_CTA: StickyCtaConfig = {
  brandName: 'Dog Chef',
  url: 'https://www.dogchef.com/fr/code/WZU7090',
  label: 'le menu sur-mesure pour ton chien',
  badge: '-35%',
  code: 'WZU7090',
  socialProof: '★★★★★ 4.8/5 · 7 800+ avis Trustpilot',
  buttonLabel: 'Calculer →',
  subButton: 'Livraison incluse · sans engagement',
}

/**
 * Conservé pour usage interne (recommandation Bien Nourri quand le profil
 * révèle des signes santé/digestif). Voir data/bien-nourri.ts → recommend().
 */
export const ELMUT_CTA: StickyCtaConfig = {
  brandName: 'Elmut',
  url: 'https://c3po.link/QWMW4k6mbU',
  label: 'repas frais cuisinés en France',
  badge: '-40%',
  socialProof: '★★★★★ 4.7/5 selon notre test · cuisson douce',
  buttonLabel: 'Essayer →',
  subButton: 'Livraison réfrigérée incluse',
}

/**
 * Soft CTA — pour articles à intent éducative / safety / anxiogène
 * (Urgences, Santé, "chien peut manger X", "chien mange X").
 *
 * Compteur dynamique multi-fenêtres :
 * La route /api/bien-nourri-count interroge Plausible sur 4 fenêtres réelles
 * (today / last_7d / last_30d / all_time). Les tiers ci-dessous sont évalués
 * dans l'ordre — le PREMIER qui dépasse son seuil est affiché. Comme chaque
 * valeur vient de SA vraie fenêtre Plausible, le framing « aujourd'hui » /
 * « cette semaine » / « ce mois » est strictement honnête (pas du tout du fake
 * social proof avec all-time camouflé en short window).
 *
 * Logique des seuils :
 *  - today >= 3        → activité quotidienne perceptible
 *  - last_7d >= 15     → ~2/jour sur la semaine = site vivant
 *  - last_30d >= 50    → ~1.6/jour sur le mois = adoption régulière
 *  - all_time >= 1     → fallback final (avant ça, rien affiché = cold start propre)
 *
 * À tuner librement selon les volumes réels post-lancement (édite les minCount
 * dans le tableau `tiers` ci-dessous, pas besoin de toucher au code).
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
      {
        field: 'all_time',
        minCount: 1,
        template: 'Déjà {count} bilan{plural} réalisé{plural}',
      },
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
