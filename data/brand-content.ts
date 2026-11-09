// @cdc 04-pages — contenu éditorial des fiches marques (/chien/marque/[slug]) : présentation,
// recettes, FAQ et verdict. Faits repris des fiches existantes et des tests publiés dans la
// rubrique Avis ; aucun avis client inventé, aucune note sur 5.

export interface BrandFaq {
  q: string
  a: string
}

export interface BrandRecipe {
  name: string
  description: string
}

export const brandFaqs: Record<string, BrandFaq[]> = {
  franklin: [
    { q: 'Franklin est-il une bonne marque ?', a: "D'après sa composition, oui : les 7 recettes de croquettes pour chien qu'on a lues obtiennent de 83 à 92 sur 100 au barème du scanner. Reste à vérifier que ton chien les digère : la transition se fait sur 10 jours au moins." },
    { q: 'Où acheter les croquettes Franklin ?', a: "Franklin vend d'abord sur son propre site, à l'unité ou en abonnement. La marque ne figure pas dans le catalogue Maxi Zoo qu'on a lu le 5 novembre 2026." },
    { q: 'Quel est le prix Franklin selon la taille de mon chien ?', a: "Pour un petit chien de moins de 10 kg, compte à partir de 17 € par mois en abonnement. Pour un grand chien de plus de 25 kg, environ 75 à 80 € par mois, soit 2,50 € par jour. Le prix au kilo dépend de la recette et du sac : environ 9 € le kilo pour le Saumon & Truite en 2,5 kg, environ 6,30 € pour l'Agneau en 12 kg et 5,20 € pour le Bœuf en 12 kg. L'abonnement retire 15 à 20 % et la livraison en point relais devient gratuite dès 49 €." },
    { q: 'Où sont fabriquées les croquettes Franklin ?', a: "Les recettes sont formulées à Paris par l'équipe Franklin avec la Dr Charlotte Dirat, vétérinaire. La fabrication a lieu en République tchèque, dans une usine certifiée ISO et HACCP du groupe VAFO, qui produit aussi CARNILOVE et BRIT. La cuisson se fait entre 90 et 110 °C. Franklin ne produit pas en France." },
    { q: 'Quel est le taux de protéines selon la recette ?', a: "Canard, Pomme & Carotte : 34 % de protéines, 18 % de lipides, 391 kcal pour 100 g. Saumon, Truite & Persil : 34 % de protéines, 16,5 % de lipides, 0,5 % d'oméga-3. Poulet, Courge & Myrtille (chien stérilisé) : 34 % de protéines, 16,5 % de lipides. Chiot Poulet, Saumon & Fenouil : 37,5 % de protéines, 18,5 % de lipides. La recette Agneau ne contient que 25 % de protéines, un point à connaître pour un chien très actif." },
    { q: 'Franklin convient-il aux chiens allergiques ?', a: "Oui, c'est l'origine de la marque. Franklin a été créée en 2018 pour Iphy, une bouledogue française allergique au poulet et au bœuf. La recette Canard, Pomme & Carotte ne contient que du canard comme viande, ce qui aide pour un régime d'éviction. Saumon, Truite & Persil est sans volaille ni viande rouge. L'Agneau, Patate douce & Menthe convient à un chien qui n'a jamais mangé d'agneau." },
    { q: "Comment fonctionne l'abonnement Franklin ?", a: "L'abonnement retire 30 % sur les 3 premières commandes, puis 20 % sur les suivantes, et triple les points de fidélité. Il est sans engagement : tu changes la fréquence, la quantité, tu mets en pause ou tu arrêtes depuis ton espace client. Un message arrive 2 à 3 jours avant chaque envoi pour ajuster la commande. Franklin livre dans 7 pays européens. Les avis signalent des retards et des colis bloqués de temps en temps." },
    { q: 'Franklin convient-il aux chiots et aux chiens seniors ?', a: "Oui. La recette chiot Poulet, Saumon & Fenouil contient du DHA et 37,5 % de protéines, le taux le plus haut de la gamme. Une recette Chiot Digestion existe pour les chiots aux intestins fragiles. Pour un senior, la recette Dinde, Courge & Poire contient de la glucosamine et de la chondroïtine, sans complément à ajouter." },
    { q: "Comment faire la transition depuis d'autres croquettes ?", a: "Franklin conseille 10 jours au moins, parfois un mois selon les avis. Jours 1 à 3 : 25 % de Franklin et 75 % de l'ancien aliment. Jours 4 à 6 : moitié-moitié. Jours 7 à 9 : 75 % de Franklin. Jour 10 : 100 %. Une transition trop rapide donne des selles molles, le reproche le plus fréquent sur Trustpilot." },
    { q: 'Franklin convient-il aux chats ?', a: "Oui. Franklin propose 5 recettes pour chats, dont une recette stérilisé Poulet, Thon & Saumon à 36 % de protéines, une recette senior et une recette chaton à 38 % de protéines avec DHA. Toutes sont sans céréales, avec de la farine de krill pour les oméga-3. Des pâtées pour chat existent aussi." },
  ],
  elmut: [
    { q: 'Elmut est-il une bonne marque ?', a: "D'après sa composition, oui : ses 5 recettes pour chien obtiennent toutes 90 sur 100 au barème du scanner, avec une viande nommée en tête de liste. Trustpilot affiche 4,4 sur 5 au 5 novembre 2026, et les avis négatifs lus parlent surtout d'abonnements repris sans rappel, de prélèvements et de livraisons." },
    { q: 'Où sont cuisinés les repas Elmut ?', a: "Le site d'Elmut annonce des repas mijotés en Poitou-Charentes, sans adresse précise sur les pages qu'on a lues le 5 novembre 2026." },
    { q: 'Quel est le prix Elmut selon la taille de mon chien ?', a: "Petit chien de moins de 10 kg : environ 1,80 à 2,50 € par jour, soit 55 à 75 € par mois. Chien moyen de 10 à 25 kg : environ 2,50 à 4 € par jour, soit 75 à 120 € par mois. Grand chien de 25 à 40 kg : environ 4 à 6 € par jour, soit 120 à 180 € par mois. Ces prix valent pour une ration 100 % Elmut. La demi-ration (moitié Elmut, moitié croquettes) divise le budget par deux." },
    { q: 'Comment faire la transition depuis les croquettes ?', a: "Elmut conseille 7 à 10 jours. Jours 1 à 3 : 25 % d'Elmut. Jours 4 à 6 : moitié-moitié. Jours 7 à 9 : 75 %. Jour 10 : 100 %. La flore intestinale a ainsi le temps de s'adapter, ce qui limite diarrhée et ballonnements. Mieux vaut alterner les repas que mélanger les deux aliments dans la même gamelle." },
    { q: 'Elmut convient-il aux chiots ?', a: "À partir de 4 mois selon le site d'Elmut. Le questionnaire tient compte de l'âge, de la race et du poids adulte estimé pour calculer la ration de croissance. Pour un chiot de grande race (Berger allemand, Labrador), la vitesse de croissance se surveille de près, et Elmut ajuste les rations." },
    { q: 'Elmut convient-il aux chiens seniors ou en surpoids ?', a: "Le site d'Elmut dit suivre les préconisations FEDIAF pour les chiens adultes et seniors, et la ration est calculée sur le profil du chien. Les recettes affichent de 26 à 29 % de matières grasses sur matière sèche : pour un chien en surpoids ou malade, décide avec ton vétérinaire." },
    { q: 'Que faire des repas Elmut pendant les vacances ?', a: "Deux solutions. Tu congèles des repas à l'avance (jusqu'à six mois, selon le site d'Elmut) et tu pars avec une glacière. Ou tu suspends l'abonnement depuis ton espace client avant le départ, sans pénalité ni délai minimum." },
    { q: 'Comment conserver les repas Elmut ?', a: "Au réfrigérateur en permanence, jusqu'à la date indiquée sur l'étiquette, puis 5 jours après ouverture du boudin. Au congélateur : jusqu'à six mois, selon le site d'Elmut. Chaque livraison arrive réfrigérée par Chronofresh. Prévois environ deux étagères de frigo pour une semaine, selon la taille du chien." },
    { q: 'Elmut est-il disponible pour les chats ?', a: "Oui, Elmut propose 3 recettes pour chats (poulet, bœuf, dinde) avec jusqu'à 90 % de viande et moins de 3 % de glucides." },
  ],
  'dog-chef': [
    { q: 'Dog Chef est-il une bonne marque ?', a: "D'après sa composition, oui : ses 11 recettes obtiennent de 85 à 95 sur 100 au barème du scanner, avec une viande nommée en tête de liste. Son prix reste élevé, et la box d'essai sert à vérifier que ton chien aime les repas." },
    { q: 'Dog Chef est-il sans engagement ?', a: "Le site de Dog Chef annonce une formule sans engagement. Lis les conditions de résiliation et de pause avant de commander, car la page des plans ne les détaille pas." },
    { q: 'Quel est le prix Dog Chef selon la taille de mon chien ?', a: "Petit chien de moins de 10 kg : environ 1,50 à 2 € par jour, soit 45 à 60 € par mois. Chien moyen de 10 à 25 kg : environ 2 à 4 € par jour, soit 60 à 120 € par mois. Grand chien de 25 à 40 kg : environ 4 à 5,50 € par jour, soit 120 à 165 € par mois. La livraison est comprise. Le plan mixte (moitié frais, moitié croquettes) coupe la facture de moitié." },
    { q: 'Quelle est la différence entre les 3 plans Dog Chef ?', a: "Le plan 100 % frais donne la ration entière en repas frais. Le plan mixte associe repas frais et croquettes, souvent conseillé pour commencer. Le plan 100 % croquettes Dog Chef propose des croquettes sans gluten avec prébiotiques, glucosamine et oméga-3 d'huile d'algues, pour un budget ou un frigo limités." },
    { q: "Qu'est-ce que les Boosters Dog Chef ?", a: "Des compléments ciblés ajoutés à la ration. Le Puppy Booster apporte calcium et phosphore aux chiots. Le Senior Booster associe glucosamine et curcuma pour les chiens âgés. Le Mobility Booster soutient les cartilages. Le Pro Transit Booster contient pré et probiotiques pour un transit fragile. Dog Chef les propose après le questionnaire, selon le profil." },
    { q: 'Dog Chef convient-il aux chiens allergiques ?', a: "Les recettes au canard et au poisson conviennent à un chien sensible ou à la peau atopique. Le canard est une protéine que la plupart des chiens n'ont jamais mangée, ce qui limite le risque de réaction." },
    { q: 'Dog Chef convient-il aux chiots et aux seniors ?', a: "Oui. Pour un chiot, Dog Chef adapte le rapport calcium et phosphore à la race et au poids adulte estimé, et propose le Puppy Booster. Pour un senior, le menu Poisson et le Senior Booster (glucosamine et curcuma) visent les chiens de plus de 7 ou 8 ans à la mobilité réduite." },
    { q: 'Combien de temps se conservent les repas Dog Chef ?', a: "Fermés : 7 jours au réfrigérateur et jusqu'à 10 mois au congélateur. Ouverts ou décongelés : 3 jours au réfrigérateur. La box d'essai couvre deux semaines, de quoi faire la transition." },
    { q: 'La livraison Dog Chef est-elle gratuite ?', a: "Oui, en France métropolitaine, comprise dans le prix de l'abonnement. Les repas arrivent en camionnette réfrigérée, en boudins portionnés." },
    { q: 'Quel est le code promo Dog Chef ?', a: "Le code WZU7090 donne −30 % sur la box d'essai, avec la livraison gratuite et sans engagement. Notre lien partenaire l'applique automatiquement ; tu peux aussi le saisir sur le site Dog Chef." },
    { q: 'Où sont fabriqués les repas Dog Chef ?', a: "Dans l'atelier de Dog Chef à Huldenberg, en Belgique, où travaillent plus de 100 personnes. La marque a été fondée en 2017 et livre depuis ce site la France, la Belgique et le Luxembourg." },
    { q: 'Dog Chef propose-t-il des repas pour chat ?', a: "Non, Dog Chef ne fait que des repas pour chien. Pour un chat, Elmut propose une gamme de repas frais." },
    { q: 'Quels sont les avis négatifs sur Dog Chef ?', a: "Le prix revient le plus souvent : 45 à 165 € par mois selon le gabarit, bien plus que des croquettes classiques. L'inscription demande un profil détaillé (race, poids, activité, santé) avant la première commande. Et il n'existe aucune formule pour chat." },
    { q: 'Que disent les vétérinaires de Dog Chef ?', a: "Dog Chef n'a pas publié d'étude clinique indépendante sur ses recettes. Pour un chien qui a une maladie diagnostiquée, fais valider le plan par ton vétérinaire avant de commencer." },
  ],
  'ultra-premium-direct': [
    { q: 'Ultra Premium Direct est-il une bonne marque ?', a: "D'après sa composition, cela dépend de la recette : les 26 recettes pour chien qu'on a lues vont de 75 à 97 sur 100 au barème du scanner. Trustpilot affiche 4,0 sur 5 au 5 novembre 2026, avec des reproches surtout sur la livraison et le service client." },
    { q: 'Quel est le prix des croquettes Ultra Premium Direct ?', a: "Le sac de 12 kg pour chien de taille moyenne coûte 46,90 €, soit 3,91 € le kilo au 5 novembre 2026, et 42,21 € en abonnement. Le prix au kilo change selon la gamme." },
    { q: "L'abonnement Ultra Premium Direct est-il sans engagement ?", a: "La fiche produit demande d'accepter au moins 2 livraisons. La fréquence, le produit et la quantité restent modifiables, jusqu'à 3 jours avant l'expédition pour un changement de référence." },
    { q: 'La livraison Ultra Premium Direct est-elle gratuite ?', a: "Au 5 novembre 2026, elle devient gratuite dès 64 € d'achat. En dessous, elle part de 3,90 € à domicile et de 2,90 € en point relais, avec des tarifs à part pour les îles et certains codes postaux." },
    { q: 'Où sont fabriquées les croquettes Ultra Premium Direct ?', a: "La marque dit faire produire ses croquettes par des sous-traitants français, qu'elle ne nomme pas. Ses pâtées sont fabriquées en Lot-et-Garonne, en Bretagne et dans le Nord-Pas-de-Calais, selon son site." },
    { q: 'Où acheter Ultra Premium Direct ?', a: "La marque vend en direct sur son site. Elle ne figure pas dans le catalogue Maxi Zoo qu'on a lu le 5 novembre 2026." },
  ],
  'dogfy-diet': [
    { q: 'Dogfy Diet est-il une bonne marque ?', a: "D'après sa composition, oui : ses 4 recettes obtiennent de 85 à 89 sur 100 au barème du scanner. Ses pages ne donnent ni calcium ni phosphore, et environ la moitié des avis négatifs lus sur Trustpilot parle de prélèvements, d'abonnement ou de résiliation." },
    { q: "Comment fonctionne l'abonnement Dogfy Diet ?", a: "Les repas arrivent en sachets prédosés, au rythme choisi à l'inscription. L'abonnement est sans engagement et comprend un suivi nutritionnel gratuit. Une partie des avis Trustpilot signale des prélèvements mal compris et une résiliation compliquée : note la date du prochain envoi et la marche à suivre pour arrêter avant de valider." },
    { q: 'Que contient le menu bœuf Dogfy Diet ?', a: "60,5 % de bœuf et 26 % de carotte, selon la page officielle lue le 5 novembre 2026. L'analyse indique 72 % d'humidité, 42,9 % de protéines et 37,5 % de matières grasses une fois l'eau retirée." },
    { q: 'Dogfy Diet convient-il à un chien en surpoids ?', a: "Le menu bœuf est riche en graisses (37,5 % sur matière sèche). Il reste possible pour un chien en surpoids si tu réduis la portion et pèses le chien toutes les deux semaines, idéalement avec l'avis du vétérinaire. Le suivi nutritionnel gratuit sert à ajuster la quantité." },
    { q: "Quelle est l'offre de bienvenue Dogfy Diet ?", a: "Une box d'essai de 14 jours à −50 %, livraison offerte. Vérifie ensuite le prix de l'abonnement au tarif normal avant le deuxième envoi." },
    { q: 'Que disent les avis clients sur Dogfy Diet ?', a: "La marque obtient 4,4/5 sur 12 609 avis Trustpilot au 5 novembre 2026. Sur les 20 avis à une ou deux étoiles lus ce jour-là, environ la moitié parle de prélèvements, d'abonnement ou de résiliation. Viennent ensuite les livraisons. Note la date du prochain envoi et vérifie le colis." },
  ],
  fidelis: [
    { q: 'Les menus Fidelis sont-ils disponibles ?', a: "Au 1er novembre 2026, tous les menus en bocaux étaient affichés « Sold Out » sur le site. Vérifie le stock avant de prévoir une transition alimentaire." },
    { q: 'Faut-il garder les bocaux Fidelis au frigo ?', a: "Pas avant ouverture : le bocal en verre se conserve à température ambiante tant qu'il est fermé." },
    { q: 'Quelles protéines propose Fidelis ?', a: "La gamme compte 11 recettes en bocal et 10 protéines, dont le cheval, la chèvre, le porc et le saumon en plus du poulet et du bœuf. Les recettes poulet, bœuf et cheval contiennent 70 % de viande." },
    { q: 'Combien coûte Fidelis ?', a: 'Environ 11 à 12,50 € le kilo selon la recette.' },
    { q: 'Qui est derrière Fidelis ?', a: "La marque est éditée par Sanadog GmbH, en Allemagne. Les recettes ont été développées avec la vétérinaire Anita Kröger." },
  ],
}

