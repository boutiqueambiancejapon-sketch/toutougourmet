import { BAREMES_ACTIFS } from '@/lib/scanner/baremes/config'
import type { RankingContent } from './ranking-content'

// @cdc seo — texte des pages mères des partenaires, à partir des requêtes de la Search Console (export du
// 2026-11-04) et de sources datées. Les chiffres viennent des fiches du scanner et des pages citées.

export const BRAND_HUB: Record<string, Pick<RankingContent, 'sections'>> = {
  elmut: {
    sections: [
      {
        h2: 'Elmut : notre avis en bref',
        paragraphs: [
          "Elmut est une bonne marque de repas frais d'après sa composition, avec une liste d'ingrédients très courte. Ses 5 recettes pour chien obtiennent de 90 à 93 sur 100 au barème du scanner : poulet, bœuf et dinde à 93, porc à 91, poisson à 90, avec une viande nommée en tête de liste.",
          "Ces notes viennent des pages produit d'Elmut, lues le 5 novembre 2026. Sa fiche donne le rapport calcium/phosphore, de 1,1 à 1,4 selon la recette, et ne chiffre que le calcium et le phosphore ajoutés, sans leur teneur totale. Notre note ne peut donc pas vérifier ces deux teneurs elles-mêmes. Elmut est un partenaire, et le barème reste celui des autres marques.",
        ],
      },
      {
        h2: 'Combien coûte Elmut par jour ?',
        paragraphs: [
          "Elmut n'affiche pas de tarif chiffré avant son questionnaire : le prix dépend du profil du chien et de la formule, demi-pension ou pension complète. Le site propose un essai de 2 semaines et annonce un abonnement sans engagement au 5 novembre 2026.",
          "Pour un repère, regarde les tarifs par gabarit dans les questions fréquentes de cette page, puis demande ton prix exact sur le site. Notre page [code promo Elmut](/codes-promo/elmut) détaille l'offre du moment, et notre outil de [coût annuel](/outils/cout) compare le repas frais et les croquettes sur un an.",
        ],
      },
      {
        h2: 'Elmut a-t-il des avis négatifs ?',
        paragraphs: [
          "Oui : Trustpilot affiche 4,4 sur 5 pour 2 749 avis au 5 novembre 2026, dont 7 % à une étoile et 2 % à deux étoiles. Cette part d'avis à une étoile dépasse celle de Dog Chef et de Franklin, autour de 3 % à la même date.",
          "On a lu les 20 avis à une ou deux étoiles de la première page ce jour-là. Ils parlent surtout d'abonnements repris sans rappel, de prélèvements et de retenues de 20 €, puis de livraisons retardées ou jamais reçues. Note la date du prochain envoi et vérifie le colis à l'arrivée.",
        ],
      },
      {
        h2: "Que disent les vétérinaires d'Elmut ?",
        paragraphs: [
          "Elmut publie le témoignage du Dr David Balouka, vétérinaire, sur sa propre page d'accueil : un avis qui vient de la marque et n'a rien d'une étude indépendante. Les pourcentages affichés sur cette page viennent d'un sondage auprès de clients. Toutou Gourmet n'a pas de vétérinaire relecteur, et on n'a pas trouvé d'étude indépendante portant sur Elmut elle-même.",
          "Un chiot, un chien malade ou un chien sous traitement mérite qu'on montre la recette à son vétérinaire. Notre guide [repas frais ou croquettes](/chien/avis-marques/repas-frais-vs-croquettes-chien) résume ce que l'on sait des deux options.",
        ],
      },
      {
        h2: 'Où est cuisiné Elmut et quels sont ses concurrents ?',
        paragraphs: [
          "Elmut annonce des repas mijotés en Poitou-Charentes sur son site, sans adresse précise sur les pages qu'on a lues. Les boudins se gardent au réfrigérateur jusqu'à la date indiquée sur l'étiquette, se consomment dans les 5 jours après ouverture et se congèlent jusqu'à six mois.",
          "Dog Chef et Dogfy Diet sont ses concurrents les plus proches en repas frais livrés, notés de 85 à 87 pour les repas de la première et de 87 à 91 pour la seconde. Nos duels détaillent le choix : [Elmut ou Dog Chef](/chien/marque/elmut-vs-dog-chef), [Franklin ou Elmut](/chien/marque/franklin-vs-elmut) et [Elmut ou Ultra Premium Direct](/chien/marque/elmut-vs-ultra-premium-direct) pour comparer avec les croquettes.",
        ],
      },
    ],
  },
  'ultra-premium-direct': {
    sections: [
      {
        h2: 'Ultra Premium Direct : notre avis en bref',
        paragraphs: [
          "Ultra Premium Direct est une marque correcte à bonne d'après sa composition, avec un écart net d'une recette à l'autre. Ses 26 recettes pour chien vont de 70 à 98 sur 100 au barème du scanner : les gammes sans céréales et les pâtées occupent le haut de la liste, et la recette hypoallergénique ferme la marche à 70.",
          "Ces notes viennent des fiches produit de la marque, lues le 5 novembre 2026. Une note de composition ne dit rien de la digestion de ton chien. Ultra Premium Direct est un partenaire, et le barème reste celui des autres marques des [classements](/meilleures-croquettes).",
        ],
      },
      {
        h2: 'Combien coûte Ultra Premium Direct ?',
        paragraphs: [
          "Le sac de 12 kg pour chien de taille moyenne coûte 46,90 €, soit 3,91 € le kilo au 5 novembre 2026, et 42,21 € en abonnement, soit 10 % de moins. Les autres gammes n'ont pas toutes le même prix au kilo, donc compare recette par recette.",
          "L'abonnement demande d'accepter au moins 2 livraisons, selon la fiche produit. La livraison part de 3,90 € à domicile et de 2,90 € en point relais, et devient gratuite dès 64 € d'achat. Notre page [code promo Ultra Premium Direct](/codes-promo/ultra-premium-direct) détaille l'offre annoncée : vérifie la remise au récapitulatif avant de payer.",
        ],
      },
      {
        h2: 'Ultra Premium Direct a-t-il des avis négatifs ?',
        paragraphs: [
          "Oui, et plus que chez ses concurrents directs : Trustpilot affiche 4,0 sur 5 pour 3 983 avis au 5 novembre 2026, dont 9 % à une étoile et 2 % à deux étoiles.",
          "On a lu les 20 avis à une étoile de la première page ce jour-là. La plupart parlent de colis éventrés, de sacs percés et de livraisons ratées ou mal remises, puis d'un service client injoignable et de résiliations difficiles. La fiche produit signale elle-même des délais plus longs qu'à l'habitude. Prévois une marge avant que ton sac soit vide, et vérifie-le à la livraison.",
        ],
      },
      {
        h2: "Que disent les vétérinaires d'Ultra Premium Direct ?",
        paragraphs: [
          "La marque dit travailler avec des vétérinaires nutritionnistes, sans les nommer sur les pages qu'on a lues. On n'a trouvé aucun avis vétérinaire indépendant sur elle, et Toutou Gourmet n'a pas de vétérinaire relecteur.",
          "Pour un chien en bonne santé, l'étiquette donne déjà beaucoup d'informations : premier ingrédient, protéines, calcium et phosphore. Notre guide pour [lire une étiquette de croquettes](/chien/alimentation-quotidienne/comprendre-etiquette-croquettes-chien) t'aide à les comparer, et un chien malade passe d'abord par son vétérinaire.",
        ],
      },
      {
        h2: 'Où sont fabriquées les croquettes Ultra Premium Direct et quels sont ses concurrents ?',
        paragraphs: [
          "La marque dit faire produire ses croquettes par des sous-traitants français, qu'elle ne nomme pas. Ses pâtées sont fabriquées en Lot-et-Garonne, en Bretagne et dans le Nord-Pas-de-Calais, selon son site. La marque vend en direct, et elle ne figure pas dans le catalogue Maxi Zoo lu le 5 novembre 2026.",
          "Franklin et les croquettes Dog Chef sont ses concurrents les plus proches, notés de 85 à 96 et de 90 à 94 sur 100. Nos duels détaillent le choix : [Franklin ou Ultra Premium Direct](/chien/marque/franklin-vs-ultra-premium-direct), [Dog Chef ou Ultra Premium Direct](/chien/marque/dog-chef-vs-ultra-premium-direct) et [Elmut ou Ultra Premium Direct](/chien/marque/elmut-vs-ultra-premium-direct). Notre [avis complet sur Ultra Premium Direct](/chien/avis-marques/avis-ultra-premium-direct) entre dans le détail de la gamme.",
        ],
      },
    ],
  },
  'dogfy-diet': {
    sections: [
      {
        h2: 'Dogfy Diet : notre avis en bref',
        paragraphs: [
          "Dogfy Diet est une bonne marque de repas frais d'après sa composition, avec des sachets prédosés faciles à servir. Ses 4 recettes obtiennent de 87 à 91 sur 100 au barème du scanner : bœuf, dinde et poulet à 91, saumon à 87, avec environ 60 % de viande ou de poisson selon les pages officielles.",
          `Ces notes viennent des fiches de la marque, lues le 5 novembre 2026. Ces pages ne donnent ni calcium ni phosphore, ${BAREMES_ACTIFS ? 'et notre note, qui ne peut pas les vérifier, s\'arrête donc à 90' : 'et Dogfy Diet perd donc les 5 points de ce critère'}. Le menu bœuf est riche, avec 37,5 % de matières grasses sur matière sèche, et la portion se discute pour un chien en surpoids. Dogfy Diet est un partenaire, et le barème reste le même que pour les autres marques.`,
        ],
      },
      {
        h2: 'Combien coûte Dogfy Diet ?',
        paragraphs: [
          "Dogfy Diet affiche au 5 novembre 2026 des prix de départ par jour de 1,99 € jusqu'à 2 kg, 2,19 € de 3 à 9 kg, 3,18 € de 10 à 25 kg et 4,77 € au-delà. Une autre de ses pages annonce 1,81 €, 1,99 €, 2,89 € et 4,34 € pour les mêmes gabarits, et seul le questionnaire donne ton prix. Les montants plus bas, dès 1,00 €, incluent la réduction de la box d'essai. Au tarif de départ, compte au moins 60 à 66 € par mois pour un chien de 3 à 9 kg.",
          "La box d'essai de 14 jours est annoncée à −50 %, avec la livraison gratuite et un abonnement sans engagement. Notre page [code promo Dogfy Diet](/codes-promo/dogfy-diet) explique comment l'obtenir et à quel moment arrêter si les repas ne conviennent pas.",
        ],
      },
      {
        h2: 'Dogfy Diet a-t-il des avis négatifs ?',
        paragraphs: [
          "Oui : Trustpilot affiche 4,4 sur 5 pour 12 609 avis au 5 novembre 2026, dont 8 % à une étoile et 2 % à deux étoiles. La note reste bonne, avec une part visible de clients très déçus.",
          "On a lu les 20 avis à une ou deux étoiles de la première page ce jour-là. Environ la moitié parle de prélèvements, d'abonnements réactivés ou de résiliations difficiles. Viennent ensuite les livraisons en retard ou manquées. Note la date du prochain envoi et vérifie le colis dès réception.",
        ],
      },
      {
        h2: 'Que disent les vétérinaires de Dogfy Diet ?',
        paragraphs: [
          "Dogfy Diet présente ses recettes comme élaborées par des vétérinaires et des nutritionnistes : cette information vient de la marque, sans nom sur les pages qu'on a lues. Toutou Gourmet n'a pas de vétérinaire relecteur, et on n'a pas trouvé d'étude indépendante portant sur Dogfy Diet elle-même.",
          "Dogfy Diet formule ses recettes pour des chiens en bonne santé, sans besoin nutritionnel spécifique, et ne les recommande pas en cas de problème de foie. Sa page d'aide sur le syndrome de Cushing les dit adaptées et renvoie au vétérinaire. Si ton chien a une maladie rénale, pancréatique ou cardiaque, une MICI (maladie inflammatoire chronique de l'intestin), une constipation, des calculs urinaires, un excès de graisses dans le sang ou un régime prescrit, demande l'avis de ton vétérinaire avant de commander. Fais de même s'il est en croissance ou doit surveiller son poids. Notre guide [repas frais ou croquettes](/chien/avis-marques/repas-frais-vs-croquettes-chien) résume ce que l'on sait des deux options.",
        ],
      },
      {
        h2: 'Comment conserver Dogfy Diet et quels sont ses concurrents ?',
        paragraphs: [
          "Selon la marque, les repas Dogfy Diet se conservent jusqu'à 30 jours au réfrigérateur ou 1 an au congélateur, et une portion congelée passe au réfrigérateur la veille. Un sachet ouvert se finit sous 48 heures, et un sachet arrivé décongelé mais froid sous 15 jours. Dogfy Diet annonce cuisiner ses repas à Parets del Vallès, dans la province de Barcelone. Le menu bœuf annonce 60,5 % de bœuf, dont 48,6 % d'abats et 6,9 % de viande, avec de la rate et du foie pour le reste, selon sa page officielle.",
          "Dog Chef et Elmut sont ses concurrents les plus proches, avec des repas frais notés de 85 à 87 pour le premier et de 90 à 93 pour le second. Leurs pages détaillées : [avis Dog Chef](/chien/marque/dog-chef) et [avis Elmut](/chien/marque/elmut). Pour un chien difficile, la box d'essai reste le moyen le plus simple de vérifier.",
        ],
      },
    ],
  },
  franklin: {
    sections: [
      {
        h2: 'Franklin Pet Food : notre avis en bref',
        paragraphs: [
          "Franklin Pet Food est une bonne marque d'après sa composition, surtout pour un chien qui supporte mal certaines viandes. Les 7 recettes de sa collection de croquettes pour chien qu'on a lues obtiennent de 85 à 96 sur 100 au barème du scanner : Canard et Saumon à 96, trois recettes à la dinde à 94 et deux recettes plus basses, à 85 et 86.",
          "Ces notes viennent des compositions et analyses publiées sur le site de Franklin, lues le 5 novembre 2026. Franklin est un partenaire, et le barème reste celui des autres marques des [classements](/meilleures-croquettes). Une bonne note ne dit rien de la digestion de ton chien : seule la transition répond à cette question.",
        ],
      },
      {
        h2: 'Combien coûtent les croquettes Franklin ?',
        paragraphs: [
          "Les croquettes Franklin coûtent de 20,50 € à 22,50 € le sac de 2,5 kg et de 72,40 € à 75,90 € le sac de 12 kg, selon la recette, au tarif relevé le 5 novembre 2026 sur le site de la marque. Le grand sac revient donc à environ 6 € le kilo, contre 8 à 9 € pour le petit.",
          "Notre page [code promo Franklin](/codes-promo/franklin) détaille l'offre du moment. Pour estimer le budget de ton chien sur l'année, notre outil de [coût annuel](/outils/cout) compare les formules selon son poids.",
        ],
      },
      {
        h2: 'Franklin Pet Food a-t-il des avis négatifs ?',
        paragraphs: [
          "Oui, et ils restent minoritaires : Trustpilot affiche 4,6 sur 5 pour 12 158 avis au 5 novembre 2026, dont environ 3 % à une étoile et 2 % à deux étoiles. Trustpilot mêle clients invités par la marque et clients spontanés, donc la note seule ne suffit pas.",
          "Les 2 avis à une étoile affichés ce jour-là parlent de la gestion de l'abonnement et du service client. Deux avis ne font pas une statistique. Des selles molles au changement restent le reproche à anticiper : notre guide de la [transition alimentaire](/chien/alimentation-quotidienne/transition-alimentaire-chien) aide à ralentir le rythme.",
        ],
      },
      {
        h2: 'Que disent les vétérinaires de Franklin Pet Food ?',
        paragraphs: [
          "Franklin formule ses recettes avec la Dr Charlotte Dirat, vétérinaire : cet avis vient donc de la marque et n'est pas indépendant. Toutou Gourmet n'a pas de vétérinaire relecteur, et on n'a pas trouvé d'étude indépendante portant sur Franklin elle-même.",
          "Un chien malade ou âgé mérite une lecture de plus. La recette senior Dinde, Courge et Poire affiche 1 % de phosphore, sans grande marge selon notre [comparatif des croquettes senior](/chien/avis-marques/meilleures-croquettes-chien-senior) : montre l'étiquette à ton vétérinaire si ses reins sont suivis.",
        ],
      },
      {
        h2: 'Où sont fabriquées les croquettes Franklin et quels sont ses concurrents ?',
        paragraphs: [
          "Les croquettes Franklin sont formulées à Paris et fabriquées en République tchèque, et la marque vend d'abord sur son propre site. Elle ne figure pas dans le catalogue Maxi Zoo lu le 5 novembre 2026.",
          "Ultra Premium Direct et Dog Chef sont ses concurrents les plus proches en croquettes : leurs recettes notent de 70 à 98 sur 100 pour la première et de 90 à 94 pour les croquettes de la seconde. Nos duels détaillent le choix : [Franklin ou Ultra Premium Direct](/chien/marque/franklin-vs-ultra-premium-direct), [Dog Chef ou Franklin](/chien/marque/dog-chef-vs-franklin) et [Franklin ou Elmut](/chien/marque/franklin-vs-elmut) pour comparer avec le repas frais.",
        ],
      },
    ],
  },
  'dog-chef': {
    sections: [
      {
        h2: 'Dog Chef : notre avis en bref',
        paragraphs: [
          "Dog Chef est une bonne marque d'après sa composition, avec un prix qui reste élevé pour un grand chien nourri en 100 % frais. Ses 11 recettes obtiennent de 85 à 94 sur 100 au barème du scanner, avec une viande nommée en tête de chaque liste. Les croquettes notent de 90 à 94, les repas frais de 85 à 87.",
          "Ces notes viennent des compositions et analyses publiées sur le site de Dog Chef, lues le 5 novembre 2026. Elles ne disent rien de l'appétit de ton chien ni de sa digestion : la box d'essai répond à cette question. Dog Chef est un partenaire, et le barème reste le même que pour les autres marques des [classements](/meilleures-croquettes).",
        ],
      },
      {
        h2: 'Combien coûte Dog Chef par jour ?',
        paragraphs: [
          "Dog Chef annonce trois plans au 5 novembre 2026 : le plan frais à partir de 1,50 € par jour, le plan mixte à partir de 1,16 € et le plan partiel à partir de 0,75 €. Ces prix de départ concernent les petits chiens, et la facture grimpe avec le poids : le prix exact s'affiche après le questionnaire.",
          "La livraison est annoncée gratuite et la box d'essai bénéficie de −30 %. Notre page [code promo Dog Chef](/codes-promo/dog-chef) explique comment l'obtenir. Pour comparer avec des croquettes sur toute l'année, notre outil de [coût annuel](/outils/cout) fait le calcul selon ton chien.",
        ],
      },
      {
        h2: 'Dog Chef a-t-il des avis négatifs ?',
        paragraphs: [
          "Oui, comme toute marque, mais ils restent rares : Trustpilot affiche 4,7 sur 5 pour 5 569 avis au 5 novembre 2026, dont environ 3 % à une étoile. Trustpilot mêle clients invités par la marque et clients spontanés, donc une note ne suffit pas.",
          "Les avis à une étoile qu'on a lus parlent surtout du service client et de la livraison : créneaux, transporteur, réponses jugées lentes. Quelques-uns évoquent des colis mal dosés. Notre lecture porte sur les 7 avis affichés ce jour-là, à prendre comme une tendance et pas comme une statistique.",
          "Un chien qui refuse ses repas reste le risque le plus simple à tester. La transition se fait sur 7 jours, et notre guide de la [transition alimentaire](/chien/alimentation-quotidienne/transition-alimentaire-chien) aide si son ventre proteste.",
        ],
      },
      {
        h2: 'Quels sont les concurrents de Dog Chef ?',
        paragraphs: [
          "Elmut, Butternut Box et Dogfy Diet sont les concurrents les plus proches en repas frais livrés. Elmut note de 90 à 93 sur 100 au scanner et Dogfy Diet de 87 à 91, sur leurs pages officielles. Nos duels détaillent le choix : [Dog Chef ou Elmut](/chien/marque/elmut-vs-dog-chef) et [Butternut Box ou Dog Chef](/chien/avis-marques/butternut-box-vs-dog-chef).",
          "Pour un budget plus serré, les croquettes restent moins chères au quotidien. Nos comparatifs [Dog Chef ou Just Russel](/chien/avis-marques/dog-chef-vs-just-russel), [Dog Chef ou Japhy](/chien/avis-marques/dog-chef-vs-japhy) et [Dog Chef ou Royal Canin](/chien/avis-marques/dog-chef-vs-royal-canin) comparent ces deux logiques, et notre avis sur les [croquettes Dog Chef au canard](/chien/avis-marques/avis-dog-chef-croquettes-canard-frais) entre dans le détail d'une recette.",
        ],
      },
      {
        h2: 'Que disent les vétérinaires de Dog Chef ?',
        paragraphs: [
          "Dog Chef publie l'avis d'un vétérinaire sur ses propres pages, un avis qui n'est donc pas indépendant. Toutou Gourmet n'a pas de vétérinaire relecteur, et on n'a pas trouvé d'étude indépendante portant sur la marque elle-même.",
          "Le bon réflexe reste de montrer la composition à ton vétérinaire si ton chien est malade, allergique ou en croissance rapide. Il pourra dire si le phosphore, le calcium et les protéines de la recette lui conviennent, et notre guide [repas frais ou croquettes](/chien/avis-marques/repas-frais-vs-croquettes-chien) résume ce que l'on sait des deux options.",
        ],
      },
    ],
  },
}
