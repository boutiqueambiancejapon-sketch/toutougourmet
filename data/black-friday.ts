import type { OfferSlug } from './partner-discounts'

// @cdc affiliation — pages Black Friday (pilier /black-friday-croquettes-chien + une page par marque).
// Règle : on n'annonce jamais une offre Black Friday qu'on n'a pas vue. On affiche l'offre confirmée de
// data/partner-discounts.ts et on dit que le récapitulatif de commande fait foi.

export const BF_PATH = '/black-friday-croquettes-chien'
export const BF_DATE = '2026-11-27'
export const CYBER_MONDAY_DATE = '2026-11-30'
/** Dernière vérification des pages des marques (aucune offre Black Friday annoncée à cette date). */
export const BF_CHECKED_AT = '2026-11-15'

export type BfSlug = OfferSlug | 'maxi-zoo'

export interface BfFaq {
  q: string
  a: string
}

export interface BfPage {
  slug: BfSlug
  name: string
  title: string
  description: string
  h1: string
  intro: string
  /** Faut-il attendre le Black Friday pour cette marque ? */
  wait: string
  faqs: BfFaq[]
}

export const bfPath = (slug: BfSlug): string => `${BF_PATH}/${slug}`

const noOffer = (name: string): BfFaq => ({
  q: `${name} fait-il une promo Black Friday en 2026 ?`,
  a: `Au 15 novembre 2026, on n'a vu aucune offre Black Friday annoncée par ${name}. L'offre de bienvenue en cours reste valable. Si une remise plus forte apparaît, le récapitulatif de commande l'affichera.`,
})