export const brandRecipes: Record<string, BrandRecipe[]> = {
  franklin: [
    { name: 'Canard, Pomme & Carotte', description: '70 % de canard, 34 % de protéines, une seule viande. Pour un chien allergique.' },
    { name: 'Saumon, Truite & Persil', description: "70 % de poisson, 34 % de protéines, 0,5 % d'oméga-3. Pour la peau et le pelage." },
    { name: 'Poulet, Courge & Myrtille', description: '70 % de poulet, 34 % de protéines. Pour un chien stérilisé.' },
    { name: 'Dinde, Courge & Poire', description: '65 % de dinde, avec glucosamine et chondroïtine. Pour un chien senior.' },
    { name: 'Poulet, Saumon & Fenouil', description: '70 % de viande, 37,5 % de protéines, DHA. Pour un chiot.' },
    { name: 'Pâtée Canard & Valériane', description: 'Canard seul, sans céréales. En complément des croquettes.' },
  ],
  elmut: [
    { name: 'Menu Poulet', description: '62 % de poulet (viande, foie, cœur), 53,7 % de protéines sur matière sèche.' },
    { name: 'Menu Bœuf', description: '62 % de bœuf (cœur, poumons, foie), 48,8 % de protéines sur matière sèche.' },
    { name: 'Menu Dinde', description: '62 % de dinde (viande, foie, cœur), 52,7 % de protéines sur matière sèche.' },
    { name: 'Menu Porc', description: '62 % de porc (cœur, foie, viande), 50,6 % de protéines sur matière sèche.' },
    { name: 'Menu Poisson', description: '47 % de poisson (saumon, colin), avec du foie de poulet, 45,6 % de protéines sur matière sèche.' },
  ],
  'dog-chef': [
    { name: 'Menu Poulet', description: 'Viande, gésier et foie. 38,8 % de protéines et 25,5 % de lipides sur matière sèche.' },
    { name: 'Menu Bœuf', description: 'Cœur, tripes et foie de bœuf, pommes de terre, haricots verts, sarrasin.' },
    { name: 'Menu Porc', description: 'Cœur et langue de porc, haricots verts, riz. La recette la moins chère.' },
    { name: 'Menu Canard', description: 'Protéine que la plupart des chiens ne connaissent pas. Pour un chien allergique.' },
    { name: 'Menu Poisson', description: "Merlu ou colin, carottes, courgettes, riz, 1,4 % d'oméga-3. Pour un senior." },
    { name: 'Croquettes Poulet ou Canard', description: "Sans gluten, avec prébiotiques, huile d'algues, glucosamine et chondroïtine." },
  ],
  'dogfy-diet': [
    { name: 'Menu bœuf', description: '60,5 % de bœuf, 26 % de carotte. 42,9 % de protéines et 37,5 % de matières grasses sur matière sèche.' },
  ],
}

