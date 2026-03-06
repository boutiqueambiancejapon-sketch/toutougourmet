export interface Category {
  slug: string
  label: string
  description: string
  emoji: string
}

export const categories: Category[] = [
  {
    slug: 'sante-alimentation',
    label: 'Santé & Alimentation',
    description: "Mon chien mange de l'herbe, ne mange plus, mange des cailloux... On répond à toutes les questions sur le comportement alimentaire et la santé.",
    emoji: '❤️',
  },
  {
    slug: 'urgences',
    label: 'Urgences & Intoxications',
    description: 'Chocolat, raisin, ail, os cuit... Ce que ton chien ne doit absolument pas manger, et quoi faire en cas d\'ingestion.',
    emoji: '⚠️',
  },
  {
    slug: 'peut-manger',
    label: 'Peut-il manger ?',
    description: "Fruits, légumes, protéines, féculents — tout ce que ton chien peut ou ne peut pas manger, expliqué simplement.",
    emoji: '🥕',
  },
  {
    slug: 'alimentation-quotidienne',
    label: 'Alimentation quotidienne',
    description: 'Fréquence des repas, quantités, croquettes vs repas frais, manger maison... Les guides pratiques pour bien nourrir ton chien au quotidien.',
    emoji: '🍽️',
  },
  {
    slug: 'comportement-alimentaire',
    label: 'Comportement alimentaire',
    description: 'Mange trop vite, capricieux, refuse les croquettes... Comprendre et corriger les comportements alimentaires de ton chien.',
    emoji: '🐾',
  },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}
