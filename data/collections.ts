// @cdc seo — hubs de collection : sous-hubs thématiques de « Bien nourrir » et hubs par profil.
// Une collection ne change jamais l'URL d'un article : elle le regroupe.
// Appartenance : frontmatter `theme: "<slug>"` (un seul thème) ou `profils: ["<slug>", …]`.
// Les hubs profil listent aussi les sections des autres articles dont le titre
// correspond à `headingPattern` (ex. « Et pour un chiot ? » dans une fiche race).

export interface CollectionTool {
  href: string
  label: string
}

export interface Collection {
  slug: string
  kind: 'theme' | 'profil'
  /** Libellé court (cartes, fil d'Ariane, encart article) */
  label: string
  h1: string
  /** ≤ 60 caractères, le template ajoute « | Toutou Gourmet » */
  metaTitle: string
  /** ≤ 155 caractères */
  metaDescription: string
  intro: string[]
  guidesHeading: string
  mentionsHeading?: string
  /** Regex (insensible à la casse) appliquée aux titres H2/H3 des autres articles */
  headingPattern?: string
  tools?: CollectionTool[]
  faqHeading: string
}

export const PARENT_THEME_CATEGORY = 'alimentation-quotidienne'

export const collections: Collection[] = [
  // ── Profils ─────────────────────────────────────────────────────────────────
  {
    slug: 'chiot',
    kind: 'profil',
    label: 'Chiot',
    h1: 'Alimentation du chiot : le guide de 0 à 24 mois',
    metaTitle: 'Alimentation du chiot : guide de 0 à 24 mois',
    metaDescription:
      'Sevrage, nombre de repas, calcium des grandes races, passage aux croquettes adulte : tous nos guides pour nourrir un chiot, mois par mois.',
    intro: [
      "Un chiot grandit le plus vite entre 2 et 6 mois, et c'est à cet âge que ses besoins en énergie et en nutriments sont les plus élevés de sa vie. Jusqu'à 4 mois, il mange 3 à 4 repas par jour.",
      "Son gabarit adulte change la ration. Au-delà de 25 kg à l'âge adulte, un excès de calcium abîme les cartilages de croissance (FEDIAF 2021), et le passage aux croquettes adulte attend 18 à 24 mois, contre 9 à 10 mois pour une petite race.",
    ],
    guidesHeading: 'Que donner à manger à un chiot, du sevrage à l\'âge adulte ?',
    mentionsHeading: 'Où trouver les conseils chiot dans nos autres guides ?',
    headingPattern: '\\bchiots?\\b',
    tools: [
      { href: '/outils/ration', label: 'Calculer la ration journalière de son chiot' },
      { href: '/outils/poids', label: 'Suivre la courbe de poids pendant la croissance' },
      { href: '/outils/age', label: "Convertir l'âge du chien en âge humain" },
    ],
    faqHeading: "Questions fréquentes sur l'alimentation du chiot",
  },
  {
    slug: 'senior',
    kind: 'profil',
    label: 'Chien senior',
    h1: 'Alimentation du chien senior : adapter la ration après 7 ans',
    metaTitle: 'Alimentation du chien senior : nos guides',
    metaDescription:
      'Âge senior selon le gabarit, calories en baisse, protéines maintenues, reins et articulations : nos guides pour nourrir un chien âgé.',
    intro: [
      'Un chien devient senior entre 5 ans pour une race géante et 10 ans pour un petit chien (WSAVA, 2024). Ses besoins caloriques baissent de 20 à 30 %, ses besoins en protéines restent les mêmes ou augmentent.',
      'La ration change donc de composition, pas seulement de volume : moins de phosphore pour protéger les reins, des protéines digestibles pour garder la masse musculaire, et une attention aux articulations.',
    ],
    guidesHeading: 'Comment nourrir un chien âgé ?',
    mentionsHeading: 'Où trouver les conseils senior dans nos autres guides ?',
    headingPattern: '\\bseniors?\\b|\\bâgés?\\b',
    tools: [
      { href: '/outils/ration', label: 'Recalculer la ration d\'un chien moins actif' },
      { href: '/outils/age', label: "Convertir l'âge du chien en âge humain" },
    ],
    faqHeading: "Questions fréquentes sur l'alimentation du chien senior",
  },
  {
    slug: 'gestation-allaitement',
    kind: 'profil',
    label: 'Chienne gestante ou allaitante',
    h1: 'Alimentation de la chienne gestante et allaitante',
    metaTitle: 'Alimentation chienne gestante et allaitante',
    metaDescription:
      "Ration de la chienne pendant la gestation puis l'allaitement, semaine par semaine, jusqu'au sevrage des chiots.",
    intro: [
      "Les besoins d'une chienne évoluent pendant la gestation, puis augmentent fortement pendant l'allaitement. Notre guide suit sa ration semaine par semaine, jusqu'au sevrage des chiots.",
    ],
    guidesHeading: 'Comment nourrir une chienne gestante puis allaitante ?',
    mentionsHeading: 'Où en parle-t-on dans nos autres guides ?',
    headingPattern: 'gestante|gestation|allait',
    faqHeading: "Questions fréquentes sur l'alimentation de la chienne gestante",
  },
  {
    slug: 'chien-sportif',
    kind: 'profil',
    label: 'Chien sportif ou de travail',
    h1: 'Alimentation du chien sportif, de chasse ou de travail',
    metaTitle: 'Alimentation du chien sportif et de travail',
    metaDescription:
      "Besoins énergétiques à l'effort, repas avant et après la séance, croquettes pour chien de chasse ou de travail : nos guides.",
    intro: [
      "Selon l'intensité et la durée de l'effort, un chien sportif dépense 20 à 100 % d'énergie en plus (VetAgro Sup, 2013). Il brûle d'abord des lipides : une ration d'endurance tire environ 60 % de ses calories des graisses (Reynolds et al., Journal of Applied Physiology, 1995).",
      "Le dernier repas se donne 2 à 3 heures avant le départ, et la récupération se joue dans les 30 à 90 minutes après l'arrêt.",
    ],
    guidesHeading: 'Que donner à un chien qui court, chasse ou travaille ?',
    mentionsHeading: "Où trouver les conseils pour chien actif dans nos autres guides ?",
    headingPattern: 'sporti|chasse|chiens? de travail|races? de travail|effort',
    tools: [{ href: '/outils/ration', label: "Calculer la ration selon le niveau d'activité" }],
    faqHeading: "Questions fréquentes sur l'alimentation du chien sportif",
  },

  // ── Sous-hubs de « Bien nourrir son chien » ─────────────────────────────────
  {
    slug: 'croquettes-patees',
    kind: 'theme',
    label: 'Croquettes et pâtées',
    h1: 'Croquettes et pâtées pour chien : choisir, doser, conserver',
    metaTitle: 'Croquettes et pâtées pour chien : nos guides',
    metaDescription:
      "Lire une étiquette, choisir une croquette selon la santé du chien, comparer croquettes et pâtée, les conserver : tous nos guides pratiques.",
    intro: [
      "Une croquette se juge sur son étiquette : taux de protéines et de glucides, sources animales nommées, calcium pour un chiot de grande race. Ces guides expliquent comment la lire et quel aliment choisir selon le chien : allergique, stérilisé, à la digestion sensible ou trop maigre.",
      'Ils couvrent aussi la pâtée, le choix entre les deux, et la conservation une fois le sac ou la boîte ouverts.',
    ],
    guidesHeading: 'Comment choisir et utiliser croquettes et pâtées ?',
    faqHeading: 'Questions fréquentes sur les croquettes et pâtées',
  },
  {
    slug: 'recettes-maison',
    kind: 'theme',
    label: 'Recettes maison',
    h1: 'Recettes maison pour chien : pâtées, friandises et ration ménagère',
    metaTitle: 'Recettes maison pour chien : pâtées et friandises',
    metaDescription:
      'Pâtées maison, biscuits, friandises séchées, BARF et ration ménagère : nos recettes pour chien avec dosages et erreurs à éviter.',
    intro: [
      "Cuisiner pour son chien demande un calcul, pas seulement une recette : une pâtée maison sans source de calcium donne une ration déséquilibrée. Chaque recette de ce dossier donne les quantités, le dosage selon le poids et la conservation.",
      'On y trouve les pâtées complètes (poulet, bœuf, agneau, dinde, lapin, poisson), les friandises et biscuits, le BARF et la ration ménagère.',
    ],
    guidesHeading: 'Quelles recettes maison donner à son chien ?',
    faqHeading: 'Questions fréquentes sur les recettes maison pour chien',
  },
  {
    slug: 'quantites-repas',
    kind: 'theme',
    label: 'Quantités, repas et horaires',
    h1: 'Quantités, repas et horaires : combien et quand nourrir son chien',
    metaTitle: 'Quantité et horaires des repas du chien',
    metaDescription:
      "Quelle quantité de croquettes, de pâtée et d'eau par jour, combien de repas, à quelle heure et pour quel budget : nos guides et calculs.",
    intro: [
      "La ration d'un chien dépend de son poids, de son âge, de son activité et de la densité énergétique de l'aliment. Ces guides donnent les calculs pour les croquettes, la pâtée et l'eau, le nombre de repas par jour et les horaires.",
      "Ils traitent aussi du budget mensuel, de la transition entre deux aliments et du chien qui mange trop vite ou trop.",
    ],
    guidesHeading: 'Combien et quand donner à manger à son chien ?',
    tools: [
      { href: '/outils/ration', label: 'Calculateur de ration journalière' },
      { href: '/outils/budget', label: 'Calculateur de budget nourriture' },
      { href: '/outils/cout', label: 'Simulateur de coût mensuel' },
    ],
    faqHeading: 'Questions fréquentes sur les quantités et les repas',
  },
  {
    slug: 'complements-nutriments',
    kind: 'theme',
    label: 'Compléments et nutriments',
    h1: 'Compléments et nutriments pour chien : ce qui marche, à quelle dose',
    metaTitle: 'Compléments alimentaires pour chien : nos guides',
    metaDescription:
      'Huile de saumon, probiotiques, glucosamine, curcuma, levure de bière : études, dosage par poids et contre-indications de chaque complément.',
    intro: [
      "Chaque complément a ses études, sa dose par kilo et ses contre-indications. Ce dossier les passe en revue un par un : huiles et oméga-3, probiotiques, articulations, plantes.",
      "Il couvre aussi les nutriments de base (protéines, glucides, fibres, taurine) qui disent si un complément sert vraiment ou si la ration suffit.",
    ],
    guidesHeading: 'Quels compléments donner à son chien, et à quelle dose ?',
    faqHeading: 'Questions fréquentes sur les compléments pour chien',
  },
]

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug)
}
