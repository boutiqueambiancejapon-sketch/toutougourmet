// @cdc affiliation — encart du milieu d'article (« façon 10min ») : quelle offre servir.
// Urgences, santé et aliments « danger » → bilan gratuit (aucune marque poussée sur une page
// anxiogène). « Peut-il manger » oui/modération → Dogfy Diet. Le reste → Dog Chef.
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
  eyebrow: 'Nouveau chez Dog Chef ? −30 % avec notre lien',
  title: 'Un menu calculé pour ton chien, livré frais',
  body: "Tu renseignes son poids, son âge, sa race et son activité. Dog Chef calcule la portion du jour et cuisine les repas à basse température. La box d'essai te montre en deux semaines s'il les aime.",
  checks: ['Portions calculées sur son profil', "Livraison gratuite sur la box d'essai", 'Sans engagement, pause quand tu veux'],
  button: { label: 'Composer son menu, −30 %', href: 'https://www.dogchef.com/fr/code/WZU7090' },
  badge: { big: '−30 %', small: 'box d’essai' },
  secondary: { label: 'Pas sûr de sa ration ? Calcule-la en 30 secondes', href: '/outils/ration' },
}

const DOGFY: MidCtaConfig = {
  id: 'dogfy',
  eyebrow: "Nouveau chez Dogfy Diet ? −50 % sur la box d'essai",
  title: 'Des repas frais déjà dosés, pour ne plus improviser',
  body: "Dogfy Diet cuit ses menus à la vapeur, sous vide, et les calcule sur le poids et l'activité de ton chien. Un sachet correspond à un repas : tu ne pèses plus rien.",
  checks: ["Box d'essai de 14 jours", 'Livraison gratuite', 'Sans engagement'],
  button: { label: 'Tester Dogfy Diet, −50 %', href: 'https://tidd.ly/4jT3Tqg' },
  badge: { big: '−50 %', small: 'box d’essai' },
  secondary: { label: 'Un autre aliment en tête ? Vérifie-le ici', href: '/chien/peut-manger' },
}

const BILAN: MidCtaConfig = {
  id: 'bilan',
  eyebrow: 'Gratuit, sans inscription',
  title: 'Sa gamelle couvre-t-elle vraiment ses besoins ?',
  body: "Quelques questions sur ce qu'il mange, sa silhouette, son pelage et ses selles. Le bilan te donne les points à corriger en priorité, chiffres à l'appui.",
  checks: ['2 minutes', 'Aucun e-mail demandé'],
  button: { label: 'Faire le bilan de mon chien', href: '/outils/bien-nourri' },
  badge: { big: '2 min', small: 'gratuit' },
  secondary: { label: 'Ou calcule sa ration exacte', href: '/outils/ration' },
}

interface MidCtaInput {
  slug: string
  categorySlug: string
  category: string
  verdict?: string
  hasOwnAffiliate: boolean
}

export function getMidCta({ slug, categorySlug, category, verdict, hasOwnAffiliate }: MidCtaInput): MidCtaConfig | null {
  if (hasOwnAffiliate || categorySlug === 'avis-marques') return null
  if (categorySlug === 'urgences' || categorySlug === 'sante' || category === 'Santé' || verdict === 'danger') return BILAN
  if (slug.startsWith('chien-mange-')) return BILAN
  if (categorySlug === 'peut-manger' || slug.startsWith('chien-peut-manger-') || verdict) return DOGFY
  return DOG_CHEF
}
