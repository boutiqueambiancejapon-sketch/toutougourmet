import { IconBars, IconBowl, IconCake, IconCoins, IconHeart, IconScale, IconTarget, type IconProps } from '@/components/icons'

// @cdc 04-pages — liste des outils, partagée par le hub /outils et la rubrique « Autres outils »
// en bas de chaque page outil. Chaque outil est présenté par la question à laquelle il répond.

export type ToolSlug = 'ration' | 'age' | 'poids' | 'budget' | 'cout' | 'bien-nourri' | 'quiz'

export interface ToolEntry {
  slug: ToolSlug
  href: string
  question: string
  name: string
  detail: string
  Icon: (props: IconProps) => React.JSX.Element
}

export const TOOLS: ToolEntry[] = [
  {
    slug: 'ration',
    href: '/outils/ration',
    question: 'Combien de grammes par jour\u00a0?',
    name: 'Ration journalière',
    detail: 'Selon son poids, son âge, son activité et la stérilisation, en croquettes ou en repas frais.',
    Icon: IconBowl,
  },
  {
    slug: 'poids',
    href: '/outils/poids',
    question: 'Est-il trop gros ou trop maigre\u00a0?',
    name: 'Poids et état corporel',
    detail: 'Son poids actuel comparé à son poids de forme.',
    Icon: IconScale,
  },
  {
    slug: 'bien-nourri',
    href: '/outils/bien-nourri',
    question: 'Est-il bien nourri\u00a0?',
    name: 'Bilan alimentation',
    detail: '6 questions sur sa gamelle, sa silhouette et sa digestion. Score sur 100.',
    Icon: IconHeart,
  },
  {
    slug: 'age',
    href: '/outils/age',
    question: 'Quel âge a-t-il en années humaines\u00a0?',
    name: 'Âge humain',
    detail: "Selon son gabarit, avec le tableau de l'AVMA.",
    Icon: IconCake,
  },
  {
    slug: 'budget',
    href: '/outils/budget',
    question: 'Combien ça coûte par mois, marque par marque\u00a0?',
    name: 'Budget mensuel',
    detail: 'Franklin, Elmut et Dog Chef pour la ration de ton chien.',
    Icon: IconCoins,
  },
  {
    slug: 'cout',
    href: '/outils/cout',
    question: 'Croquettes ou repas frais, quelle différence sur un an\u00a0?',
    name: 'Coût annuel',
    detail: "Quatre façons de le nourrir, comparées au mois et à l'année.",
    Icon: IconBars,
  },
  {
    slug: 'quiz',
    href: '/quiz',
    question: 'Quelle marque lui correspond\u00a0?',
    name: 'Test de la marque',
    detail: 'Quelques questions sur son profil, une marque conseillée.',
    Icon: IconTarget,
  },
]
