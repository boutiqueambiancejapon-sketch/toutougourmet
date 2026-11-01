// @cdc seo-geo §6.4 — fiche de données par race, affichée par le gabarit race V2
// (pages /chien/race/nourriture-{slug}). Chaque valeur vient de l'article de la race :
// rien n'est ajouté ici qui ne soit écrit et sourcé dans le MDX correspondant.

export type ActivityLevel = 'Modérée' | 'Élevée' | 'Très élevée' | 'Faible'

export interface BreedHealthPoint {
  /** Titre court : nom de la prédisposition (« Hypothyroïdie ») */
  title: string
  /** Une ou deux phrases : lien avec l'alimentation, tiré de l'article */
  text: string
}

export interface Breed {
  /** Suffixe du slug d'article : nourriture-{slug} */
  slug: string
  /** Nom affiché (« Beagle », « Berger australien ») */
  name: string
  /** Poids adulte en kg [min, max] */
  weightKg: [number, number]
  /** Espérance de vie en années [min, max] */
  lifeYears: [number, number]
  activity: ActivityLevel
  /** Point d'attention principal, 3 mots maximum (« Prise de poids ») */
  watch: string
  /** Prédispositions qui touchent l'alimentation (3 au maximum) */
  health: BreedHealthPoint[]
  /** Phrase qui relie la race aux aliments (friandises, quantités, aliments à éviter) */
  foodNote?: string
  /** Slugs de 3 races proches (gabarit ou usage), parmi celles du fichier */
  near: string[]
}

export const BREEDS: Breed[] = [
  {
    slug: 'beagle',
    name: 'Beagle',
    weightKg: [9, 11],
    lifeYears: [12, 15],
    activity: 'Élevée',
    watch: 'Prise de poids',
    health: [
      { title: 'Obésité', text: "Une des races les plus exposées : 1 à 2 kg de trop suffisent à augmenter le risque articulaire, cardiaque et métabolique. La ration se pèse, jamais à l'œil." },
      { title: 'Hypothyroïdie', text: 'Elle ralentit le métabolisme et fait grossir même avec des rations normales. Un beagle qui prend du poids sans raison justifie une prise de sang thyroïdienne.' },
      { title: 'Épilepsie', text: 'Une alimentation stable, sans variations brutales de ration, limite les déclencheurs métaboliques.' },
    ],
    foodNote: "Le beagle mendie et vole la nourriture : les restes de table et les friandises grasses font vite grimper son poids. Les extras restent sous 10 % de la ration du jour.",
    near: ['basset-hound', 'jack-russell-terrier', 'cocker-spaniel'],
  },
]

export function getBreedBySlug(slug: string): Breed | undefined {
  return BREEDS.find((b) => b.slug === slug)
}

/** Fiche de la race d'un article `nourriture-{slug}`, sinon undefined. */
export function getBreedForArticle(articleSlug: string): Breed | undefined {
  return articleSlug.startsWith('nourriture-') ? getBreedBySlug(articleSlug.slice('nourriture-'.length)) : undefined
}
