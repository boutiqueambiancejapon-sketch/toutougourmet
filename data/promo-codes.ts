import type { Brand } from './brands'
import { CONFIRMED_DISCOUNTS, type OfferSlug } from './partner-discounts'

// @cdc affiliation — pages « code promo » (/codes-promo, /codes-promo/[slug]). La remise vient
// toujours de data/partner-discounts.ts ; seul Dog Chef a un code (WZU7090, data/brands.ts), les
// autres remises passent par le lien partenaire : aucun code inventé. Conditions, prix et livraison
// repris de data/brands.ts et des tests publiés, sans rien ajouter. Date de vérification : jour où
// le propriétaire a confirmé les remises (DECISIONS.md, 2026-11-02).

export const PROMO_VERIFIED_AT = '2026-11-02'
export const PROMO_HUB_PATH = '/codes-promo'

export interface PromoFaq {
  q: string
  a: string
}

export interface PromoPage {
  slug: OfferSlug
  /** Title complet (sans le suffixe du site), 60 caractères au plus */
  title: string
  /** Méta-description, 110 à 155 caractères */
  description: string
  h1: string
  /** Premier paragraphe : la réponse directe */
  intro: string
  /** Code à saisir, null quand la remise passe par le lien */
  code: string | null
  steps: string[]
  /** Conditions présentes dans nos données, rien d'autre */
  conditions: string[]
  /** Pour quel chien, d'après la fiche marque */
  fit: string
  /** Liens internes : test complet, fiche marque, comparatif */
  links: { href: string; label: string }[]
  /** Questions propres à la marque ; prix, livraison et validité sont ajoutés par promoFaqs */
  faqs: PromoFaq[]
}

