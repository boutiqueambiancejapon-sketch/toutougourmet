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
 * - badge rose (par défaut) : code promo/alerte douce
 * - socialProof : 5 étoiles dorées (rendues amber par <StickyCta>) + rating + nb d'avis
 *   → sourcé depuis data/brands.ts (pros Dog Chef : « Élu Produit de l'Année 2026 —
 *     4.8/5 sur 7 800+ avis »). Factuel, pas de claim inventée.
 * - subButton : friction-remover « Livraison incluse · sans engagement »
 *   Alternative validée (à activer si prix Dog Chef confirmé exact) :
 *   `subButton: 'à partir de 1,4€/jour'` — price anchor plus convertissant
 */
export const DOG_CHEF_CTA: StickyCtaConfig = {
  brandName: 'Dog Chef',
  url: 'https://www.dogchef.com/fr/code/WZU7090',
  label: 'le menu sur-mesure pour ton chien',
  badge: '-35%',
  // badgeColor par défaut = 'rose' (codé promo)
  code: 'WZU7090',
  socialProof: '★★★★★ 4.8/5 · 7 800+ avis Trustpilot',
  buttonLabel: 'Calculer →',
  subButton: 'Livraison incluse · sans engagement',
}

/**
 * Conservé pour usage interne (recommandation Bien Nourri quand le profil
 * révèle des signes santé/digestif) — pas servi en sticky direct dans la phase
 * actuelle. Voir data/bien-nourri.ts → recommend().
 *
 * Note : 4.7/5 est l'évaluation éditoriale interne (data/brands.ts → scores.global),
 * pas un rating Trustpilot vérifié — d'où le wording « 4.7/5 selon notre test »
 * pour rester honnête. À updater quand on aura le Trustpilot/Avis vérifié officiel.
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
 * Sur ces pages, pousser une marque tombe à plat ; un bilan gratuit
 * rebondit sur la question naturelle créée par la lecture, capte la curiosité
 * et requalifie le trafic. À la fin du bilan, on route vers Dog Chef ou Elmut
 * selon le profil (cf. data/bien-nourri.ts → recommend()).
 *
 * Évolution du copy (4e itération) :
 *  - V1 "Est-ce que ton chien est bien nourri ?" → cliché bureaucratique
 *  - V2 "Tu nourris peut-être mal ton chien" → accusation frontale, braquage
 *  - V3 "Sa gamelle, on peut faire mieux ?" → aspirationnel mais pas top
 *  - V4 "Nourrissez-vous bien votre toutou ?" ← actuel
 *     Le wording proposé par le user marche pour 3 raisons :
 *     - "toutou" intègre le nom de la marque (Toutou Gourmet) — branding subtil
 *     - "vous" formel adoucit la confrontation tout en restant direct
 *     - La question vise la COMPÉTENCE du maître (vs la gamelle ou le chien),
 *       ce qui crée la friction émotionnelle la plus forte chez quelqu'un qui
 *       aime son chien
 *
 * Note tu/vous : ce CTA est en "vous" alors que les articles sont en "tu".
 * Pattern classique presse FR (Le Monde, Le Figaro) : CTA marketing en vous,
 * corps éditorial en tu/vous selon ligne. Pas une vraie inconsistance.
 *
 * Copy choisi :
 *  - badge = « GRATUIT » en vert (signal positif, ancrage mobile)
 *  - brandName = question directe à la compétence + branding « toutou »
 *  - label = double promesse (diagnostic + actions) + ancrage temps
 *  - buttonLabel = aligné « vous » avec le brandName
 *  - subButton = friction-remover (inscription) + rappel temps
 */
export const BIEN_NOURRI_CTA: StickyCtaConfig = {
  brandName: 'Nourrissez-vous bien votre toutou ?',
  url: '/outils/bien-nourri',
  label: 'diagnostic + 3 axes à améliorer en 2 min',
  badge: 'GRATUIT',
  badgeColor: 'green',
  buttonLabel: 'Faites le test →',
  subButton: 'Sans inscription · 2 min',
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