export const BF_PAGES: BfPage[] = [
  {
    slug: 'dog-chef',
    name: 'Dog Chef',
    title: 'Black Friday Dog Chef 2026 : la remise du moment',
    description: "Black Friday Dog Chef 2026 : −30 % sur la box d'essai et livraison gratuite avec le code WZU7090. Ce qu'on sait de l'offre et quand commander.",
    h1: 'Black Friday Dog Chef : quelle remise en 2026 ?',
    intro: "Dog Chef offre en ce moment −30 % sur sa box d'essai, livraison comprise, avec le code WZU7090. Aucune offre Black Friday plus forte n'est annoncée pour l'instant : cette remise s'applique dès aujourd'hui.",
    wait: "Attendre le 27 novembre ne sert à rien si ton chien termine son sac maintenant. La remise porte sur la box d'essai, donc sur une seule commande : autant la passer quand tu es prêt à faire la transition. Les repas sont frais : on ne fait pas de stock chez Dog Chef.",
    faqs: [
      noOffer('Dog Chef'),
      { q: 'Le code Dog Chef marche-t-il pendant le Black Friday ?', a: "Le code WZU7090 était valable lors de notre vérification. Si Dog Chef lance une offre spéciale, tape le code puis compare le total au récapitulatif avant de payer." },
      { q: 'Peut-on stocker des repas Dog Chef achetés en promo ?', a: 'Non. Ce sont des repas frais : suis les consignes de conservation du colis et commande la quantité de ta box, pas plus.' },
    ],
  },
  {
    slug: 'dogfy-diet',
    name: 'Dogfy Diet',
    title: 'Black Friday Dogfy Diet 2026 : la box à −50 %',
    description: "Black Friday Dogfy Diet 2026 : −50 % sur la box d'essai de 14 jours par notre lien. Ce que couvre la remise et le piège de l'abonnement qui suit.",
    h1: 'Black Friday Dogfy Diet : quelle remise en 2026 ?',
    intro: "Dogfy Diet propose −50 % sur sa box d'essai de 14 jours, par notre lien et sans code. C'est déjà la moitié du prix : aucune offre Black Friday plus forte n'est annoncée pour l'instant.",
    wait: "La remise s'arrête à la box d'essai. Ensuite l'abonnement repart au prix normal, sans engagement. Note la date de fin de l'essai dans ton téléphone le jour où tu commandes : une partie des avis clients se plaint de prélèvements mal compris.",
    faqs: [
      noOffer('Dogfy Diet'),
      { q: "Que se passe-t-il après la box d'essai Dogfy Diet ?", a: "L'abonnement continue au prix normal. Tu peux le mettre en pause ou l'arrêter depuis ton compte, de préférence avant la date du prochain envoi." },
      { q: 'Dogfy Diet convient-il à un chien en surpoids ?', a: 'Le menu bœuf est riche en graisses. Pour un chien en surpoids, choisis un autre menu et demande conseil à ton vétérinaire si le chien doit perdre du poids.' },
    ],
  },
  {
    slug: 'elmut',
    name: 'Elmut',
    title: 'Black Friday Elmut 2026 : −40 % sur la commande',
    description: 'Black Friday Elmut 2026 : −40 % sur la première commande par notre lien, sans code. Ce que couvre la remise et quand commander.',
    h1: 'Black Friday Elmut : quelle remise en 2026 ?',
    intro: "Elmut accorde −40 % sur la première commande, par notre lien et sans code à taper. Aucune offre Black Friday n'est annoncée pour l'instant : la remise de bienvenue reste la plus forte connue.",
    wait: "La remise vaut pour une seule commande, la première. Commande quand ton chien finit son aliment actuel pour enchaîner la transition. Les repas cuits sous vide arrivent en colis réfrigéré : suis les consignes de conservation du colis.",
    faqs: [
      noOffer('Elmut'),
      { q: 'Combien coûte Elmut après la remise ?', a: 'Compte environ 55 à 75 € par mois pour un chien de moins de 10 kilos hors remise. Le prix exact dépend du poids et du profil saisis sur le site.' },
      { q: 'Elmut fait-il aussi des repas pour chat ?', a: 'Oui, Elmut propose des recettes pour chat au poulet, bœuf, dinde, porc ou poisson. La remise de bienvenue vaut pour la première commande.' },
    ],
  },
  {
    slug: 'franklin',
    name: 'Franklin',
    title: 'Black Friday Franklin 2026 : −30 % en abonnement',
    description: "Black Friday Franklin Pet Food 2026 : −30 % sur la commande en abonnement par notre lien. Ce qu'on sait de l'offre et faut-il faire un stock de croquettes.",
    h1: 'Black Friday Franklin : quelle remise en 2026 ?',
    intro: "Franklin Pet Food offre −30 % sur la commande en abonnement, par notre lien. Aucune promo Black Friday n'est annoncée pour l'instant, et l'abonnement reste sans engagement.",
    wait: "Franklin vend des croquettes : la tentation du gros stock est là. Un sac ouvert se garde 4 à 6 semaines, donc prends un format que ton chien finit dans ce délai. L'abonnement règle le problème : tu fixes la fréquence et la remise suit chaque envoi.",
    faqs: [
      noOffer('Franklin'),
      { q: 'La remise Franklin vaut-elle sans abonnement ?', a: "Non, elle porte sur la commande en abonnement. L'abonnement est sans engagement : tu peux l'arrêter depuis ton compte." },
      { q: 'Franklin convient-il à un chien allergique ?', a: 'Les recettes sont sans céréales, avec beaucoup de viande. Pour une allergie confirmée, le choix de la protéine se fait avec ton vétérinaire.' },
    ],
  },
  {
    slug: 'ultra-premium-direct',
    name: 'Ultra Premium Direct',
    title: 'Black Friday Ultra Premium Direct 2026 : −20 %',
    description: "Black Friday Ultra Premium Direct 2026 : −20 % sur la première commande en abonnement par notre lien. Prix au kilo, conditions et quand commander.",
    h1: 'Black Friday Ultra Premium Direct : quelle remise ?',
    intro: "Ultra Premium Direct accorde −20 % sur la première commande en abonnement, par notre lien. Aucune offre Black Friday n'est annoncée pour l'instant. Ses croquettes coûtent déjà 3 à 5 € le kilo, le prix le plus bas de notre sélection.",
    wait: "L'abonnement demande d'accepter au moins 2 livraisons, d'après la fiche lue le 5 novembre 2026. Vérifie cette condition au panier avant de valider. La livraison est gratuite dès 64 € : un gros sac la déclenche souvent, à condition que ton chien le finisse en 4 à 6 semaines une fois ouvert.",
    faqs: [
      noOffer('Ultra Premium Direct'),
      { q: "Peut-on arrêter l'abonnement Ultra Premium Direct tout de suite ?", a: "La fiche produit demandait au moins 2 livraisons au 5 novembre 2026. Lis la condition affichée au panier le jour de ta commande." },
      { q: 'Ultra Premium Direct est-il bon pour un chien sensible ?', a: 'Notre fiche le conseille surtout pour un chien adulte sans souci particulier. Pour un chien à la digestion fragile, regarde la composition de la recette avant de commander.' },
    ],
  },
  {
    slug: 'maxi-zoo',
    name: 'Maxi Zoo',
    title: 'Black Friday Maxi Zoo 2026 : promos croquettes chien',
    description: 'Black Friday Maxi Zoo 2026 : les croquettes, pâtées et friandises pour chien en promotion, notées 70/100 ou plus par notre scanner. Prix mis à jour chaque nuit.',
    h1: 'Black Friday Maxi Zoo : les promos croquettes bien notées',
    intro: "Maxi Zoo n'a pas de code : ses réductions s'affichent directement sur les produits. Chaque nuit, on relève ses prix et on garde seulement les promotions sur des aliments notés 70/100 ou plus par notre scanner.",
    wait: "Les promos Maxi Zoo changent souvent, Black Friday ou pas. Regarde le prix au kilo plutôt que le pourcentage : un gros sac à −20 % peut coûter plus cher au kilo qu'un sac moyen sans remise. Et ne prends un gros sac que si ton chien le finit dans les 4 à 6 semaines après ouverture.",
    faqs: [
      { q: 'Maxi Zoo fait-il le Black Friday en 2026 ?', a: "Au 15 novembre 2026, on n'a pas vu d'opération Black Friday annoncée pour les aliments chien. La liste de cette page suit les promotions réelles, relevées chaque nuit." },
      { q: 'Faut-il un code promo chez Maxi Zoo ?', a: 'Non, la réduction est déjà dans le prix affiché sur la fiche du produit.' },
      { q: 'Pourquoi certaines promos Maxi Zoo ne sont pas dans la liste ?', a: 'On écarte les aliments notés moins de 70/100 par notre scanner. Une promo sur un aliment moyen reste un aliment moyen.' },
    ],
  },
]

