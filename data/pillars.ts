// @cdc seo-geo contenu éditorial des pages piliers (/chien/{rubrique}) : introduction développée,
// FAQ (balisée en JSON-LD FAQPage) et sources. Texte en français, règles du skill boileau,
// chaque chiffre sourcé dans `sources`. Gras autorisé avec **…** ; liens internes avec [texte](/chemin).

export interface PillarFaq {
  q: string
  a: string
}

export interface PillarContent {
  /** H2 de la section d'introduction (question naturelle) */
  heading: string
  /** 3 à 6 paragraphes */
  intro: string[]
  /** 5 à 8 questions */
  faq: PillarFaq[]
  sources: { label: string; url: string }[]
}

// Sources communes à plusieurs rubriques.
const SRC = {
  principe: {
    label: "Príncipe et al., 2025, Assessment of the Nutritional Impact of the 10% Snack Recommendation in Pet Diets, Vet Sci 12(3):282 (règle des 10 % WSAVA et AAHA)",
    url: "https://doi.org/10.3390/vetsci12030282",
  },
  fediaf: {
    label: "FEDIAF, 2025, Nutritional Guidelines for Complete and Complementary Pet Food for Cats and Dogs (besoin énergétique d'entretien)",
    url: "https://europeanpetfood.org/self-regulation/nutritional-guidelines/",
  },
  aspcaFoods: {
    label: "ASPCA Animal Poison Control, People Foods to Avoid Feeding Your Pets",
    url: "https://www.aspca.org/pet-care/animal-poison-control/people-foods-avoid-feeding-your-pets",
  },
  aspcaCherry: {
    label: "ASPCA Animal Poison Control, Cherry (glycosides cyanogènes du noyau, des tiges et des feuilles)",
    url: "https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/cherry",
  },
  aspcaTomato: {
    label: "ASPCA Animal Poison Control, Tomato Plant (solanine, fruit mûr non toxique)",
    url: "https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/tomato-plant",
  },
  merckChocolate: {
    label: "Hayes C, Merck Veterinary Manual, 2024, Chocolate Toxicosis in Animals",
    url: "https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals",
  },
  merckXylitol: {
    label: "Hayes C, Merck Veterinary Manual, 2025, Xylitol Toxicosis in Dogs",
    url: "https://www.merckvetmanual.com/toxicology/food-hazards/xylitol-toxicosis-in-dogs",
  },
  merckAllium: {
    label: "Hayes C, Merck Veterinary Manual, 2024, Garlic and Onion (Allium spp) Toxicosis in Animals",
    url: "https://www.merckvetmanual.com/toxicology/food-hazards/garlic-and-onion-allium-spp-toxicosis-in-animals",
  },
  merckMacadamia: {
    label: "Hayes C, Merck Veterinary Manual, 2024, Macadamia Nut Toxicosis in Dogs",
    url: "https://www.merckvetmanual.com/toxicology/food-hazards/macadamia-nut-toxicosis-in-dogs",
  },
  usdaFdc: {
    label: "USDA FoodData Central, valeurs nutritionnelles des fruits crus (fraise, pomme, banane)",
    url: "https://fdc.nal.usda.gov/",
  },
  usdaFsis: {
    label: "USDA Food Safety and Inspection Service, 2021, Safe Minimum Internal Temperature Chart",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart",
  },
  nemser: {
    label: "Nemser SM et al., 2014, Investigation of Listeria, Salmonella, and Toxigenic Escherichia coli in Various Pet Foods, Foodborne Pathog Dis 11(9):706-709",
    url: "https://doi.org/10.1089/fpd.2014.1748",
  },
  kealy: {
    label: "Kealy RD et al., 2002, Effects of diet restriction on life span and age-related changes in dogs, J Am Vet Med Assoc 220(9):1315-1320",
    url: "https://doi.org/10.2460/javma.2002.220.1315",
  },
  stockman: {
    label: "Stockman J, Fascetti AJ, Kass PH, Larsen JA, 2013, Evaluation of recipes of home-prepared maintenance diets for dogs, J Am Vet Med Assoc 242(11):1500-1505",
    url: "https://doi.org/10.2460/javma.242.11.1500",
  },
  mueller: {
    label: "Mueller RS, Olivry T, Prélaud P, 2016, Critically appraised topic on adverse food reactions of companion animals (2): common food allergen sources in dogs and cats, BMC Vet Res 12:9",
    url: "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-016-0633-8",
  },
  olivry: {
    label: "Olivry T, Mueller RS, Prélaud P, 2015, Critically appraised topic on adverse food reactions of companion animals (1): duration of elimination diets, BMC Vet Res 11:225",
    url: "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-015-0541-3",
  },
  reglement767: {
    label: "Règlement (CE) n° 767/2009 concernant la mise sur le marché et l'utilisation des aliments pour animaux (étiquetage)",
    url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32009R0767",
  },
  nrc: {
    label: "National Research Council, 2006, Nutrient Requirements of Dogs and Cats (besoins en eau)",
    url: "https://nap.nationalacademies.org/catalog/10668/nutrient-requirements-of-dogs-and-cats",
  },
  laflamme: {
    label: "WSAVA, Body Condition Score chart, échelle en 9 points de Laflamme (1997, Canine Practice 22:10-15)",
    url: "https://wsava.org/wp-content/uploads/2020/01/Body-Condition-Score-Dog.pdf",
  },
  hart: {
    label: "Hart BL, Hart LA, Thigpen AP et al., 2018, The paradox of canine conspecific coprophagy, Vet Med Sci 4(2):106-114",
    url: "https://doi.org/10.1002/vms3.92",
  },
  sueda: {
    label: "Sueda KLC, Hart BL, Cliff KD, 2008, Characterisation of plant eating in dogs, Applied Animal Behaviour Science 111(1):120-132",
    url: "https://doi.org/10.1016/j.applanim.2007.05.018",
  },
  becuwe: {
    label: "Bécuwe-Bonnet V et al., 2012, Gastrointestinal disorders in dogs with excessive licking of surfaces, Journal of Veterinary Behavior 7(4):194-204",
    url: "https://doi.org/10.1016/j.jveb.2011.07.003",
  },
}