export const brandDescriptions: Record<string, string[]> = {
  franklin: [
    "Franklin Pet Food est née en 2018 pour Iphy, la bouledogue française d'Andrea El Hani, allergique au poulet et au bœuf. Eczéma, troubles digestifs : aucune croquette du marché ne lui convenait. Andrea s'associe alors à Bertrand Dupray et lance des croquettes à une seule source de viande, sans céréales.",
    "Les recettes sont formulées à Paris avec la Dr Charlotte Dirat, vétérinaire nutritionniste, et fabriquées en République tchèque dans une usine du groupe VAFO (CARNILOVE, BRIT), certifiée ISO et HACCP. La cuisson se fait entre 90 et 110 °C. Les recettes montent jusqu'à 70 % de viande ou de poisson, avec la patate douce comme principale source d'amidon.",
    "Le groupe VAFO est actionnaire depuis 2023. Franklin revendique plus de 100 000 clients et livre dans 7 pays européens. La gamme couvre le chiot (recette avec DHA), l'adulte, le chien stérilisé, le senior (glucosamine et chondroïtine) et les allergies.",
    "Sur Trustpilot, Franklin obtient 4,6/5 sur 12 158 avis au 5 novembre 2026. Les clients citent le pelage, la digestion et l'appétence. Le reproche qui revient porte sur la livraison : retards, colis bloqués. Les recettes sans poisson ont un rapport oméga-6/oméga-3 élevé, qu'une cuillère d'huile de saumon deux ou trois fois par semaine compense.",
  ],
  elmut: [
    "Elmut a été fondée en 2019 par une équipe française. La marque cuisine ses repas en Poitou-Charentes, selon son site, dans une cuisine agréée qualité humaine, sous vide à 90 °C pendant plus de deux heures, loin des 200 °C de l'extrusion des croquettes.",
    "Tu remplis le profil de ton chien (race, âge, poids, activité, santé), Elmut calcule la ration et envoie des boudins réfrigérés prêts à servir. Les recettes contiennent 62 % de viande, ou 47 % de poisson pour la recette au poisson, avec une liste de 8 ingrédients.",
    "Pour passer des croquettes à Elmut, compte 7 à 10 jours de transition progressive. La flore intestinale a ainsi le temps de s'adapter.",
  ],
  'dog-chef': [
    "Dog Chef a été fondée en 2017 en Belgique. La marque cuisine ses repas dans son propre atelier à Huldenberg, avec plus de 100 employés, et livre la France, la Belgique et le Luxembourg. Elle a été élue Produit de l'Année 2026 et la livraison est comprise dans le prix.",
    "Un questionnaire de cinq minutes (race, âge, poids, activité, santé, stérilisation) sert à calculer la ration. Les portions sont recalculées quand le poids du chien change. Trois formules existent : 100 % frais, mixte (frais et croquettes) ou 100 % croquettes. La formule mixte est souvent conseillée pour commencer.",
    "Les Boosters complètent la ration selon le profil : Puppy Booster (calcium et phosphore pour la croissance), Senior Booster (glucosamine et curcuma), Mobility Booster (cartilages) et Pro Transit Booster (pré et probiotiques).",
    "La transition conseillée dure 7 jours. Les repas se gardent 7 jours au réfrigérateur et jusqu'à 10 mois au congélateur, selon le site de Dog Chef. La box d'essai couvre deux semaines.",
  ],
  'dogfy-diet': [
    "Dogfy Diet livre des repas frais pour chien, cuits sous vide à température douce puis conditionnés en sachets prédosés. Chaque sachet correspond à une portion calculée pour le chien inscrit, sans balance à sortir. La marque dit suivre les recommandations nutritionnelles de la FEDIAF.",
    "Le menu bœuf contient 60,5 % de bœuf et 26 % de carotte. Son analyse affiche 72 % d'humidité, soit 42,9 % de protéines et 37,5 % de matières grasses une fois l'eau retirée. Pour un chien en surpoids, la portion se dose avec soin et se vérifie à la pesée.",
    "La formule fonctionne en abonnement sans engagement, avec un suivi nutritionnel gratuit. L'offre de bienvenue donne une box d'essai de 14 jours à −50 %, livraison offerte.",
    "Sur Trustpilot, Dogfy Diet obtient 4,4/5 sur 12 609 avis au 5 novembre 2026. Les reproches portent sur les prélèvements de l'abonnement, que certains clients n'avaient pas compris, sur une résiliation jugée difficile et sur quelques sachets arrivés abîmés. Lis les conditions de l'abonnement avant de valider la box d'essai.",
  ],
  fidelis: [
    "Fidelis vend des menus frais pour chien en bocaux de verre. Les recettes sont cuites à la vapeur douce, et le bocal se conserve hors du réfrigérateur tant qu'il n'est pas ouvert. La marque est éditée par Sanadog GmbH, en Allemagne, et ses recettes ont été développées avec la vétérinaire Anita Kröger.",
    "La gamme compte 8 recettes, dont deux viandes peu courantes chez le chien, le cheval et la chèvre. Les recettes poulet, bœuf et cheval contiennent 70 % de viande. Le prix tourne autour de 11 à 12,50 € le kilo.",
    "Au 1er novembre 2026, tous les menus en bocaux étaient affichés « Sold Out » sur le site. Fidelis n'a pas de page Trustpilot pour fidelis.fr, ce qui laisse peu d'avis clients vérifiables. Tant que le stock n'est pas revenu, Dogfy Diet, Dog Chef ou Elmut proposent aussi des repas frais.",
  ],
}

