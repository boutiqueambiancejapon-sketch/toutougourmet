import { pageTypeOf } from '@/lib/page-type'
import { CONFIRMED_DISCOUNTS, shortDiscount } from '@/data/partner-discounts'

// @cdc affiliation — encart du milieu d'article (« façon 10min ») : quelle offre servir, selon la
// carte des conversions (docs/v2/cro-carte.md, validée le 2026-11-03) : un seul encart au milieu
// au plus, jamais la même demande que l'encart de fin, rien à vendre sur une page d'inquiétude.
// Type de page : lib/page-type.ts (même classification que la mesure et le tableau de bord).
// Offres vérifiées sur les sites des marques le 2026-11-02.

export interface MidCtaConfig {
  id: string
  eyebrow: string
  title: string
  body: string
  checks: string[]
  button: { label: string; href: string }
  badge: { big: string; small: string }
  secondary?: { label: string; href: string }
}

const DOG_CHEF: MidCtaConfig = {
  id: 'dog-chef',
  eyebrow: `Nouveau chez Dog Chef ? ${CONFIRMED_DISCOUNTS['dog-chef']}`,
  title: 'Un menu calculé pour ton chien, livré frais',
  body: "Tu renseignes son poids, son âge, sa race et son activité. Dog Chef calcule la portion du jour et cuisine les repas à basse température. La box d'essai te montre en deux semaines s'il les aime.",
  checks: ['Portions calculées sur son profil', "Livraison gratuite sur la box d'essai", 'Sans engagement, pause quand tu veux'],
  button: { label: `Composer son menu, ${shortDiscount('dog-chef').replace(' ', '\u00a0')}`, href: 'https://www.dogchef.com/fr/code/WZU7090' },
  badge: { big: shortDiscount('dog-chef'), small: 'box d’essai' },
  secondary: { label: 'Pas sûr de sa ration ? Calcule-la avec notre outil', href: '/outils/ration' },
}

const POIDS: MidCtaConfig = {
  id: 'poids',
  eyebrow: 'Gratuit, sans inscription',
  title: 'Ton chien est-il à son poids de forme ?',
  body: "Entre son poids actuel et son poids de forme, l'outil te dit s'il faut revoir sa ration, et de combien. Avec un compte gratuit, tu gardes ses pesées et tu suis sa courbe.",
  checks: ['Résultat immédiat', 'Pesées gardées avec un compte gratuit'],
  button: { label: 'Vérifier son poids', href: '/outils/poids' },
  badge: { big: 'kg', small: 'gratuit' },
}

const SCANNER: MidCtaConfig = {
  id: 'scanner',
  eyebrow: 'Gratuit, sans appli',
  title: 'Quelle note pour les croquettes de ton chien ?',
  body: "Scanne le code-barres du sac ou photographie l'étiquette. Le scanner calcule protéines et glucides sur matière sèche, repère la viande nommée et les additifs, puis donne une note sur 100 avec un barème publié.",
  checks: ['Sans compte pour les produits connus', 'Note expliquée critère par critère'],
  button: { label: 'Scanner mes croquettes', href: '/scanner' },
  badge: { big: '/100', small: 'gratuit' },
  secondary: { label: 'Ou calcule seulement le taux de glucides', href: '/scanner#glucides' },
}

/** Articles sur la lecture d'une étiquette ou le choix de croquettes : le scanner y répond directement. */
const SCANNER_TOPIC = /etiquette-croquettes|glucides-croquettes|additifs-croquettes|croquettes-sans-cereales|^avis-croquettes-|^meilleures-croquettes/
/** Avis de marques de repas frais : pas de code-barres de croquettes à scanner. */
const FRESH_FOOD = /butternut|repas-frais|dog-chef|dogfy|elmut/

interface MidCtaInput {
  slug: string
  categorySlug: string
  verdict?: string
  hasOwnAffiliate: boolean
  /** L'article contient déjà le comparatif des marques d'une fiche race (BreedBrandCompare). */
  hasBrandCompare?: boolean
}

export function getMidCta({ slug, categorySlug, verdict, hasOwnAffiliate, hasBrandCompare = false }: MidCtaInput): MidCtaConfig | null {
  // @cdc cro-carte — l'article porte déjà sa propre offre (affiliateA, comparatif race) : pas de doublon.
  if (hasOwnAffiliate || hasBrandCompare) return null
  const type = pageTypeOf(`/chien/${categorySlug}/${slug}`)
  // @cdc cro-carte — urgences, aliment « danger » et « mon chien a mangé… » : aucun encart. Rien à
  // vendre avant que les gestes et les numéros soient lus (l'ancien encart « bilan » est retiré).
  if (type === 'urgences' || verdict === 'danger' || slug.startsWith('chien-mange-')) return null
  // @cdc cro-carte — aliments « peut-il manger » (oui, modération) : plus d'offre Dogfy au milieu.
  // L'objectif de ces pages est le guide, servi en fin d'article (chantier séparé).
  if (type === 'aliments' || verdict) return null
  // @cdc cro-carte — santé, poids, maladies : objectif compte. L'encart de fin demande déjà le compte
  // (lib/article-signup.ts) ; au milieu, l'outil poids, qui mène au compte (pesées gardées).
  if (type === 'sante') return POIDS
  // @cdc cro-carte — avis de marques de croquettes non partenaires : le scanner, aucune marque
  // poussée à côté de l'avis. Avis de repas frais : rien, l'avis porte déjà sa marque.
  if (categorySlug === 'avis-marques') return FRESH_FOOD.test(slug) ? null : SCANNER
  // @cdc cro-carte — étiquette, glucides, choix de croquettes : le scanner y répond directement.
  if (SCANNER_TOPIC.test(slug)) return SCANNER
  // @cdc cro-carte — nutrition, marques, comparatifs : l'offre partenaire reste (objectif clic).
  // Recettes : repas frais pour qui n'a pas le temps de cuisiner (objectif secondaire de la carte).
  // Races sans comparatif et autres articles : Dog Chef, comme avant.
  return DOG_CHEF
}
