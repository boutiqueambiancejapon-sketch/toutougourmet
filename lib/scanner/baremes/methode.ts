// @cdc scanner — les 4 barèmes en clair pour /scanner. Les points doivent rester alignés sur aliment.ts,
// friandise.ts, complement.ts et huile.ts : scripts/test-baremes.ts compare les totaux.

export type LigneBareme = [critere: string, points: number, regle: string]

export interface BaremePublic {
  id: 'aliment' | 'friandise' | 'complement' | 'huile'
  titre: string
  intro: string
  lignes: LigneBareme[]
  plafonds: string[]
}

export const BAREMES_PUBLICS: BaremePublic[] = [
  {
    id: 'aliment',
    titre: 'Comment note-t-on les croquettes et les pâtées ?',
    intro: 'Les chiffres sont ramenés sur matière sèche, une fois l\'eau retirée. Les croquettes et les pâtées ont chacune leur classement : l\'eau de la recette rend la comparaison trompeuse.',
    lignes: [
      ['Part animale sur sec', 16, 'La viande fraîche perd environ 70 % de son poids en eau, on la compte donc sèche. Les sous-produits comptent à moitié.'],
      ['Premier ingrédient', 15, 'Le plein pour une viande ou un poisson d\'espèce nommée, moins si l\'espèce n\'est pas dite, 0 pour un végétal.'],
      ['Protéines selon l\'âge', 10, 'Repère de 18 % sur sec pour un adulte, 21 % pour un senior ou une recette allégée, 25 % pour un chiot.'],
      ['Étiquette complète', 10, 'Constituants, calcium et phosphore, part animale chiffrée, calories.'],
      ['Glucides estimés', 8, 'Le plein jusqu\'à 30 % sur sec, 2 points au-delà de 50 %.'],
      ['Espèces nommées', 8, '0 si une catégorie comme « viandes et sous-produits animaux » apparaît.'],
      ['Base végétale', 8, '0 si un végétal féculent ouvre la liste, moins si plusieurs végétaux proches se suivent.'],
      ['Calcium et phosphore', 6, 'Leurs valeurs et leur rapport, de 1 à 2 pour un adulte. Si la marque déclare seulement le rapport, il rapporte ses points quand il est dans la plage.'],
      ['Matières grasses', 5, 'Le plein entre 10 et 22 % sur sec, 0 sous 5,5 %.'],
      ['Sucres ajoutés', 4, '0 si un sucre, un sirop ou du caramel est listé.'],
      ['Conservateurs', 4, '0 pour le BHA, le BHT ou l\'éthoxyquine, la moitié s\'ils sont cités sans leur nom.'],
      ['Cendres', 3, 'Le plein jusqu\'à 8 % sur sec.'],
      ['Colorants', 3, '0 si un colorant est listé.'],
    ],
    plafonds: [
      'Protéines sous 18 % ou matières grasses sous 5,5 % sur sec : 49 au plus.',
      'Composition sans analyse : 70 au plus.',
      'Glucides impossibles à estimer : 85 au plus.',
      'Calcium et phosphore absents : 90 au plus, même quand la marque déclare leur rapport, pour toutes les marques. Un rapport annoncé ne remplace pas deux valeurs écrites.',
      'Chiot avec un calcium au-dessus de 1,6 % sur sec, ou 1,8 % pour un petit gabarit : 59 au plus, avec une alerte.',
    ],
  },
  {
    id: 'friandise',
    titre: 'Comment note-t-on les friandises ?',
    intro: 'Une friandise complète la ration sans la remplacer : on juge sa recette et son poids dans la journée, avec un repère de 10 % des calories du jour.',
    lignes: [
      ['Premier ingrédient', 25, 'Le plein pour une viande ou un poisson nommé, 15 pour un morceau comme la trachée, 5 pour une partie à mâcher.'],
      ['Part de viande ou de poisson', 20, 'Selon les pourcentages écrits, 0 si aucun n\'est écrit.'],
      ['Poids dans la ration', 12, 'Selon les calories d\'une pièce. Sans le poids d\'une pièce, le plein reste hors de portée.'],
      ['Sucres ajoutés', 10, '0 si un sucre, un miel ou un sirop est listé.'],
      ['Additifs', 10, 'Colorant, conservateur sans nom, arôme artificiel : la moitié pour un, 0 pour deux.'],
      ['Longueur de la liste', 6, 'Le plein jusqu\'à 5 ingrédients.'],
      ['Sel ajouté', 5, '0 si du sel est listé.'],
      ['Étiquette complète', 5, 'Constituants et calories.'],
      ['Glycérine, animal sans nom', 4, 'La moitié pour un des deux, 0 pour les deux.'],
      ['Céréale ou farine en tête', 3, '0 si elle ouvre la liste.'],
    ],
    plafonds: ['Ni calories ni analyse : 80 au plus, et la friandise sort du classement.', 'Cuir brut, os cuit ou fumé : 45 au plus, avec une alerte.'],
  },
  {
    id: 'complement',
    titre: 'Comment note-t-on les compléments ?',
    intro: 'La note juge ce qui est écrit sur l\'étiquette, pas l\'effet du produit : une étiquette bien remplie ne dit pas qu\'il marche. Le résultat affiche une note et un rappel : ce n\'est pas un conseil de vétérinaire.',
    lignes: [
      ['Teneur des actifs chiffrée', 35, 'Chaque actif reconnu a-t-il sa dose écrite ?'],
      ['Ration indiquée', 20, 'Une ration écrite selon le poids du chien.'],
      ['Composition nommée', 20, 'Des ingrédients nommés plutôt que des catégories vagues.'],
      ['Recette sans remplissage', 15, 'On retire des points pour un sucre, un colorant, ou un ingrédient neutre en tête.'],
      ['Analyse affichée', 10, 'Protéines, matières grasses, cendres, fibres.'],
    ],
    plafonds: ['Aucune teneur d\'actif écrite : 60 au plus.', 'Étiquette complète : 90 au plus.', 'Pas de composition lisible : pas de note.'],
  },
  {
    id: 'huile',
    titre: 'Comment note-t-on les huiles ?',
    intro: 'La note regarde les oméga-3 que le chien utilise directement, l\'EPA et le DHA, et le soin apporté au produit. Elle ne donne aucune dose à viser. Le résultat affiche une note et le même rappel que pour les compléments.',
    lignes: [
      ['EPA et DHA chiffrés', 30, 'Le plein quand les deux sont chiffrés séparément.'],
      ['Espèce et source', 15, 'Le plein pour un poisson gras nommé, moins pour le foie de morue ou un poisson sans espèce.'],
      ['Ration comparée au repère NRC', 15, 'Toujours pour un chien de 10 kg. Sans EPA et DHA chiffrés, le critère sort du calcul.'],
      ['Pureté et origine', 15, 'Analyse ou certification citée, origine indiquée.'],
      ['Protection contre le rancissement', 15, 'Antioxydant nommé, indice d\'oxydation affiché.'],
      ['Conservation et emballage', 10, 'Consigne écrite, flacon opaque.'],
    ],
    plafonds: [
      'Huile végétale : 30 au plus, le chien convertit peu ses oméga-3.',
      'Rien de chiffré sur l\'EPA et le DHA : 50 au plus.',
      'Foie de morue sans vitamines A et D chiffrées : 60 au plus, avec un rappel : à ne pas cumuler avec un autre complément qui en apporte.',
      'Ration écrite au-dessus de la limite haute du NRC pour un chien de 10 kg : une alerte s\'affiche.',
    ],
  },
]