export const brandVerdicts: Record<string, string> = {
  franklin: "Franklin est le choix le plus simple pour un chien allergique ou sensible : une seule viande par recette, jusqu'à 70 % de viande et une composition courte. La fabrication se fait en République tchèque et les livraisons connaissent des ratés selon les avis. L'abonnement est à −30 %.",
  elmut: "Elmut convient si tu veux passer au repas frais avec une ration calculée pour ton chien. Il faut de la place au frigo et un budget plus élevé que pour des croquettes. La première commande est à −40 % par notre lien.",
  'ultra-premium-direct': "Ultra Premium Direct vise le chien adulte sans souci particulier et le budget serré : 3,50 à 6 € le kilo en vente directe. Les recettes standard contiennent du maïs et moins de viande que Franklin ; pour un chien sensible, la gamme Sans Céréales coûte 1,30 à 1,80 € de plus au kilo.",
  'dog-chef': "Dog Chef convient à un chien dont les besoins changent : chiot en croissance, chien en surpoids, senior. Les portions sont recalculées quand le poids évolue et les Boosters ciblent un besoin précis. Le prix est élevé ; la box d'essai à −30 %, livraison comprise et sans engagement, sert à tester l'appétence avant l'abonnement.",
  'dogfy-diet': "Dogfy Diet convient si tu veux passer au repas frais sans peser les portions : les sachets arrivent prédosés et le suivi nutritionnel est gratuit. Les critiques sur l'abonnement reviennent assez pour lire les conditions avant de commander. Pour un chien en surpoids, le menu bœuf se dose avec soin.",
  fidelis: "Fidelis a deux atouts rares : des bocaux qui se gardent au placard avant ouverture, et des viandes peu courantes comme le cheval ou la chèvre. Les menus étaient tous en rupture de stock au 1er novembre 2026 et peu d'avis clients sont vérifiables. On ne la recommande pas tant que le stock n'est pas revenu.",
}

