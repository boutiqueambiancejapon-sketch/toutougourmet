// @cdc guide — classement des aliments du livre par famille. Les verdicts et les notes viennent
// du frontmatter des articles (verdict, verdictNote, ogTitle) : rien n'est réécrit ici, sauf
// les rares notes remplacées par une phrase du TL;DR de l'article (NOTE_FROM_TLDR).
// Un article à verdict absent de FOOD_FAMILY n'entre pas dans le livre (EXCLUDED le dit).

export type GuideFamily = 'fruits' | 'legumes' | 'viandes' | 'feculents' | 'laitiers' | 'divers'

export const GUIDE_FAMILIES: { id: GuideFamily; title: string; image?: string; intro?: string }[] = [
  // Phrase de la maquette validée, reprise de la règle des 10 % des fiches et recettes.
  { id: 'fruits', title: 'Fruits', image: '/images/articles/art-chien-peut-manger-pomme.jpeg', intro: 'En friandise, pas plus de 10 % de sa ration du jour.' },
  { id: 'legumes', title: 'Légumes', image: '/images/articles/art-chien-peut-manger-carottes.jpeg', intro: 'En friandise, pas plus de 10 % de sa ration du jour.' },
  { id: 'viandes', title: 'Viandes et poissons', image: '/images/articles/art-chien-peut-manger-thon.jpeg' },
  { id: 'feculents', title: 'Féculents et céréales', image: '/images/articles/art-chien-peut-manger-pates.jpeg' },
  { id: 'laitiers', title: 'Produits laitiers et œufs' },
  { id: 'divers', title: 'Divers', image: '/images/articles/art-chien-peut-manger-cacahuetes.jpeg' },
]

const fam = (family: GuideFamily, slugs: string[]): [string, GuideFamily][] => slugs.map((s) => [s, family])

export const FOOD_FAMILY: Record<string, GuideFamily> = Object.fromEntries([
  ...fam('fruits', [
    'chien-peut-manger-abricots', 'chien-peut-manger-ananas', 'chien-peut-manger-avocat', 'chien-peut-manger-banane',
    'chien-peut-manger-cerises', 'chien-peut-manger-clementine-orange', 'chien-peut-manger-figue', 'chien-peut-manger-fraises',
    'chien-peut-manger-framboises', 'chien-peut-manger-kiwi', 'chien-peut-manger-mangue', 'chien-peut-manger-melon',
    'chien-peut-manger-mures', 'chien-peut-manger-myrtilles', 'chien-peut-manger-noix-de-coco', 'chien-peut-manger-pasteque',
    'chien-peut-manger-peches', 'chien-peut-manger-poires', 'chien-peut-manger-pomme', 'chien-peut-manger-prunes',
    'chien-mange-raisin-urgence',
  ]),
  ...fam('legumes', [
    'chien-peut-manger-asperges', 'chien-peut-manger-aubergines', 'chien-peut-manger-betterave', 'chien-peut-manger-brocoli',
    'chien-peut-manger-butternut-potiron', 'chien-peut-manger-carottes', 'chien-peut-manger-celeri', 'chien-peut-manger-champignons',
    'chien-peut-manger-chou-fleur', 'chien-peut-manger-concombre', 'chien-peut-manger-cornichons', 'chien-peut-manger-courgette',
    'chien-peut-manger-endives', 'chien-peut-manger-epinards', 'chien-peut-manger-fenouil', 'chien-peut-manger-haricots-verts',
    'chien-peut-manger-lentilles', 'chien-peut-manger-navet', 'chien-peut-manger-olives', 'chien-peut-manger-petits-pois',
    'chien-peut-manger-pissenlits', 'chien-peut-manger-poivron', 'chien-peut-manger-radis', 'chien-peut-manger-salade',
    'chien-peut-manger-tomate', 'chien-peut-manger-oignons', 'chien-mange-ail-oignon-urgence', 'chien-mange-poireau-urgence',
    'chien-peut-manger-piment',
  ]),
  ...fam('viandes', [
    'chien-peut-manger-agneau', 'chien-peut-manger-boeuf-cru', 'chien-peut-manger-canard', 'chien-peut-manger-crevettes',
    'chien-peut-manger-dinde', 'chien-peut-manger-foie', 'chien-peut-manger-jambon', 'chien-peut-manger-lapin',
    'chien-peut-manger-porc', 'chien-peut-manger-poulet-cru', 'chien-peut-manger-sardines', 'chien-peut-manger-saumon',
    'chien-peut-manger-thon', 'chien-peut-manger-viande-crue-barf', 'os-poulet-chien-danger',
  ]),
  ...fam('feculents', [
    'chien-peut-manger-avoine', 'chien-peut-manger-mais', 'chien-peut-manger-pain', 'chien-peut-manger-patate-douce',
    'chien-peut-manger-pates', 'chien-peut-manger-pommes-de-terre', 'chien-peut-manger-riz', 'chien-peut-manger-pop-corn',
  ]),
  ...fam('laitiers', ['chien-peut-manger-fromage', 'chien-peut-manger-yaourt', 'chien-peut-manger-oeufs']),
  ...fam('divers', [
    'chien-peut-manger-amandes', 'chien-peut-manger-beurre-de-cacahuete', 'chien-peut-manger-cacahuetes', 'chien-peut-manger-cannelle',
    'chien-peut-manger-gingembre', 'chien-peut-manger-miel', 'chien-peut-manger-noisettes', 'chien-peut-manger-noix',
    'chien-peut-manger-persil', 'chien-mange-cafe-urgence', 'chien-mange-chocolat-urgence', 'chien-mange-glands-chene-urgence',
    'chien-mange-noix-cajou', 'chien-mange-noix-macadamia-urgence', 'chien-mange-pistaches', 'chien-mange-xylitol-urgence',
    'halloween-chien-bonbons-citrouille-dangers',
  ]),
])

/**
 * Articles à verdict laissés hors du livre : ce ne sont pas des aliments (crapaud, limace,
 * mort-aux-rats, eau de mer), ou ils doublent une autre fiche (liste des toxiques, os cuits).
 */
export const EXCLUDED = new Set([
  'aliments-toxiques-chien-liste-complete', 'chien-mange-crapaud-urgence', 'chien-mange-limace-urgence',
  'chien-mange-mort-aux-rats-urgence', 'chien-a-bu-eau-de-mer-que-faire', 'chien-mange-os-cuit-urgence',
  'chien-mange-os-poulet-urgence',
])

/** Nom affiché quand le titre de l'article en nomme deux (la fiche oignon existe à part). */
export const LABEL_OVERRIDES: Record<string, string> = {
  'chien-mange-ail-oignon-urgence': 'Ail',
  'chien-mange-raisin-urgence': 'Raisin, raisins secs',
}

/**
 * verdictNote sans information sur l'aliment (« appelle le vétérinaire ») : remplacée par une
 * phrase du TL;DR de l'article, copiée telle quelle.
 */
export const NOTE_FROM_TLDR: Record<string, string> = {
  'chien-mange-chocolat-urgence': 'Deux carrés de chocolat noir 70 % suffisent à rendre malade un chien de 5 kg.',
}
