// @cdc guide — les 6 recettes du livre, reprises des articles (ingrédients, étapes, doses par
// gabarit, mises en garde). Seule la forme change : étapes à l'impératif en « tu » comme la
// maquette validée, phrases raccourcies. Aucune quantité ni conseil ajouté. Si un article change,
// mettre la recette à jour ici puis régénérer le PDF (npm run guide:pdf).

export interface GuideRecipe {
  /** Article d'origine (URL : /chien/{categorySlug}/{slug}) */
  slug: string
  categorySlug: string
  title: string
  meta: string[]
  /** Couverture de l'article, seulement si elle existe dans public/images/articles */
  image?: string
  ingredients: string[]
  steps: string[]
  doses: { head: [string, string]; rows: [string, string][]; note?: string }
  /** Encadré facultatif (proportions, variante) repris de l'article */
  aside?: { title: string; rows: [string, string][] }
  warnings: string[]
}

const BY_WEIGHT = ['2 à 5 kg', '5 à 10 kg', '10 à 20 kg', '20 à 35 kg', 'Plus de 35 kg'] as const
const byWeight = (values: readonly string[]): [string, string][] => BY_WEIGHT.map((w, i) => [w, values[i]])

export const GUIDE_RECIPES: GuideRecipe[] = [
  {
    slug: 'recette-patee-maison-poulet-chien',
    categorySlug: 'alimentation-quotidienne',
    title: 'Pâtée maison au poulet',
    meta: ['5 ingrédients', '30 min', 'Repas'],
    image: '/images/articles/art-recette-patee-maison-poulet-chien.jpeg',
    ingredients: [
      '250 g de blanc ou cuisse de poulet, sans peau ni os, cuit',
      '125 g de riz blanc bien cuit',
      '125 g de courgette ou de haricots verts cuits',
      '1 c. à soupe d’huile de colza ou de saumon',
      'Complément minéral-vitaminé (CMV) pour ration ménagère, selon le produit et le vétérinaire',
    ],
    steps: [
      'Cuis le poulet sans peau ni os, à l’eau frémissante ou à la vapeur, 15 à 20 min, jusqu’à ce qu’il ne reste aucune partie rosée.',
      'Cuis le riz dans deux fois son volume d’eau non salée, jusqu’à une texture molle.',
      'Cuis les légumes à la vapeur 8 à 10 min, puis coupe-les en petits morceaux ou écrase-les.',
      'Émiette le poulet une fois tiède, en vérifiant l’absence d’esquille d’os.',
      'Mélange poulet, riz et légumes. Ajoute l’huile après cuisson : la chaleur dégrade les oméga-3.',
      'Incorpore le complément minéral-vitaminé à la dose indiquée, sur la ration refroidie.',
      'Sers tiède, jamais brûlant ni sortant du réfrigérateur.',
    ],
    doses: {
      head: ['Poids du chien', 'Ration par jour (adulte)'],
      rows: [
        ['5 kg', '220 à 260 g'],
        ['10 kg', '370 à 440 g'],
        ['20 kg', '630 à 740 g'],
        ['30 kg', '850 à 1 000 g'],
        ['40 kg', '1 050 à 1 240 g'],
      ],
      note: 'Moitié poulet, moitié riz et légumes. Bas de la fourchette : chien stérilisé, haut : chien entier.',
    },
    warnings: [
      'Sans complément minéral-vitaminé, la ration manque de calcium (rapport Ca/P proche de 1:15) : la carence n° 1 des recettes maison (Stockman 2013).',
      'Le poulet se donne toujours cuit, sans peau ni os.',
    ],
  },
  {
    slug: 'recette-biscuits-potiron-chien',
    categorySlug: 'alimentation-quotidienne',
    title: 'Biscuits au potiron',
    meta: ['5 ingrédients', '25 min à 180 °C', '25 biscuits'],
    image: '/images/articles/art-recette-biscuits-potiron-chien.jpeg',
    ingredients: [
      '200 g de purée de potiron nature',
      '120 g de flocons d’avoine',
      '1 œuf',
      '60 à 80 g de farine de sarrasin, riz ou pois chiche',
      '1 c. à café d’huile de coco (facultatif)',
    ],
    steps: [
      'Four à 180 °C.',
      'Mélange la purée tiède, l’œuf et les flocons.',
      'Ajoute la farine 30 g à la fois, jusqu’à une pâte ferme.',
      'Étale sur 5 mm, découpe des carrés de 4 cm.',
      '20 à 25 min au four, refroidis sur une grille.',
    ],
    doses: { head: ['Poids du chien', 'Biscuits par jour'], rows: byWeight(['1', '1 à 2', '2 à 3', '3 à 4', '4 à 5']) },
    warnings: ['Jamais de purée pour tarte au potiron : sucre, muscade, parfois xylitol.'],
  },
  {
    slug: 'recette-muffins-sales-poulet-courgette-chien',
    categorySlug: 'alimentation-quotidienne',
    title: 'Muffins au poulet et à la courgette',
    meta: ['7 ingrédients', '20 à 25 min à 180 °C', '24 mini-muffins'],
    image: '/images/articles/art-recette-muffins-sales-poulet-courgette-chien.jpeg',
    ingredients: [
      '150 g de blanc de poulet cuit, sans peau, haché fin',
      '150 g de courgette râpée, essorée dans un torchon',
      '80 g de carotte râpée',
      '2 œufs',
      '120 g de flocons d’avoine mixés en farine grossière',
      '40 g de fromage blanc nature',
      '1 c. à soupe d’huile d’olive',
      '2 c. à soupe de persil frais ciselé (facultatif)',
    ],
    steps: [
      'Préchauffe le four à 180 °C en chaleur tournante.',
      'Râpe la courgette et presse-la dans un torchon jusqu’à ce qu’elle ne rende presque plus d’eau.',
      'Mixe les flocons d’avoine en farine grossière.',
      'Bats les œufs avec l’huile d’olive et le fromage blanc.',
      'Ajoute le poulet, la courgette, la carotte et le persil, puis la farine d’avoine. La pâte doit tenir sur la cuillère.',
      'Remplis les alvéoles huilées aux trois quarts.',
      'Enfourne 20 à 25 min, jusqu’à ce que la lame d’un couteau ressorte sèche.',
      'Laisse refroidir 15 min sur une grille avant de démouler.',
    ],
    doses: { head: ['Poids du chien', 'Muffins par jour'], rows: byWeight(['½', '1', '2', '2 à 3', '3']) },
    warnings: ['Pas de sel, pas d’oignon, pas d’ail, pas de levure chimique.', 'Au réfrigérateur 3 jours, au congélateur 3 mois.'],
  },
  {
    slug: 'recette-patate-douce-sechee-chien',
    categorySlug: 'alimentation-quotidienne',
    title: 'Patate douce séchée',
    meta: ['1 ingrédient', 'Four à 90 °C, 3 à 6 h', 'Moelleux ou croquant'],
    image: '/images/articles/art-recette-patate-douce-sechee-chien.jpeg',
    ingredients: [
      '1 patate douce, ni sel, ni sucre, ni additif',
      'Lamelles de 8 à 10 mm pour une bande moelleuse à mâcher',
      'Lamelles de 3 à 4 mm pour une chips croquante',
    ],
    steps: [
      'Épluche la patate douce et rince-la.',
      'Coupe-la en lamelles régulières : dans la longueur pour des bandes à mâcher, en rondelles pour des chips.',
      'Préchauffe le four à 90 °C en chaleur tournante.',
      'Pose les lamelles sur une grille au-dessus d’une plaque, pour que le dessous sèche aussi.',
      'Coince une cuillère en bois dans la porte pour la laisser entrouverte.',
      'Sèche 3 à 6 h en retournant les lamelles à mi-cuisson. Surveille à partir de la 3e heure.',
      'Au déshydrateur : 60 à 70 °C pendant 8 à 14 h.',
    ],
    doses: {
      head: ['Poids du chien', 'Lamelles par jour au plus'],
      rows: byWeight(['1 petite lamelle ou quelques miettes', '1 à 2 lamelles fines', '2 à 3 lamelles', '3 à 4 lamelles', '4 à 5 lamelles']),
    },
    warnings: [
      'Elle compte dans les 10 % de friandises du jour, et se limite chez le chien diabétique, en surpoids ou sujet aux calculs d’oxalate de calcium.',
    ],
  },
  {
    slug: 'recette-glace-maison-chien-ete',
    categorySlug: 'alimentation-quotidienne',
    title: 'Glace au yaourt grec et aux myrtilles',
    meta: ['3 ingrédients', '4 à 6 h au congélateur', '12 mini-glaçons'],
    ingredients: [
      '200 g de yaourt grec nature 0 % ou de skyr nature',
      '60 g de myrtilles fraîches ou surgelées non sucrées',
      '30 à 50 ml d’eau filtrée',
    ],
    steps: [
      'Mixe les myrtilles avec 30 ml d’eau jusqu’à obtenir un coulis lisse. Filtre-le pour un petit chien si tu crains les peaux.',
      'Mélange le yaourt grec au coulis. Ajoute 10 à 20 ml d’eau si la pâte est trop épaisse : elle doit se verser.',
      'Remplis un bac à glaçons souple, des mini-moules en silicone ou un pot de yaourt vide, sur 3 à 4 cm de hauteur au plus.',
      'Laisse 4 à 6 h au congélateur. Démoule en passant le moule sous l’eau tiède.',
    ],
    doses: {
      head: ['Chien', 'Taille du cube'],
      rows: [
        ['Chihuahua, Yorkshire, Bichon', '10 à 15 ml'],
        ['Cocker, Cavalier, Beagle', '25 à 30 ml'],
        ['Labrador, Berger', 'Pot de yaourt (60 à 80 ml)'],
      ],
      note: 'Un cube par portion, une fois par jour au plus chez l’adulte en bonne santé.',
    },
    warnings: [
      'Jamais de xylitol (E967, « sucre de bouleau »), toxique dès 0,1 g/kg : il se cache dans certains yaourts 0 %.',
      'Avant 3 mois, pas de glace.',
    ],
  },
  {
    slug: 'ration-menagere-chien-guide-recettes',
    categorySlug: 'alimentation-quotidienne',
    title: 'Ration ménagère au poisson, chien sensible',
    meta: ['5 ingrédients', 'Pour un chien de 10 kg', 'Une seule protéine'],
    ingredients: [
      '150 g de colin ou de cabillaud cuit vapeur',
      '100 g de riz blanc très cuit (poids cuit)',
      '70 g de courgettes cuites',
      '½ c. à café d’huile de lin',
      'CMV selon la posologie, sans allergène pour ton chien',
    ],
    steps: [
      'Cuis le poisson à la vapeur ou au four, sans matière grasse, jusqu’à plus de 70 °C à cœur.',
      'Cuis le riz longuement, dans 3 volumes d’eau : très cuit, il se digère mieux.',
      'Cuis les courgettes à la vapeur ou à l’eau, puis mixe-les ou coupe-les en petits morceaux pour un petit chien.',
      'Ajoute l’huile et le CMV au moment de servir, sur le repas à température ambiante.',
      'Garde 3 jours au réfrigérateur ou 3 mois au congélateur. Décongèle au réfrigérateur, jamais au micro-ondes.',
    ],
    doses: { head: ['Poids du chien', 'Quantités'], rows: [['10 kg', 'Celles de la liste, pour une journée']] },
    aside: {
      title: 'Les 5 composantes d’une ration ménagère',
      rows: [
        ['Protéine animale', '50 %'],
        ['Féculent cuit', '20 à 25 %'],
        ['Légumes', '15 à 20 %'],
        ['Huile', '1 à 2 % (1 c. à café par 10 kg)'],
        ['CMV', 'Selon le produit'],
      ],
    },
    warnings: [
      'Le CMV n’est pas optionnel : sans lui, 94 % des rations maison sont déséquilibrées (Texas A&M, Dog Aging Project, 2025).',
    ],
  },
]
