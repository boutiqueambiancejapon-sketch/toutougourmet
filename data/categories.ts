export interface Category {
  slug: string
  label: string
  description: string
  emoji: string
  /** Slugs des sous-catégories affichées sur la page hub */
  subCategorySlugs?: string[]
}

export const categories: Category[] = [
  {
    slug: 'peut-manger',
    label: 'Que peut manger un chien ?',
    description: 'Fruits, légumes, viandes, féculents — tous les aliments autorisés et interdits pour ton chien, expliqués clairement avec les quantités et précautions.',
    emoji: '🥕',
    subCategorySlugs: ['fruit', 'legumes', 'viandes'],
  },
  {
    slug: 'alimentation-quotidienne',
    label: 'Bien nourrir son chien',
    description: 'Croquettes, pâtée, repas frais, BARF… Quelle alimentation choisir, en quelle quantité et à quelle fréquence ? Tous nos guides pratiques.',
    emoji: '🍽️',
  },
  {
    slug: 'fruit',
    label: 'Quels fruits pour un chien ?',
    description: 'Fraises, mangues, poires, abricots… Quels fruits un chien peut-il manger sans risque ? Quantités, parties à éviter et fruits interdits.',
    emoji: '🍓',
  },
  {
    slug: 'legumes',
    label: 'Quels légumes pour un chien ?',
    description: 'Brocoli, chou-fleur, poivron, endives… Les légumes que ton chien peut manger, ceux à éviter, et les meilleures façons de les préparer.',
    emoji: '🥦',
  },
  {
    slug: 'viandes',
    label: 'Viandes et poissons pour chien',
    description: 'Poulet, bœuf, agneau, saumon, foie… Quelles viandes et quels poissons peut manger un chien, crus ou cuits, et en quelles quantités.',
    emoji: '🥩',
  },
  {
    slug: 'urgences',
    label: 'Aliments dangereux et toxiques pour chien',
    description: 'Chocolat, raisin, ail, os cuit, noix de cajou… Les aliments qui peuvent intoxiquer ou tuer un chien, et quoi faire en cas d\'ingestion.',
    emoji: '⚠️',
  },
  {
    slug: 'comportement-alimentaire',
    label: 'Mon chien ne mange plus, mange trop vite…',
    description: 'Refuse ses croquettes, sort la nourriture du bol, mange ses crottes, avale trop vite… Comprendre et corriger les comportements alimentaires.',
    emoji: '🐾',
  },
  {
    slug: 'race',
    label: 'Alimentation par race',
    description: 'Labrador, Golden Retriever, Berger Allemand, Bouledogue Français… Trouvez les conseils nutritionnels adaptés à la race de votre chien.',
    emoji: '🐕',
  },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}