export const PILLARS: Record<string, PillarContent> = {
  'peut-manger': {
    heading: "Que peut manger un chien, et quels aliments lui sont interdits ?",
    intro: [
      "Un chien peut manger la plupart des fruits, des légumes, des viandes et des poissons que tu cuisines pour toi, à condition qu'ils soient nature, préparés pour lui et donnés en petite quantité. Quelques aliments courants sont en revanche toxiques, même à faible dose : le raisin, le chocolat, l'oignon, l'ail, le xylitol et la noix de macadamia (ASPCA). Chaque fiche de cette rubrique donne un verdict, une quantité par gabarit et les parties à retirer.",
      "Les extras donnés en plus de la gamelle restent sous 10 % des calories quotidiennes du chien, une limite recommandée par la WSAVA et l'AAHA (Príncipe et al., Vet Sci, 2025). FEDIAF estime le besoin d'un chien adulte peu actif à 95 kcal multipliés par son poids en kilos à la puissance 0,75 : un chien de 10 kg a besoin d'environ 530 kcal par jour, et ses extras plafonnent vers 53 kcal. Un morceau de pomme, de carotte ou de poulet compte dans ces 10 %, comme une friandise du commerce.",
      "Pour les fruits, le danger vient surtout des noyaux, des pépins et des tiges. Le noyau de cerise, d'abricot ou de pêche contient des glycosides cyanogènes qui libèrent du cyanure quand il est croqué (ASPCA), et il peut aussi boucher l'intestin. La chair des [pêches pour chien](/chien/fruit/chien-peut-manger-peches) ou de la [pomme sans pépins](/chien/fruit/chien-peut-manger-pomme) se donne sans problème. Les légumes se servent sans sel ni matière grasse, crus ou cuits selon le cas, comme les [carottes pour chien](/chien/legumes/chien-peut-manger-carottes) ; la tomate mûre n'est pas toxique, mais le plant et les fruits verts contiennent de la solanine (ASPCA).",
      "La viande cuite, maigre et sans sauce est la façon la plus sûre de donner de la viande à un chien. La viande crue expose aux bactéries : sur 196 échantillons d'aliments crus pour animaux analysés par la FDA, 8 % contenaient des salmonelles et 16 % Listeria monocytogenes (Nemser et al., Foodborne Pathog Dis, 2014). La volaille se cuit jusqu'à 74 °C à cœur, la température minimale fixée par l'USDA, et les os cuits restent interdits parce qu'ils se brisent en éclats. Le détail par espèce est dans les fiches [poulet cru](/chien/viandes/chien-peut-manger-poulet-cru) et [saumon pour chien](/chien/viandes/chien-peut-manger-saumon).",
      "Les aliments toxiques ont leur propre page, avec les doses par kilo : la [liste des aliments toxiques pour le chien](/chien/urgences/aliments-toxiques-chien-liste-complete). Si ton chien a avalé l'un d'eux, appelle ton vétérinaire ou le CNITV au 04 78 87 10 40 avant tout geste, et ne le fais pas vomir sans avis. Un chiot, un chien diabétique, en surpoids ou insuffisant rénal tolère moins bien les extras. Demande à ton vétérinaire ce qu'il peut recevoir.",
    ],
    faq: [
      {
        q: "Quels aliments sont interdits pour un chien ?",
        a: "Le raisin et le raisin sec, le chocolat, l'oignon, l'ail, la ciboulette, la noix de macadamia, le xylitol, l'alcool et la pâte à pain crue sont les plus dangereux (ASPCA). Les os cuits et les noyaux de fruits posent un risque mécanique : éclats, occlusion. Les aliments très gras, comme la charcuterie ou les noix, peuvent provoquer vomissements, diarrhée ou pancréatite.",
      },
      {
        q: "Un chien peut-il manger la même chose que nous ?",
        a: "Pas tel quel. Les plats préparés contiennent souvent de l'oignon, de l'ail, du sel, du beurre ou des sauces qui ne lui conviennent pas. Un aliment de base mis de côté avant assaisonnement, cuit nature, peut compléter sa gamelle dans la limite de 10 % des calories quotidiennes.",
      },
      {
        q: "Quels fruits et légumes donner à son chien ?",
        a: "La pomme sans pépins, la banane, la fraise, la myrtille, la carotte, la courgette et le haricot vert font partie des plus simples à donner. Ils se servent lavés, nature, coupés en morceaux adaptés à la taille de la gueule. Noyaux, pépins, tiges et feuilles se retirent.",
      },
      {
        q: "Viande crue ou cuite : que donner à son chien ?",
        a: "La viande cuite est la plus sûre. Sur 196 aliments crus pour animaux testés par la FDA, 8 % contenaient des salmonelles et 16 % Listeria monocytogenes (Nemser et al., 2014), des bactéries que le chien peut transmettre aux humains du foyer. Le porc se donne toujours cuit, à cause de la maladie d'Aujeszky, mortelle chez le chien.",
      },
      {
        q: "Combien d'extras un chien peut-il manger par jour ?",
        a: "Les extras ne doivent pas dépasser 10 % des calories quotidiennes, selon la WSAVA et l'AAHA (Príncipe et al., 2025). Pour un chien adulte peu actif de 10 kg, qui a besoin d'environ 530 kcal par jour selon la formule FEDIAF, cela fait environ 53 kcal. À titre de repère, 100 g de pomme apportent 52 kcal (USDA).",
      },
      {
        q: "Que faire si mon chien a mangé un aliment toxique ?",
        a: "Note ce qu'il a mangé, la quantité et l'heure, puis appelle ton vétérinaire ou le CNITV (04 78 87 10 40, 24 h/24). Ne le fais pas vomir sans avis. Certains toxiques agissent avec retard : avec l'oignon ou l'ail, la destruction des globules rouges commence 3 à 5 jours après l'ingestion (Merck Veterinary Manual).",
      },
    ],
    sources: [
      SRC.principe,
      SRC.fediaf,
      SRC.aspcaFoods,
      SRC.aspcaCherry,
      SRC.aspcaTomato,
      SRC.nemser,
      SRC.usdaFsis,
      SRC.usdaFdc,
      SRC.merckAllium,
    ],
  },

  'alimentation-quotidienne': {
    heading: "Comment bien nourrir son chien au quotidien ?",
    intro: [
      "Bien nourrir un chien, c'est lui donner un aliment complet adapté à son âge, à son gabarit et à son activité, dans une quantité calculée sur son poids, avec de l'eau fraîche à volonté. Le format compte moins que la composition : croquettes, pâtée, repas frais et ration ménagère conviennent tous si l'aliment est complet et la quantité juste. Le comparatif [croquettes ou pâtée](/chien/alimentation-quotidienne/croquettes-ou-patee) aide à choisir selon le profil du chien.",
      "La ration se calcule à partir du poids métabolique, c'est-à-dire le poids en kilos à la puissance 0,75, et non du poids brut. FEDIAF retient environ 95 kcal par kilo de poids métabolique et par jour pour un chien adulte peu actif : un chien de 10 kg a besoin d'environ 530 kcal, un chien de 30 kg d'environ 1 220 kcal. Les indications du sac visent souvent un chien entier et actif, et le guide [quelle quantité donner selon le poids](/chien/alimentation/quelle-quantite-donner-manger-chien-selon-poids) explique comment les corriger.",
      "Les friandises, les fruits et les restes comptent dans la ration : ensemble, ils restent sous 10 % des calories quotidiennes (WSAVA et AAHA, cités par Príncipe et al., Vet Sci, 2025). Le poids se contrôle à la main plutôt qu'à l'œil. Sur l'échelle d'état corporel en 9 points utilisée par les vétérinaires (Laflamme, 1997), un chien au poids idéal a des côtes que l'on sent sans appuyer et une taille visible vue de dessus ; la méthode est détaillée dans le guide [note d'état corporel](/chien/sante/note-etat-corporel-chien-evaluer-maison).",
      "Sur l'étiquette des croquettes, les ingrédients sont listés par ordre de poids décroissant, comme l'impose le règlement européen CE 767/2009. Le guide pour [lire une étiquette de croquettes](/chien/alimentation-quotidienne/comprendre-etiquette-croquettes-chien) montre aussi comment estimer les glucides, qui ne sont jamais affichés. La ration ménagère demande plus de rigueur : sur 200 recettes maison pour chien tirées de livres et de sites internet, 95 % manquaient d'au moins un nutriment (Stockman et al., JAVMA, 2013). Le guide [ration ménagère pour chien](/chien/alimentation-quotidienne/ration-menagere-chien-guide-recettes) explique le rôle du complément minéral et vitaminé.",
      "Un chien adulte boit environ 50 à 70 ml d'eau par kilo et par jour (NRC, 2006), davantage avec une alimentation sèche, par temps chaud ou après l'effort ; le guide sur la [quantité d'eau par jour](/chien/alimentation-quotidienne/quantite-eau-chien-par-jour) donne le tableau par poids. Un changement d'aliment se fait progressivement, en mélangeant l'ancien et le nouveau sur plusieurs jours, selon le [protocole de transition alimentaire](/chien/alimentation-quotidienne/transition-alimentaire-chien). Une perte de poids, une soif inhabituelle ou un refus de manger qui dure sont des raisons de consulter le vétérinaire.",
    ],
    faq: [
      {
        q: "Combien de fois par jour faut-il nourrir un chien ?",
        a: "Un chien adulte mange en général matin et soir ; un chiot a besoin de repas plus fréquents, que l'on espace au fil de la croissance. Les grands chiens à thorax profond gagnent à recevoir leur ration en plusieurs repas et à rester au calme après, à cause du risque de torsion d'estomac. Le guide [combien de repas par jour](/chien/alimentation/combien-fois-par-jour-donner-manger-chien) détaille chaque profil.",
      },
      {
        q: "Quelle quantité de croquettes donner à un chien de 10 kg ?",
        a: "Un chien adulte peu actif de 10 kg a besoin d'environ 530 kcal par jour selon la formule FEDIAF (95 × poids^0,75). Avec une croquette à 3 500 kcal par kilo, cela fait environ 150 g par jour : on divise le besoin par la densité calorique indiquée sur le sac. Le poids et l'état corporel du chien servent ensuite à ajuster.",
      },
      {
        q: "Croquettes ou pâtée : que choisir pour son chien ?",
        a: "Les deux conviennent si l'aliment est complet. La croquette revient moins cher par jour et se conserve mieux ; la pâtée apporte beaucoup plus d'eau et plaît davantage aux chiens difficiles ou âgés. On peut mélanger les deux, en réduisant chaque part pour rester dans le besoin calorique.",
      },
      {
        q: "Peut-on laisser des croquettes à volonté ?",
        a: "C'est déconseillé pour la plupart des chiens, qui mangent alors plus que leur besoin. Chez 48 Labradors suivis toute leur vie, ceux qui recevaient 25 % de nourriture en moins que leur compagnon de portée ont vécu 13 ans en médiane, contre 11,2 ans (Kealy et al., JAVMA, 2002). Une ration pesée chaque jour reste la méthode la plus fiable.",
      },
      {
        q: "Peut-on nourrir son chien avec des restes de table ?",
        a: "Pas comme base de ration. Les restes sont souvent gras et salés, et peuvent contenir de l'oignon, de l'ail ou des os cuits, toxiques ou dangereux pour le chien (ASPCA). Un morceau de viande ou de légume nature, mis de côté avant assaisonnement, peut servir de friandise dans la limite des 10 %.",
      },
      {
        q: "Comment changer de croquettes sans troubles digestifs ?",
        a: "On mélange le nouvel aliment à l'ancien en augmentant sa part sur plusieurs jours, plus lentement chez un chiot, un chien âgé ou un chien sensible. Des selles molles pendant la transition indiquent qu'il faut ralentir. Le [protocole de transition alimentaire](/chien/alimentation-quotidienne/transition-alimentaire-chien) donne le détail jour par jour.",
      },
      {
        q: "Combien d'eau un chien doit-il boire par jour ?",
        a: "Un chien adulte boit environ 50 à 70 ml d'eau par kilo et par jour (NRC, 2006), soit 0,5 à 0,7 litre pour un chien de 10 kg. Il boit plus avec une alimentation sèche, par temps chaud ou après l'effort. Une soif qui augmente nettement sans raison apparente se signale au vétérinaire.",
      },
    ],
    sources: [
      SRC.fediaf,
      SRC.principe,
      SRC.laflamme,
      SRC.reglement767,
      SRC.stockman,
      SRC.nrc,
      SRC.kealy,
      SRC.aspcaFoods,
    ],
  },

  fruit: {
    heading: "Quels fruits un chien peut-il manger ?",
    intro: [
      "Un chien peut manger la plupart des fruits frais courants, comme la pomme, la poire, la fraise, la myrtille, la banane, le melon, la mangue, le kiwi ou l'abricot, à condition de retirer noyaux, pépins durs, tiges et feuilles. Le raisin et le raisin sec sont les seuls fruits courants à exclure complètement, car ils peuvent abîmer les reins du chien (ASPCA). Chaque fiche de la rubrique donne la quantité par gabarit et les parties à enlever.",
      "Un fruit est une friandise et compte dans les 10 % de calories quotidiennes réservés aux extras, une limite recommandée par la WSAVA et l'AAHA (Príncipe et al., Vet Sci, 2025). Les fruits n'ont pas tous la même densité : 100 g de fraise apportent 32 kcal, 100 g de pomme 52 kcal et 100 g de banane 89 kcal (USDA FoodData Central). La [banane pour chien](/chien/fruit/chien-peut-manger-banane) se donne donc en plus petite portion que les [fraises pour chien](/chien/fruit/chien-peut-manger-fraises).",
      "Les noyaux des fruits à noyau sont le premier risque. Le noyau, la tige et les feuilles de cerise contiennent des glycosides cyanogènes qui libèrent du cyanure (ASPCA) ; un noyau croqué est plus dangereux qu'un noyau avalé entier, qui peut en revanche boucher l'intestin d'un petit chien. Les fiches [cerises pour chien](/chien/fruit/chien-peut-manger-cerises) et [abricots pour chien](/chien/fruit/chien-peut-manger-abricots) expliquent quoi faire si ton chien en a avalé. Les pépins de pomme contiennent aussi de l'amygdaline, mais quelques pépins avalés entiers ne posent pas de problème réel.",
      "Les agrumes se donnent pelés : la peau, les feuilles et les pépins d'orange ou de clémentine contiennent de l'acide citrique et des huiles essentielles qui irritent le tube digestif (ASPCA). Les fruits secs, confits, au sirop, en compote sucrée ou en jus sont à éviter, et certains produits allégés (confitures, yaourts, glaces) contiennent du xylitol, qui fait chuter la glycémie du chien dès 0,1 g/kg (Merck Veterinary Manual). La fiche [clémentine et orange](/chien/fruit/chien-peut-manger-clementine-orange) donne les quantités par gabarit.",
      "Un chien diabétique, en surpoids ou insuffisant rénal supporte mal le sucre ou le potassium de certains fruits : son vétérinaire fixe ce qu'il peut recevoir. Si ton chien a mangé du raisin, même en petite quantité, appelle ton vétérinaire sans attendre les symptômes ; la [fiche urgence raisin](/chien/urgences/chien-mange-raisin-urgence) explique pourquoi aucune dose n'est considérée comme sûre.",
    ],
    faq: [
      {
        q: "Quel fruit est toxique pour un chien ?",
        a: "Le raisin, frais ou sec, est le fruit le plus dangereux : il peut provoquer une atteinte des reins (ASPCA), et aucune dose sûre n'est connue. Les noyaux de cerise, d'abricot, de pêche et de prune sont toxiques quand ils sont croqués. L'avocat est surtout dangereux pour les oiseaux et les lapins ; chez le chien, le noyau et la richesse en graisses sont les vrais problèmes.",
      },
      {
        q: "Combien de fruits un chien peut-il manger par jour ?",
        a: "Les fruits entrent dans les 10 % de calories quotidiennes réservés aux friandises (WSAVA et AAHA, cités par Príncipe et al., 2025). Pour un chien adulte peu actif de 10 kg, qui a besoin d'environ 530 kcal par jour selon FEDIAF, cela laisse une cinquantaine de kcal pour tous les extras. Un seul fruit à la fois, en petits morceaux, suffit.",
      },
      {
        q: "Un chien peut-il manger la peau des fruits ?",
        a: "La peau de pomme, de poire, de pêche ou de prune se mange, une fois le fruit lavé. La peau de banane, de melon et de pastèque se retire : elle se digère mal et peut boucher l'intestin d'un petit chien. La peau des agrumes contient en plus des huiles essentielles irritantes (ASPCA).",
      },
      {
        q: "Mon chien a avalé un noyau : que faire ?",
        a: "Un noyau avalé entier passe souvent, mais il peut bloquer l'intestin, surtout chez un petit chien. Surveille vomissements, abattement, ventre douloureux ou absence de selles, et appelle ton vétérinaire s'ils apparaissent. S'il a croqué plusieurs noyaux de cerise, d'abricot ou de pêche, appelle tout de suite le vétérinaire ou le CNITV (04 78 87 10 40).",
      },
      {
        q: "Les fruits secs sont-ils bons pour un chien ?",
        a: "Non. Le raisin sec est toxique pour le chien, comme le raisin frais (ASPCA). Les autres fruits secs concentrent le sucre et sont souvent enrobés ou sucrés ; un morceau de fruit frais les remplace.",
      },
      {
        q: "Un chiot peut-il manger des fruits ?",
        a: "Oui, en tout petits morceaux, une fois qu'il mange une alimentation solide. On introduit un fruit à la fois pour repérer une selle molle ou une intolérance. La part de fruits reste dans les 10 % de friandises, pour ne pas déséquilibrer l'aliment de croissance.",
      },
      {
        q: "Un chien peut-il manger de la compote ou boire du jus de fruit ?",
        a: "Mieux vaut éviter. La compote du commerce et les jus contiennent du sucre ajouté, et les versions allégées peuvent contenir du xylitol, qui provoque une hypoglycémie chez le chien dès 0,1 g/kg (Merck Veterinary Manual). Une compote maison sans sucre, en petite quantité, ne pose pas de problème.",
      },
    ],
    sources: [
      SRC.aspcaFoods,
      SRC.aspcaCherry,
      SRC.principe,
      SRC.fediaf,
      SRC.usdaFdc,
      SRC.merckXylitol,
    ],
  },

  legumes: {
    heading: "Quels légumes un chien peut-il manger ?",
    intro: [
      "Un chien peut manger la plupart des légumes du potager, comme la carotte, la courgette, le haricot vert, le brocoli, le concombre, le potiron, la patate douce ou le chou-fleur, servis nature, crus ou cuits selon le légume. Les légumes de la famille de l'ail sont interdits : l'oignon, l'ail, l'échalote, le poireau et la ciboulette détruisent les globules rouges du chien (Merck Veterinary Manual). Le classement des [meilleurs légumes pour chien](/chien/legumes/meilleurs-legumes-chien) présente les dix plus simples à donner.",
      "L'oignon cru provoque des signes à partir d'environ 15 à 30 g par kilo de poids, et l'ail est 3 à 5 fois plus toxique que l'oignon (Merck Veterinary Manual, 2024). La destruction des globules rouges commence en général 3 à 5 jours après l'ingestion, si bien qu'un chien peut sembler normal pendant plusieurs jours. Sauces, bouillons, soupes et plats cuisinés en contiennent souvent : la fiche [chien qui a mangé de l'ail ou de l'oignon](/chien/urgences/chien-mange-ail-oignon-urgence) liste les aliments où ils se cachent.",
      "La préparation change beaucoup selon le légume. La [carotte pour chien](/chien/legumes/chien-peut-manger-carottes) se donne crue ou cuite, alors que la [pomme de terre](/chien/legumes/chien-peut-manger-pommes-de-terre) se donne toujours cuite et épluchée : crue, verte ou germée, elle contient de la solanine. Le légume se sert sans sel, sans beurre, sans huile ni épices, coupé en morceaux adaptés à la taille de la gueule pour éviter la fausse route.",
      "Certains légumes demandent de trier les parties. La [tomate pour chien](/chien/legumes/chien-peut-manger-tomate) mûre n'est pas toxique, mais le plant, les feuilles et les fruits verts contiennent de la solanine (ASPCA). Les champignons de Paris du commerce, cuits, ne posent pas de problème, tandis que les [champignons sauvages](/chien/legumes/chien-peut-manger-champignons) ramassés en promenade peuvent être mortels et justifient un appel immédiat au vétérinaire.",
      "Les légumes donnés en friandise restent dans les 10 % de calories quotidiennes réservés aux extras (WSAVA et AAHA, cités par Príncipe et al., Vet Sci, 2025). Les légumes riches en amidon, comme la pomme de terre, le maïs ou la patate douce, pèsent plus lourd dans ce calcul que la courgette ou le concombre, composés surtout d'eau. Un chien diabétique, en surpoids ou sujet aux calculs urinaires a des restrictions propres, que son vétérinaire précise.",
    ],
    faq: [
      {
        q: "Quels légumes sont interdits pour un chien ?",
        a: "L'oignon, l'ail, l'échalote, le poireau et la ciboulette sont toxiques pour le chien, crus, cuits ou en poudre (Merck Veterinary Manual). Les champignons sauvages, le plant et les fruits verts de la tomate, et la pomme de terre crue, verte ou germée sont aussi à exclure. Les plats cuisinés, souvent préparés avec oignon et ail, ne se donnent pas.",
      },
      {
        q: "Un chien peut-il manger des légumes crus ?",
        a: "Oui pour certains : la carotte, le concombre, la courgette, le poivron rouge et la salade se donnent crus, en petits morceaux. D'autres se digèrent mieux cuits à la vapeur, comme le brocoli, le chou-fleur, la patate douce et le potiron. La pomme de terre, elle, se donne toujours cuite.",
      },
      {
        q: "Quelle quantité de légumes donner à un chien ?",
        a: "En friandise, les légumes restent dans les 10 % de calories quotidiennes (Príncipe et al., 2025). Dans une ration ménagère, la part de légumes est fixée par la recette, établie de préférence avec un vétérinaire : sur 200 recettes maison analysées, 95 % manquaient d'au moins un nutriment (Stockman et al., JAVMA, 2013).",
      },
      {
        q: "Un peu d'oignon cuit dans une sauce, est-ce grave pour un chien ?",
        a: "Tout dépend de la quantité et du poids du chien : les signes apparaissent à partir d'environ 15 à 30 g d'oignon cru par kilo, et l'ail est 3 à 5 fois plus toxique (Merck Veterinary Manual). Un plat entier mangé par un petit chien justifie un appel au vétérinaire. Les signes d'anémie arrivent 3 à 5 jours plus tard, d'où l'intérêt d'appeler avant.",
      },
      {
        q: "Les légumes aident-ils un chien à maigrir ?",
        a: "Les légumes pauvres en calories, comme la courgette, le haricot vert ou le concombre, peuvent remplacer une partie des friandises chez un chien au régime. Ils ne remplacent pas la baisse de ration fixée avec le vétérinaire. L'enjeu est réel : chez 48 Labradors, ceux qui recevaient 25 % de nourriture en moins ont vécu 13 ans en médiane, contre 11,2 ans (Kealy et al., JAVMA, 2002).",
      },
      {
        q: "Un chien peut-il manger des lentilles, des pois ou des haricots ?",
        a: "Cuits et nature, oui, en petite quantité : ce sont des légumineuses riches en fibres, qui peuvent donner des gaz. Les conserves salées et les plats cuisinés sont à éviter. Les [lentilles pour chien](/chien/alimentation-quotidienne/chien-peut-manger-lentilles) ont leur fiche détaillée.",
      },
    ],
    sources: [
      SRC.merckAllium,
      SRC.aspcaTomato,
      SRC.principe,
      SRC.stockman,
      SRC.kealy,
    ],
  },

  viandes: {
    heading: "Quelles viandes et quels poissons un chien peut-il manger ?",
    intro: [
      "Un chien peut manger toutes les viandes courantes, poulet, dinde, bœuf, agneau, canard, lapin et porc, ainsi que le saumon, la sardine et le thon, à condition qu'elles soient cuites, nature et sans os cuits. La viande est sa source de protéines la plus naturelle, mais un morceau de viande seul ne fait pas une ration complète. Chaque fiche de la rubrique donne le mode de cuisson, la quantité et les morceaux à éviter.",
      "La viande crue apporte un risque bactérien pour le chien et pour la famille. Sur 196 échantillons d'aliments crus pour chiens et chats analysés par les laboratoires de la FDA, 8 % contenaient des salmonelles et 16 % Listeria monocytogenes, alors que ces bactéries étaient presque absentes des croquettes testées (Nemser et al., Foodborne Pathog Dis, 2014). Le guide sur la [viande crue et le BARF](/chien/viandes/chien-peut-manger-viande-crue-barf) détaille les règles d'hygiène si tu choisis le cru.",
      "La cuisson règle la question bactérienne. L'USDA fixe à 74 °C la température à cœur minimale pour la volaille. Le [porc pour chien](/chien/viandes/chien-peut-manger-porc) se donne toujours cuit : cru, il peut transmettre la maladie d'Aujeszky, mortelle chez le chien. La viande se sert sans sauce, sans sel ni oignon, et on retire les morceaux gras et la peau de poulet, car un repas trop gras peut déclencher une pancréatite.",
      "Les os cuits sont interdits : la cuisson les rend cassants, et leurs éclats peuvent blesser ou boucher le tube digestif, parfois au point de nécessiter une chirurgie (ASPCA). Les os de poulet et de lapin cuits sont les plus dangereux. Si ton chien en a volé un, la fiche [os cuit avalé](/chien/urgences/chien-mange-os-cuit-urgence) explique pourquoi il ne faut pas le faire vomir.",
      "Les poissons se donnent cuits et sans arêtes. Le [saumon pour chien](/chien/viandes/chien-peut-manger-saumon) cuit apporte des oméga-3, alors que le saumon fumé est trop salé. Le [thon pour chien](/chien/viandes/chien-peut-manger-thon) se limite à de petites portions occasionnelles à cause du mercure. Le [foie pour chien](/chien/viandes/chien-peut-manger-foie), très riche en vitamine A, se donne en petite part de la ration. Un chien insuffisant rénal ou sujet aux calculs d'urate, comme le Dalmatien, a des restrictions sur les abats et les sardines : demande l'avis de ton vétérinaire.",
    ],
    faq: [
      {
        q: "Quelle est la meilleure viande pour un chien ?",
        a: "Aucune viande n'est meilleure que les autres pour un chien en bonne santé. Le poulet et la dinde sont maigres et bien tolérés ; l'agneau, le canard ou le lapin servent souvent de protéine de remplacement pour un chien allergique. Le bœuf, les produits laitiers et le poulet sont les allergènes alimentaires les plus souvent identifiés chez le chien (Mueller et al., BMC Vet Res, 2016).",
      },
      {
        q: "Un chien peut-il manger de la viande crue tous les jours ?",
        a: "C'est possible dans une ration BARF bien formulée, mais pas sans risque : 8 % des aliments crus pour animaux testés par la FDA contenaient des salmonelles (Nemser et al., 2014). Le cru est déconseillé chez le chiot, le chien âgé, malade ou immunodéprimé, et dans un foyer avec de jeunes enfants ou une personne fragile. Une ration crue maison se construit avec un vétérinaire.",
      },
      {
        q: "Un chien peut-il manger du jambon ou de la charcuterie ?",
        a: "Très rarement. Jambon, lardons, saucisses et pâtés sont salés, gras et contiennent souvent de l'ail ou de l'oignon. Un petit morceau de jambon blanc dégraissé de temps en temps ne rend pas malade, mais ce n'est pas une friandise régulière ; la fiche [jambon pour chien](/chien/alimentation-quotidienne/chien-peut-manger-jambon) détaille les quantités.",
      },
      {
        q: "Un chien peut-il manger des os crus ?",
        a: "Les os crus charnus sont utilisés en BARF, mais ils exposent aux fractures dentaires, aux obstructions et aux bactéries de la viande crue. Ils se donnent sous surveillance, d'une taille adaptée au chien. Les os cuits, eux, sont toujours interdits, car ils se brisent en éclats (ASPCA).",
      },
      {
        q: "Un chien peut-il manger du poisson cru ?",
        a: "Mieux vaut le cuire. Le poisson cru peut porter des parasites et des bactéries ; une cuisson à la vapeur ou au court-bouillon, sans sel, règle le problème. Retire les arêtes avant de servir.",
      },
      {
        q: "Quelle quantité de viande donner à un chien ?",
        a: "En friandise ou en complément des croquettes, la viande compte dans les 10 % de calories quotidiennes réservés aux extras (WSAVA et AAHA, cités par Príncipe et al., 2025). Si la viande remplace une partie de la ration, on réduit les croquettes d'autant. Une ration ménagère complète demande un complément minéral et vitaminé et un calcul fait avec le vétérinaire.",
      },
      {
        q: "Un chien peut-il manger des œufs ?",
        a: "Oui, cuits de préférence : œuf dur, brouillé sans matière grasse ou poché. L'œuf cru peut porter des salmonelles, et le blanc cru gêne l'absorption d'une vitamine, la biotine (ASPCA). La fiche [œufs pour chien](/chien/viandes/chien-peut-manger-oeufs) donne la quantité selon le poids.",
      },
    ],
    sources: [
      SRC.nemser,
      SRC.usdaFsis,
      SRC.aspcaFoods,
      SRC.mueller,
      SRC.principe,
    ],
  },

  urgences: {
    heading: "Quels aliments sont dangereux pour un chien, et que faire s'il en a mangé ?",
    intro: [
      "Les aliments les plus dangereux pour un chien sont le chocolat, le raisin et le raisin sec, l'oignon et l'ail, le xylitol, la noix de macadamia, l'alcool, la pâte à pain crue et les os cuits (ASPCA Animal Poison Control). Si ton chien en a avalé, appelle tout de suite ton vétérinaire ou un centre antipoison vétérinaire : le CNITV à Lyon (04 78 87 10 40, 24 h/24) ou le CAPAE-Ouest à Nantes (02 40 68 77 40). Cette page ne remplace pas un vétérinaire. Elle aide à reconnaître une urgence et à préparer l'appel.",
      "La gravité dépend de la dose par kilo de poids, d'où l'importance de connaître le poids du chien. Le chocolat contient des méthylxanthines, surtout de la théobromine : les premiers signes apparaissent vers 20 mg/kg, les troubles cardiaques vers 40 à 50 mg/kg et les convulsions à partir de 60 mg/kg (Merck Veterinary Manual, 2024). Le chocolat noir en contient 5,3 à 5,6 mg par gramme et le chocolat au lait 2,3 mg. Pour un chien de 10 kg, environ 36 g de chocolat noir suffisent à atteindre le premier seuil. La fiche [chien qui a mangé du chocolat](/chien/urgences/chien-mange-chocolat-urgence) fait le calcul selon le type de chocolat.",
      "Certains toxiques agissent à très faible dose. Le xylitol, un édulcorant des chewing-gums et de certains beurres de cacahuète, provoque une hypoglycémie au-delà d'environ 0,1 g/kg, souvent en 30 minutes, et peut atteindre le foie chez certains chiens au-delà de 0,5 g/kg (Merck Veterinary Manual, 2025) ; la fiche [chien et xylitol](/chien/urgences/chien-mange-xylitol-urgence) détaille les produits concernés. Le [raisin](/chien/urgences/chien-mange-raisin-urgence) peut provoquer une atteinte des reins (ASPCA), et la sensibilité varie tant d'un chien à l'autre qu'aucune dose n'est considérée comme sûre.",
      "Les signes peuvent arriver tard. Avec l'oignon et l'ail, la destruction des globules rouges commence en général 3 à 5 jours après l'ingestion (Merck Veterinary Manual, 2024) ; la fiche [ail et oignon](/chien/urgences/chien-mange-ail-oignon-urgence) liste les plats qui en contiennent. Avec la [noix de macadamia](/chien/urgences/chien-mange-noix-macadamia-urgence), faiblesse, tremblements et fièvre apparaissent dans les 12 heures, à partir d'environ 2,4 g/kg, et disparaissent en général en 12 à 48 heures. Un chien qui va bien juste après l'ingestion n'est donc pas forcément hors de danger.",
      "Pour l'appel, note ce que le chien a mangé, la quantité estimée, l'heure et son poids, et garde l'emballage. Ne le fais pas vomir sans l'avis du vétérinaire : les éclats d'[os cuit](/chien/urgences/chien-mange-os-cuit-urgence), par exemple, blessent autant en remontant qu'en descendant. La [liste complète des aliments toxiques](/chien/urgences/aliments-toxiques-chien-liste-complete) classe les produits par niveau de danger, avec leurs doses.",
    ],
    faq: [
      {
        q: "Quel est l'aliment le plus toxique pour un chien ?",
        a: "Le xylitol, le chocolat noir et le raisin sont parmi les plus dangereux, car de petites quantités suffisent. Le xylitol provoque une hypoglycémie au-delà d'environ 0,1 g/kg (Merck Veterinary Manual), soit 1 g pour un chien de 10 kg. Pour le raisin, aucune dose sûre n'est connue.",
      },
      {
        q: "Quelle quantité de chocolat est dangereuse pour un chien ?",
        a: "Le risque suit la dose de méthylxanthines par kilo : signes digestifs vers 20 mg/kg, troubles cardiaques vers 40 à 50 mg/kg, convulsions à partir de 60 mg/kg (Merck Veterinary Manual, 2024). Le chocolat noir en contient plus de deux fois plus que le chocolat au lait. Au moindre doute, appelle le vétérinaire avec le poids du chien et l'emballage.",
      },
      {
        q: "Faut-il faire vomir un chien qui a mangé quelque chose de toxique ?",
        a: "Pas sans l'avis d'un vétérinaire. Selon le produit et le délai, c'est lui qui décide s'il faut provoquer le vomissement, et il le fait avec un médicament adapté. Les os, les objets pointus et les produits corrosifs ne doivent pas remonter.",
      },
      {
        q: "Combien de temps après une intoxication les symptômes apparaissent-ils ?",
        a: "Cela dépend du toxique. Le xylitol fait baisser la glycémie en 30 minutes environ, la noix de macadamia donne des signes dans les 12 heures, et l'anémie due à l'oignon ou à l'ail apparaît 3 à 5 jours après (Merck Veterinary Manual). Un chien sans signes juste après l'ingestion peut quand même être intoxiqué.",
      },
      {
        q: "Quel numéro appeler si mon chien s'est empoisonné ?",
        a: "Appelle d'abord ton vétérinaire ou, la nuit, une clinique de garde. Les centres antipoison vétérinaires répondent aussi : le CNITV à Lyon au 04 78 87 10 40 (24 h/24) et le CAPAE-Ouest à Nantes au 02 40 68 77 40. Prépare le poids du chien, le produit, la quantité et l'heure.",
      },
      {
        q: "Mon chien a mangé un seul grain de raisin : est-ce grave ?",
        a: "Appelle le vétérinaire même pour une petite quantité. La sensibilité au raisin varie beaucoup d'un chien à l'autre et aucune dose sûre n'est connue ; l'acide tartrique est la cause suspectée de l'atteinte des reins (ASPCA). Le vétérinaire décide, selon le poids et le délai, s'il faut faire vomir et surveiller les reins.",
      },
      {
        q: "Le chocolat blanc est-il dangereux pour un chien ?",
        a: "Le chocolat blanc contient très peu de théobromine, le risque d'intoxication est donc faible. Il reste très gras et sucré : une grande quantité peut provoquer des troubles digestifs, voire une pancréatite chez un chien sensible.",
      },
    ],
    sources: [
      SRC.aspcaFoods,
      SRC.merckChocolate,
      SRC.merckXylitol,
      SRC.merckAllium,
      SRC.merckMacadamia,
    ],
  },

  'comportement-alimentaire': {
    heading: "Pourquoi mon chien ne mange plus, mange trop vite ou mange n'importe quoi ?",
    intro: [
      "La plupart des comportements alimentaires étonnants du chien ont une explication simple : un bol inconfortable, une habitude prise, l'ennui, la concurrence avec un autre animal ou une ration mal adaptée. Une partie seulement cache un problème médical, à écarter en premier quand le comportement apparaît d'un coup. Chaque fiche de la rubrique traite un cas, du refus des croquettes à l'ingestion d'objets.",
      "Un chien qui boude ses croquettes mais accepte les restes a souvent appris que refuser rapporte mieux. On pose la gamelle à heure fixe, on la retire après le repas, et on ne compense pas avec des friandises. Un refus total accompagné d'abattement, de vomissements ou d'amaigrissement relève du vétérinaire, sans attendre chez un chiot ou un chien âgé ; le guide [combien de temps un chien peut rester sans manger](/chien/comportement-alimentaire/combien-temps-chien-sans-manger) détaille les signaux d'alerte par profil.",
      "Un chien qui [mange trop vite](/chien/alimentation-quotidienne/chien-mange-trop-vite-solutions) risque la fausse route, les vomissements et, chez les grands chiens à thorax profond, la torsion d'estomac. Une gamelle anti-glouton, un tapis de fouille ou un [tapis de léchage](/chien/comportement-alimentaire/tapis-de-lechage-chien-guide-utilisation) rallonge le repas ; la garniture du tapis compte dans les 10 % de calories quotidiennes réservés aux friandises (WSAVA et AAHA, cités par Príncipe et al., Vet Sci, 2025). Le chien qui [sort ses croquettes du bol](/chien/comportement-alimentaire/chien-sort-croquettes-bol) est souvent gêné par un bol trop profond, bruyant ou glissant.",
      "Manger ses crottes est fréquent : dans une enquête auprès de plus de 1 400 propriétaires, 16 % des chiens avaient été vus en manger au moins six fois, et environ 23 % au moins une fois (Hart et al., Vet Med Sci, 2018). Les mêmes propriétaires jugeaient les produits vendus contre la coprophagie efficaces dans 0 à 2 % des cas. Le guide [coprophagie du chien](/chien/comportement-alimentaire/coprophagie-chien-causes-solutions) mise plutôt sur le ramassage immédiat, l'occupation du chien et un bilan vétérinaire.",
      "Manger de l'herbe est courant chez des chiens en bonne santé. Sur 1 571 chiens, 68 % mangeaient des plantes chaque jour ou chaque semaine, et seuls 22 % des propriétaires voyaient leur chien vomir souvent ensuite (Sueda et al., Applied Animal Behaviour Science, 2008). Le guide [chien qui mange de l'herbe](/chien/comportement-alimentaire/chien-mange-herbe-pourquoi) liste les cas qui doivent alerter. Le [pica du chien](/chien/comportement-alimentaire/pica-chien-causes-solutions), l'ingestion répétée de cailloux, de terre ou de tissu, a parfois une origine digestive : sur 19 chiens qui léchaient les surfaces de façon excessive, 14 avaient une maladie gastro-intestinale identifiable (Bécuwe-Bonnet et al., J Vet Behav, 2012).",
    ],
    faq: [
      {
        q: "Pourquoi mon chien ne mange plus ses croquettes ?",
        a: "Les causes les plus courantes sont une lassitude entretenue par les restes et les friandises, un changement d'aliment trop brutal, la chaleur, le stress ou des croquettes rances. Une douleur dentaire, une maladie digestive ou de la fièvre peuvent aussi couper l'appétit. Si le refus s'accompagne d'abattement, de vomissements ou de perte de poids, consulte le vétérinaire.",
      },
      {
        q: "Combien de temps un chien peut-il rester sans manger ?",
        a: "Cela dépend de son âge et de sa santé. Un chiot, un chien âgé, diabétique ou malade supporte mal le jeûne et se montre rapidement au vétérinaire s'il refuse de manger. Pour un adulte en bonne santé qui boit, un repas sauté n'est pas inquiétant, mais un refus qui se prolonge ou s'accompagne d'autres signes impose une consultation.",
      },
      {
        q: "Pourquoi mon chien mange-t-il ses crottes ?",
        a: "La coprophagie touche environ 16 % des chiens de façon régulière (Hart et al., Vet Med Sci, 2018). Ces chiens mangent surtout des selles fraîches, de moins de deux jours dans plus de 80 % des cas, ce que les auteurs rapprochent d'un réflexe hérité du loup qui garde la tanière propre. Une ration insuffisante, des parasites ou l'ennui peuvent aussi l'entretenir.",
      },
      {
        q: "Est-ce normal qu'un chien mange de l'herbe ?",
        a: "Oui. Dans l'étude de Sueda et al. (2008), 68 % des chiens mangeaient des plantes chaque jour ou chaque semaine, et seuls 9 % semblaient malades avant d'en manger. Le comportement devient inquiétant s'il est soudain et quotidien, ou s'il s'accompagne de vomissements répétés, de diarrhée ou d'amaigrissement. Évite les pelouses traitées.",
      },
      {
        q: "Comment empêcher son chien de manger trop vite ?",
        a: "Une gamelle anti-glouton à reliefs, un tapis de fouille ou un jouet distributeur rallongent le repas. Fractionner la ration en plusieurs petits repas et nourrir chaque chien à part, quand il y en a plusieurs, réduit la précipitation. Si la gloutonnerie est apparue d'un coup avec une perte de poids, fais un bilan chez le vétérinaire.",
      },
      {
        q: "Pourquoi mon chien mange-t-il des cailloux ou de la terre ?",
        a: "Chez le chiot, mâchouiller et avaler fait partie de l'exploration. Chez l'adulte, un pica installé a souvent une cause à chercher : maladie digestive, ration mal adaptée, ennui ou stress. Un chien qui vomit, ne fait plus de selles et semble abattu après avoir avalé un objet doit voir un vétérinaire en urgence, à cause du risque d'occlusion.",
      },
      {
        q: "Les produits contre la coprophagie fonctionnent-ils ?",
        a: "Peu. Dans l'enquête de Hart et al. (2018), les propriétaires ont jugé les produits vendus contre la coprophagie efficaces dans 0 à 2 % des cas. Le ramassage immédiat des selles, la promenade en laisse et l'occupation du chien donnent de meilleurs résultats.",
      },
    ],
    sources: [
      SRC.hart,
      SRC.sueda,
      SRC.becuwe,
      SRC.principe,
    ],
  },

  sante: {
    heading: "Comment adapter l'alimentation d'un chien malade ?",
    intro: [
      "L'alimentation d'un chien malade se choisit avec le vétérinaire, à partir du diagnostic : un chien insuffisant rénal a besoin de moins de phosphore, un chien atteint de pancréatite d'un aliment pauvre en graisses, un chien allergique d'une protéine qu'il n'a jamais mangée. Les guides de cette rubrique expliquent ces critères pour t'aider à comprendre une prescription et à comparer les aliments. Ils ne remplacent pas une consultation, car un régime mal choisi peut aggraver une maladie ou fausser un diagnostic.",
      "Le surpoids est le trouble que l'alimentation corrige le plus directement. Chez 48 Labradors suivis toute leur vie, les chiens nourris avec 25 % de nourriture en moins que leur compagnon de portée ont vécu 13 ans en médiane contre 11,2 ans, et leurs maladies chroniques sont apparues plus tard (Kealy et al., JAVMA, 2002). La [note d'état corporel](/chien/sante/note-etat-corporel-chien-evaluer-maison), sur une échelle de 1 à 9 où 4 et 5 correspondent au poids idéal (Laflamme, 1997), dit mieux que la balance si un chien est trop gros.",
      "Une allergie alimentaire se diagnostique par un régime d'éviction strict, avec une protéine nouvelle ou hydrolysée et rien d'autre, pendant au moins 8 semaines : à ce stade, plus de 90 % des chiens et chats allergiques ont répondu (Olivry et al., BMC Vet Res, 2015). Les allergènes les plus souvent identifiés chez le chien sont le bœuf (34 % des cas), les produits laitiers (17 %) et le poulet (15 %) (Mueller et al., BMC Vet Res, 2016). Le guide [allergie alimentaire du chien](/chien/sante/allergie-alimentaire-chien-symptomes-diagnostic) détaille le protocole et la réintroduction.",
      "Pour les maladies chroniques, les critères changent d'un organe à l'autre. Le guide [croquettes pour chien insuffisant rénal](/chien/sante/croquettes-chien-insuffisance-renale) explique pourquoi le phosphore est le premier levier, et le guide [pancréatite du chien](/chien/sante/pancreatite-chien-alimentation-guide) comment réalimenter après une crise avec un aliment pauvre en graisses. Un chien diabétique sous insuline ne change pas d'aliment sans l'accord du vétérinaire, car la dose d'insuline est réglée sur ses repas.",
      "Certains signes imposent de consulter avant de toucher à la gamelle : vomissements répétés, ventre gonflé avec des efforts de vomir sans résultat, soif qui augmente nettement, perte de poids inexpliquée, refus de manger avec abattement. Le guide [chien qui boit beaucoup](/chien/sante/chien-boit-beaucoup-eau-causes) explique comment mesurer ce qu'il boit avant le rendez-vous. Un ventre gonflé chez un grand chien peut être une [torsion d'estomac](/chien/sante/torsion-estomac-chien-prevention-alimentation), qui se traite en urgence.",
    ],
    faq: [
      {
        q: "Quelle alimentation donner à un chien malade ?",
        a: "Celle que prescrit le vétérinaire selon la maladie : les aliments diététiques vétérinaires sont formulés pour un problème précis, comme les reins, la digestion, l'allergie, les articulations ou le poids. En convalescence, un aliment très digestible et appétent, donné en petits repas, aide le chien à reprendre. Un changement brutal d'aliment chez un chien malade peut provoquer diarrhée ou refus.",
      },
      {
        q: "Quels sont les signes d'une allergie alimentaire chez le chien ?",
        a: "Des démangeaisons toute l'année, surtout aux pattes, aux oreilles, au ventre et autour de l'anus, des otites à répétition et des troubles digestifs. Le diagnostic passe par un régime d'éviction d'au moins 8 semaines suivi d'une réintroduction (Olivry et al., 2015). Le bœuf, les produits laitiers et le poulet sont les allergènes les plus souvent en cause (Mueller et al., 2016).",
      },
      {
        q: "Que donner à manger à un chien qui a la diarrhée ?",
        a: "Pour une diarrhée légère chez un adulte en forme, donne de petits repas d'un aliment digestible, comme du riz bien cuit avec du poulet maigre, pendant quelques jours, puis un retour progressif à la ration habituelle. Laisse de l'eau à volonté. Sang dans les selles, vomissements, abattement, chiot ou chien âgé : consulte sans attendre.",
      },
      {
        q: "Comment savoir si mon chien est trop gros ?",
        a: "Tu dois sentir ses côtes sous une fine couche de graisse sans appuyer, voir une taille marquée vue de dessus et un ventre remonté vu de profil. Les vétérinaires utilisent une échelle de 1 à 9, où 4 et 5 correspondent au poids idéal (Laflamme, 1997). Un chien maintenu mince vit plus longtemps : 13 ans en médiane contre 11,2 ans dans l'étude de Kealy et al. (JAVMA, 2002).",
      },
      {
        q: "Mon chien vomit après avoir mangé : est-ce grave ?",
        a: "Un vomissement isolé chez un chien qui a mangé trop vite et reste en forme est souvent bénin. Des vomissements répétés, du sang, de l'abattement, ou des efforts de vomir sans rien rejeter avec un ventre gonflé imposent le vétérinaire, en urgence dans ce dernier cas. Le guide [chien qui vomit après manger](/chien/sante/chien-vomit-apres-manger-causes) aide à distinguer vomissement et régurgitation.",
      },
      {
        q: "Les croquettes sans céréales sont-elles meilleures pour un chien malade ?",
        a: "Pas en soi. Les céréales sont rarement en cause dans les allergies : le blé arrive après le bœuf, les produits laitiers et le poulet dans la synthèse de Mueller et al. (BMC Vet Res, 2016). Pour un chien malade, la teneur en phosphore ou en graisses et la source de protéines comptent plus que la présence de céréales.",
      },
      {
        q: "Peut-on donner des compléments alimentaires à un chien malade ?",
        a: "Seulement avec l'accord du vétérinaire. Certains compléments interagissent avec un traitement ou apportent ce que le régime cherche à limiter, comme le phosphore chez un chien insuffisant rénal. Les oméga-3, la glucosamine ou les probiotiques ont des indications précises, détaillées dans les guides dédiés.",
      },
    ],
    sources: [
      SRC.kealy,
      SRC.laflamme,
      SRC.olivry,
      SRC.mueller,
    ],
  },

  'avis-marques': {
    heading: "Comment choisir une marque de croquettes ou de repas frais pour son chien ?",
    intro: [
      "Pour choisir une marque d'alimentation pour chien, on compare la composition, la source et la part des protéines animales, le prix ramené à la ration du chien, la transparence de l'étiquette et ce que disent les propriétaires. Ce sont les critères que nous appliquons dans chaque avis et chaque comparatif de la rubrique, des grandes marques vendues en clinique et en animalerie aux repas frais livrés à domicile.",
      "La composition se lit sur l'étiquette, où les ingrédients sont classés par ordre de poids décroissant (règlement CE 767/2009). Une recette dont la viande nommée arrive en tête n'a pas le même profil qu'une recette qui commence par le maïs ou le riz, ce qui est le cas de plusieurs gammes grand public. Nos comparatifs regardent aussi la quantité de protéines rapportée aux calories, en grammes pour 1 000 kcal, plus parlante que le pourcentage brut quand deux croquettes n'ont pas la même densité énergétique : le comparatif des [meilleures croquettes pour petit chien](/chien/avis-marques/meilleures-croquettes-petit-chien) est construit sur ce calcul.",
      "La transparence est notée à part : une recette qui donne la part exacte de chaque viande et la dose de ses additifs fonctionnels se juge mieux qu'une recette qui écrit « viandes et sous-produits animaux ». Dans l'[avis Dog Chef au canard](/chien/avis-marques/avis-dog-chef-croquettes-canard-frais), la note perd des points parce que les doses de glucosamine et de chondroïtine ne sont pas affichées et qu'une graisse de poulet figure dans une recette mono-protéine. Pour un chien allergique, la source de protéines passe avant le reste.",
      "Le prix est comparé au kilo, puis ramené à la quantité réellement mangée : une croquette plus chère mais plus dense en énergie se donne en plus petite quantité. Les repas frais, comme ceux de [Dogfy Diet](/chien/avis-marques/avis-dogfy-diet-repas-frais-chien) ou les bocaux [Fidelis](/chien/avis-marques/avis-fidelis-menus-frais-chien-bocaux), coûtent plus cher par jour que des croquettes, et le comparatif [repas frais ou croquettes](/chien/avis-marques/repas-frais-vs-croquettes-chien) aide à décider si l'écart se justifie pour ton chien. À l'autre bout, [Ultra Premium Direct](/chien/avis-marques/avis-ultra-premium-direct) vend ses croquettes françaises sans intermédiaire.",
      "Chaque avis se termine par une note sur 10, détaillée critère par critère (qualité des ingrédients, transparence, rapport qualité-prix, adéquation au chien visé), avec les points faibles et une comparaison avec d'autres références, comme dans l'[avis Franklin Light](/chien/avis-marques/avis-franklin-light-dinde-patate-douce-epinards). La note affichée par une marque sur son propre site est présentée comme telle, et les retours de propriétaires que nous recevons sont publiés au fil de la collecte. Le site est financé par l'affiliation : les liens qui nous rapportent une commission sont signalés, et la note ne dépend pas de cette relation.",
    ],
    faq: [
      {
        q: "Comment savoir si des croquettes sont de bonne qualité ?",
        a: "Regarde le premier ingrédient et la précision des noms : une viande nommée en tête, avec son pourcentage, vaut mieux que « viandes et sous-produits animaux ». Compare ensuite les protéines et les matières grasses, et estime les glucides avec la formule 100 moins protéines, lipides, cendres, fibres et humidité. Vérifie enfin que l'aliment est déclaré « complet » pour l'âge de ton chien (règlement CE 767/2009).",
      },
      {
        q: "Quelle est la meilleure marque de croquettes pour chien ?",
        a: "Il n'y en a pas une seule : la meilleure marque est celle qui convient au profil de ton chien, à sa santé et à ton budget. Un chien allergique demande une protéine unique et une étiquette transparente, un chien stérilisé une croquette moins calorique, un grand chien un prix par jour supportable. Chaque avis de la rubrique précise le profil de chien visé.",
      },
      {
        q: "Pourquoi les repas frais coûtent-ils plus cher que les croquettes ?",
        a: "Les repas frais contiennent beaucoup d'eau, sont cuisinés en petites séries, conditionnés en portions et livrés réfrigérés ou en bocaux. Le chien en mange donc un poids plus élevé pour les mêmes calories. Le comparatif [repas frais ou croquettes](/chien/avis-marques/repas-frais-vs-croquettes-chien) détaille les cas où l'écart de prix se justifie.",
      },
      {
        q: "Comment comparer le prix de deux croquettes ?",
        a: "Compare le prix par jour, pas le prix du sac. Divise le besoin calorique du chien par la densité calorique de chaque croquette pour obtenir la ration en grammes, puis multiplie par le prix au gramme. Une croquette plus dense se donne en plus petite quantité et peut revenir moins cher par jour qu'un sac moins cher au kilo.",
      },
      {
        q: "Les avis clients affichés par les marques sont-ils fiables ?",
        a: "Ils donnent une tendance, mais la marque choisit souvent la plateforme et la présentation. Dans nos avis, la note affichée par la marque est signalée comme telle et séparée de notre note éditoriale. Les retours de propriétaires que nous recevons sont publiés à part.",
      },
      {
        q: "Toutou Gourmet est-il payé par les marques ?",
        a: "Le site est financé par l'affiliation : quand tu commandes par certains liens, la marque nous verse une commission, sans changer ton prix. Ces liens sont signalés comme affiliés. La note et les points faibles de chaque avis sont publiés quelle que soit cette relation.",
      },
      {
        q: "Des croquettes sans céréales sont-elles forcément meilleures ?",
        a: "Non. Les céréales sont rarement la cause d'une allergie chez le chien : le bœuf, les produits laitiers et le poulet sont plus souvent en cause (Mueller et al., BMC Vet Res, 2016). Une croquette sans céréales peut contenir autant de glucides, apportés par la pomme de terre ou les pois ; c'est la composition complète qui compte.",
      },
    ],
    sources: [
      SRC.reglement767,
      SRC.mueller,
    ],
  },
}

export function getPillar(slug: string): PillarContent | undefined {
  return PILLARS[slug]
}