export function getBfPage(slug: string): BfPage | undefined {
  return BF_PAGES.find((p) => p.slug === slug)
}

/** FAQ de la page pilier. */
export const BF_FAQS: BfFaq[] = [
  { q: 'Quand a lieu le Black Friday 2026 ?', a: 'Le vendredi 27 novembre 2026. Le Cyber Monday suit le lundi 30 novembre. Beaucoup de boutiques lancent leurs offres dès le début de la semaine.' },
  { q: 'Les croquettes sont-elles moins chères pendant le Black Friday ?', a: "Parfois, mais pas toujours plus que le reste de l'année. Les marques livrées à domicile ont déjà une offre de bienvenue entre −20 et −50 %. Compare le prix au kilo, pas le pourcentage." },
  { q: 'Combien de temps se garde un sac de croquettes ouvert ?', a: "4 à 6 semaines, dans son sac d'origine bien refermé. Un sac fermé tient jusqu'à sa date de durabilité, au sec et au frais." },
  { q: 'Comment savoir si une remise est réelle ?', a: "En Europe, le prix barré d'une réduction doit être le prix le plus bas pratiqué dans les 30 jours avant la promo. Si le prix a grimpé juste avant, la remise affichée doit en tenir compte." },
  { q: "Peut-on changer de croquettes d'un coup pour profiter d'une promo ?", a: "Non. Passe d'un aliment à l'autre sur une dizaine de jours en mélangeant les deux, sinon tu risques des selles molles ou un refus." },
  { q: 'Les liens de cette page sont-ils des liens partenaires ?', a: "Oui. On touche une commission si tu commandes, sans surcoût pour toi. Les notes de notre scanner ne dépendent pas de ces partenariats." },
]