export const PROMO_PAGES: PromoPage[] = [
  {
    slug: 'dog-chef',
    title: "Code promo Dog Chef WZU7090 : −30 % sur la box d'essai",
    description:
      "Code promo Dog Chef WZU7090 : −30 % sur la box d'essai et livraison gratuite. Offre vérifiée le 2 novembre 2026, mode d'emploi pas à pas.",
    h1: "Code promo Dog Chef : WZU7090, −30 % sur la box d'essai",
    intro:
      "Le code WZU7090 retire 30 % du prix de la box d'essai Dog Chef, et la livraison est gratuite. Notre lien ouvre Dog Chef avec ce code déjà associé. Tu peux aussi le taper toi-même à la fin du questionnaire.",
    code: 'WZU7090',
    steps: [
      'Ouvre Dog Chef par notre lien : le code WZU7090 y est déjà rattaché.',
      "Lance le calcul du prix et décris ton chien (poids, âge, activité). Dog Chef demande ce profil avant toute commande, il sert à calculer la ration.",
      "À la fin du questionnaire, si la remise n'apparaît pas, ajoute un code promo et tape WZU7090 en majuscules, puis confirme.",
      "Vérifie la ligne −30 % dans le récapitulatif, puis termine la commande. Si elle manque, ne paie pas et contacte le service client de Dog Chef.",
    ],
    conditions: [
      "La remise porte sur la box d'essai, donc sur la première commande.",
      'La livraison est gratuite, en camionnette réfrigérée.',
      'Dog Chef ne nourrit que les chiens, pas les chats.',
      'Un profil détaillé du chien est obligatoire avant de pouvoir commander.',
    ],
    fit: "Dog Chef calcule la ration sur le profil du chien et la recalcule quand son poids change. Notre fiche la conseille pour un chiot, un chien en surpoids ou un senior. Les boosters Puppy, Senior, Mobility et Transit s'ajoutent aux repas.",
    links: [
      { href: '/chien/avis-marques/avis-dog-chef-croquettes-canard-frais', label: 'Notre avis sur les croquettes Dog Chef au canard' },
      { href: '/chien/marque/dog-chef', label: 'Avis Dog Chef : prix, recettes, points faibles' },
      { href: '/chien/marque/elmut-vs-dog-chef', label: 'Dog Chef ou Elmut, lequel choisir ?' },
    ],
    faqs: [
      {
        q: 'Le code WZU7090 marche-t-il après la première commande ?',
        a: "Non. La remise de 30 % porte sur la box d'essai, c'est-à-dire la première commande. Nous ne connaissons pas d'autre remise Dog Chef pour les livraisons suivantes.",
      },
      {
        q: 'Où taper le code promo Dog Chef ?',
        a: "À la fin du questionnaire sur ton chien, dans le champ du code promo, en majuscules. Par notre lien, le code est déjà rattaché : vérifie seulement que la ligne −30 % apparaît dans le récapitulatif.",
      },
      {
        q: 'Dog Chef existe-t-il pour les chats ?',
        a: 'Non, Dog Chef ne fait que des repas pour chiens.',
      },
    ],
  },
  {
    slug: 'dogfy-diet',
    title: "Code promo Dogfy Diet : −50 % sur la box d'essai",
    description:
      "Dogfy Diet : −50 % sur la box d'essai de 14 jours, sans code à taper, par notre lien. Offre vérifiée le 2 novembre 2026, conditions et mode d'emploi.",
    h1: "Code promo Dogfy Diet : −50 % sur la box d'essai de 14 jours",
    intro:
      "Dogfy Diet retire 50 % du prix de sa box d'essai de 14 jours quand tu passes par notre lien. Il n'y a pas de code à taper : la remise est rattachée au lien.",
    code: null,
    steps: [
      'Ouvre Dogfy Diet par notre lien : la remise de 50 % y est rattachée.',
      'Décris ton chien (race, âge, poids, activité) : Dogfy Diet dose les sachets de la box sur ce profil.',
      "Vérifie la ligne −50 % dans le récapitulatif avant de payer. Si elle manque, ne valide pas la commande.",
      "Note la date de fin des 14 jours : l'abonnement prend le relais ensuite si tu ne l'arrêtes pas.",
    ],
    conditions: [
      "La remise porte sur la box d'essai de 14 jours.",
      "L'abonnement qui suit est sans engagement.",
      "Dans une partie des avis clients, les prélèvements de l'abonnement sont mal compris et la résiliation jugée difficile : garde la date de fin de l'essai en tête.",
    ],
    fit: "Dogfy Diet livre des repas cuits sous vide en sachets prédosés, congelés. Notre fiche le conseille pour un chien difficile à nourrir. Le menu bœuf est riche (37,5 % de matières grasses sur matière sèche) : à doser avec soin chez un chien en surpoids, et notre sélection l'écarte au-delà de 40 kg.",
    links: [
      { href: '/chien/avis-marques/avis-dogfy-diet-repas-frais-chien', label: 'Notre avis complet sur Dogfy Diet' },
      { href: '/chien/marque/dogfy-diet', label: 'Avis Dogfy Diet : prix, recettes, points faibles' },
    ],
    faqs: [
      {
        q: "Faut-il un code promo pour la box d'essai Dogfy Diet ?",
        a: "Non. La remise de 50 % est rattachée à notre lien. Vérifie seulement qu'elle apparaît dans le récapitulatif avant de payer.",
      },
      {
        q: "Que se passe-t-il après les 14 jours d'essai ?",
        a: "L'abonnement Dogfy Diet prend le relais, sans engagement. Si tu ne veux pas continuer, arrête-le avant la fin des 14 jours depuis ton compte.",
      },
      {
        q: 'Dogfy Diet convient-il à un chien en surpoids ?',
        a: "Avec prudence. Le menu bœuf contient 37,5 % de matières grasses sur matière sèche. Pour un chien qui prend du poids, notre sélection propose plutôt Dog Chef ou Elmut, dont la ration suit le poids.",
      },
    ],
  },
  {
    slug: 'elmut',
    title: 'Code promo Elmut : −40 % sur la première commande',
    description:
      "Elmut : −40 % sur la première commande de repas frais pour chien, par notre lien, sans code à taper. Offre vérifiée le 2 novembre 2026.",
    h1: 'Code promo Elmut : −40 % sur ta première commande',
    intro:
      "Elmut retire 40 % du prix de la première commande quand tu passes par notre lien. Il n'y a pas de code à taper : la remise est rattachée au lien.",
    code: null,
    steps: [
      'Ouvre Elmut par notre lien : la remise de 40 % y est rattachée.',
      "Décris ton chien : Elmut calcule la ration sur son profil.",
      "Vérifie la ligne −40 % dans le récapitulatif avant de payer. Si elle manque, ne valide pas la commande.",
      'Prévois de la place au frigo : les repas arrivent réfrigérés, en colis Chronofresh.',
    ],
    conditions: [
      'La remise porte sur la première commande.',
      'Livraison en colis réfrigéré Chronofresh.',
      'Elmut fait aussi des recettes pour chat (poulet, bœuf, dinde).',
    ],
    fit: "Elmut cuit ses repas sous vide à 90 °C, sans conservateur ni colorant artificiel, avec des ingrédients de qualité humaine. Notre fiche le conseille pour un chien senior ou en surpoids. Compte environ 55 à 75 € par mois pour un chien de moins de 10 kg.",
    links: [
      { href: '/chien/marque/elmut', label: 'Avis Elmut : prix, recettes, points faibles' },
      { href: '/chien/marque/elmut-vs-dog-chef', label: 'Elmut ou Dog Chef, lequel choisir ?' },
      { href: '/chien/marque/franklin-vs-elmut', label: 'Franklin ou Elmut, lequel choisir ?' },
    ],
    faqs: [
      {
        q: 'Faut-il un code promo pour la remise Elmut ?',
        a: "Non. La remise de 40 % sur la première commande est rattachée à notre lien. Vérifie qu'elle apparaît dans le récapitulatif avant de payer.",
      },
      {
        q: 'Elmut est-il plus cher que des croquettes ?',
        a: "Oui. Elmut coûte environ 55 à 75 € par mois pour un chien de moins de 10 kg, plus que des croquettes. Les repas frais demandent aussi de la place au frigo.",
      },
    ],
  },
  {
    slug: 'franklin',
    title: 'Code promo Franklin Pet Food : −30 % en abonnement',
    description:
      "Franklin Pet Food : −30 % en abonnement, par notre lien, sans code à taper. Croquettes sans céréales. Offre vérifiée le 2 novembre 2026.",
    h1: 'Code promo Franklin Pet Food : −30 % en abonnement',
    intro:
      "Franklin Pet Food retire 30 % du prix quand tu commandes en abonnement par notre lien. Il n'y a pas de code à taper : la remise est rattachée au lien.",
    code: null,
    steps: [
      'Ouvre Franklin Pet Food par notre lien : la remise de 30 % y est rattachée.',
      'Choisis la recette selon la viande que ton chien supporte, et lis sa composition : certaines associent deux espèces.',
      "Choisis l'abonnement, pas l'achat simple : la remise porte sur l'abonnement.",
      "Vérifie la ligne −30 % dans le récapitulatif avant de payer. Si elle manque, ne valide pas la commande.",
    ],
    conditions: [
      "La remise porte sur la commande en abonnement.",
      "L'abonnement est sans engagement.",
      "Livraison gratuite dès 49 € en point relais avec l'abonnement.",
    ],
    fit: "Franklin fait des croquettes et des pâtées sans céréales, jusqu'à 70 % de viande. Notre fiche le conseille pour un chien allergique ou à la digestion sensible. Les recettes sont formulées à Paris et fabriquées en République tchèque. Prévois une transition de 10 jours au moins.",
    links: [
      { href: '/chien/avis-marques/avis-franklin-light-dinde-patate-douce-epinards', label: 'Notre avis sur la recette Franklin Light' },
      { href: '/chien/marque/franklin', label: 'Avis Franklin Pet Food : prix, recettes, points faibles' },
      { href: '/chien/marque/franklin-vs-ultra-premium-direct', label: 'Franklin ou Ultra Premium Direct, lequel choisir ?' },
    ],
    faqs: [
      {
        q: 'La remise Franklin marche-t-elle sans abonnement ?',
        a: "Non. Les 30 % portent sur la commande en abonnement. L'abonnement Franklin est sans engagement.",
      },
      {
        q: 'Franklin convient-il à un chien allergique ?',
        a: "Souvent, oui : chaque recette n'a qu'une source de viande, ce qui aide à écarter celle que le chien ne supporte pas. Pour une allergie confirmée, choisis la recette avec ton vétérinaire.",
      },
    ],
  },
  {
    slug: 'ultra-premium-direct',
    title: 'Code promo Ultra Premium Direct : −20 % en abonnement',
    description:
      "Ultra Premium Direct : −20 % sur la première commande en abonnement, par notre lien, sans code à taper. Offre vérifiée le 2 novembre 2026.",
    h1: 'Code promo Ultra Premium Direct : −20 % sur la 1re commande',
    intro:
      "Ultra Premium Direct retire 20 % du prix de la première commande en abonnement quand tu passes par notre lien. Il n'y a pas de code à taper : la remise est rattachée au lien.",
    code: null,
    steps: [
      'Ouvre Ultra Premium Direct par notre lien : la remise de 20 % y est rattachée.',
      "Choisis la recette selon l'âge et le gabarit de ton chien.",
      "Choisis l'abonnement et sa fréquence de livraison : la remise porte sur la première commande en abonnement.",
      "Vérifie la ligne −20 % dans le récapitulatif avant de payer. Si elle manque, ne valide pas la commande.",
    ],
    conditions: [
      'La remise porte sur la première commande en abonnement.',
      "L'abonnement demande d'accepter au moins 2 livraisons, selon la fiche produit lue le 5 novembre 2026.",
      "Livraison gratuite dès 64 € d'achat au 5 novembre 2026.",
    ],
    fit: "Ultra Premium Direct vend ses croquettes en direct, environ 3 à 5 € le kilo : le prix au kilo le plus bas de notre sélection. Notre fiche le conseille pour un chien adulte sans souci particulier, quand le budget compte. Certaines recettes contiennent des pois et montent à 35 % de glucides sur matière sèche.",
    links: [
      { href: '/chien/avis-marques/avis-ultra-premium-direct', label: 'Notre avis complet sur Ultra Premium Direct' },
      { href: '/chien/marque/ultra-premium-direct', label: 'Avis Ultra Premium Direct : prix, recettes, points faibles' },
      { href: '/chien/marque/franklin-vs-ultra-premium-direct', label: 'Franklin ou Ultra Premium Direct, lequel choisir ?' },
    ],
    faqs: [
      {
        q: 'La remise Ultra Premium Direct marche-t-elle sans abonnement ?',
        a: "Non. Les 20 % portent sur la première commande en abonnement. La fiche produit demande d'accepter au moins 2 livraisons.",
      },
      {
        q: 'Où sont fabriquées les croquettes Ultra Premium Direct ?',
        a: "La marque dit faire produire ses croquettes par des sous-traitants français, qu'elle ne nomme pas. Ses pâtées sont fabriquées en Lot-et-Garonne, en Bretagne et dans le Nord-Pas-de-Calais, selon son site.",
      },
    ],
  },
]