export const relatedComparatifs: Record<string, { slug: string; label: string }[]> = {
  'dog-chef': [{ slug: 'elmut-vs-dog-chef', label: 'Dog Chef ou Elmut, lequel choisir ?' }],
  elmut: [
    { slug: 'elmut-vs-dog-chef', label: 'Elmut ou Dog Chef, lequel choisir ?' },
    { slug: 'franklin-vs-elmut', label: 'Franklin ou Elmut, lequel choisir ?' },
    { slug: 'elmut-vs-ultra-premium-direct', label: 'Elmut ou Ultra Premium Direct, lequel choisir ?' },
  ],
  franklin: [
    { slug: 'franklin-vs-elmut', label: 'Franklin ou Elmut, lequel choisir ?' },
    { slug: 'franklin-vs-ultra-premium-direct', label: 'Franklin ou Ultra Premium Direct, lequel choisir ?' },
    { slug: 'dog-chef-vs-franklin', label: 'Dog Chef ou Franklin, lequel choisir ?' },
  ],
  'ultra-premium-direct': [
    { slug: 'franklin-vs-ultra-premium-direct', label: 'Franklin ou Ultra Premium Direct, lequel choisir ?' },
    { slug: 'dog-chef-vs-ultra-premium-direct', label: 'Dog Chef ou Ultra Premium Direct, lequel choisir ?' },
    { slug: 'elmut-vs-ultra-premium-direct', label: 'Elmut ou Ultra Premium Direct, lequel choisir ?' },
  ],
}

/** Test complet publié dans la rubrique Avis, quand il existe. */
export const fullReviews: Record<string, { href: string; label: string }> = {
  'ultra-premium-direct': { href: '/chien/avis-marques/avis-ultra-premium-direct', label: 'Notre avis complet sur Ultra Premium Direct' },
  'dogfy-diet': { href: '/chien/avis-marques/avis-dogfy-diet-repas-frais-chien', label: 'Notre avis complet sur Dogfy Diet' },
  fidelis: { href: '/chien/avis-marques/avis-fidelis-menus-frais-chien-bocaux', label: 'Notre avis complet sur Fidelis' },
  'dog-chef': { href: '/chien/avis-marques/avis-dog-chef-croquettes-canard-frais', label: 'Notre avis sur les croquettes Dog Chef au canard' },
  franklin: { href: '/chien/avis-marques/avis-franklin-light-dinde-patate-douce-epinards', label: 'Notre avis sur la recette Franklin Light' },
}
