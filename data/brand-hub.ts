import type { RankingContent } from './ranking-content'

// @cdc seo — texte des pages mères des partenaires, à partir des requêtes de la Search Console (export du
// 2026-11-04) et de sources datées. Les chiffres viennent des fiches du scanner et des pages citées.

export const BRAND_HUB: Record<string, Pick<RankingContent, 'sections'>> = {
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
          "Les 2 avis à une étoile affichés ce jour-là parlent de la gestion de l'abonnement, du service client et d'un chien qui a mal digéré malgré une transition de 10 jours. Deux avis ne font pas une statistique. Des selles molles au changement restent le reproche à anticiper : notre guide de la [transition alimentaire](/chien/alimentation-quotidienne/transition-alimentaire-chien) aide à ralentir le rythme.",
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
          "Les avis à une étoile qu'on a lus parlent surtout du service client et de la livraison : créneaux, transporteur, réponses jugées lentes. Quelques-uns évoquent des colis mal dosés et deux signalent un problème de qualité. Notre lecture porte sur les 7 avis affichés ce jour-là, à prendre comme une tendance et pas comme une statistique.",
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