export function getPromoPage(slug: string): PromoPage | undefined {
  return PROMO_PAGES.find((p) => p.slug === slug)
}

export const promoPath = (slug: OfferSlug): string => `${PROMO_HUB_PATH}/${slug}`

/** « 2026-11-02 » → « 2 novembre 2026 » */
export function formatFrDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
}

/** FAQ complète : questions de la marque, puis prix, livraison et validité tirés des données. */
export function promoFaqs(page: PromoPage, brand: Brand): PromoFaq[] {
  const discount = CONFIRMED_DISCOUNTS[page.slug] ?? ''
  return [
    {
      q: `Le code promo ${brand.name} est-il encore valable ?`,
      a: `L'offre « ${discount} » était valable le ${formatFrDate(PROMO_VERIFIED_AT)}, date de notre dernière vérification. Si la remise n'apparaît pas dans le récapitulatif, ne paie pas et écris-nous par le formulaire de contact.`,
    },
    ...page.faqs,
    { q: `Combien coûte ${brand.name} ?`, a: `${brand.facts.price}, d'après la fiche et le test de la marque.` },
    { q: `Comment ${brand.name} est-il livré ?`, a: `${brand.facts.delivery}.` },
  ]
}

/** FAQ du hub /codes-promo : réponses tirées de data/brands.ts et de DECISIONS.md. */
export const PROMO_HUB_FAQS: PromoFaq[] = [
  {
    q: 'Ces codes promo pour chien sont-ils vérifiés ?',
    a: `Oui. Les cinq remises ont été vérifiées le ${formatFrDate(PROMO_VERIFIED_AT)}. Nous ne publions aucun code trouvé ailleurs.`,
  },
  {
    q: 'Pourquoi un seul code à taper ?',
    a: "Seul Dog Chef nous a donné un code, WZU7090. Chez Dogfy Diet, Elmut, Franklin Pet Food et Ultra Premium Direct, la remise est rattachée à notre lien : il suffit de passer par lui.",
  },
  {
    q: 'Pourquoi un code trouvé sur un site de bons plans ne marche-t-il pas ?',
    a: "Ces sites mélangent souvent des codes expirés, des offres saisonnières finies et des codes de parrainage personnels. Vérifie toujours la ligne de remise dans le récapitulatif avant de payer.",
  },
  {
    q: 'Quelle offre choisir pour un chiot ?',
    a: "Dog Chef ajoute un booster Puppy aux repas des chiots et recalcule la ration quand le poids change. Pour un chiot de grande race nourri aux croquettes, Ultra Premium Direct a une recette pour les chiots de plus de 25 kg adultes.",
  },
  {
    q: 'Quelle offre pour un petit budget ?',
    a: "Ultra Premium Direct : environ 3 à 5 € le kilo, le prix au kilo le plus bas de notre sélection, et −20 % sur la première commande en abonnement.",
  },
  {
    q: "Comment Toutou Gourmet gagne-t-il de l'argent avec ces offres ?",
    a: "Nous touchons une commission quand tu commandes par nos liens, sans surcoût pour toi. La remise reste la même.",
  },
]
