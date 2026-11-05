import type { RankingContent } from './ranking-content'

// @cdc seo — texte des pages mères des partenaires, à partir des requêtes de la Search Console (export du
// 2026-11-04) et de sources datées. Les chiffres viennent des fiches du scanner et des pages citées.

export const BRAND_HUB: Record<string, Pick<RankingContent, 'sections'>> = {
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
