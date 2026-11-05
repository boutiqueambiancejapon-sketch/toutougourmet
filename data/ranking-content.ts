import type { SegmentSlug } from '@/lib/scanner/rankings'

// @cdc cluster scanner — texte des pages de classement (environ 800 mots, FAQ de 6 questions, demande du
// propriétaire du 2026-11-05). Un angle par page (guide SEO §6.1). Chiffres repris des articles sourcés du site.
// Lien dans un paragraphe : [ancre](/adresse). Les liens sont retirés du JSON-LD.

export interface RankingContent {
  sections: { h2: string; paragraphs: string[] }[]
  faqs: { q: string; a: string }[]
  sources: string[]
}

const FEDIAF = 'FEDIAF, Nutritional Guidelines (besoins en protéines, matières grasses, calcium et phosphore)'
const WSAVA_TREATS = 'WSAVA, Feeding treats to your dog, 2025 (repère de 10 % pour les friandises)'
const REG = "Règlement CE 767/2009 sur l'étiquetage des aliments pour animaux"

export const RANKING_CONTENT: Partial<Record<SegmentSlug, RankingContent>> = {
  tous: {
    sections: [
      {
        h2: 'Comment reconnaître de bonnes croquettes pour chien ?',
        paragraphs: [
          "De bonnes croquettes pour chien annoncent une viande ou un poisson nommé en premier ingrédient, assez de protéines une fois l'eau retirée et peu de glucides. Ces trois repères suffisent à départager la plupart des sacs en rayon, bien avant le prix ou le dessin sur le paquet.",
          "L'ordre de la liste compte, car le Règlement CE 767/2009 impose de classer les ingrédients par poids décroissant. « Poulet frais » en tête dit quelque chose de précis. « Viandes et sous-produits animaux » laisse le lecteur deviner l'espèce, et la note du scanner le fait payer à la recette.",
          "Pour le détail ligne par ligne, notre guide explique [comment lire une étiquette de croquettes](/chien/alimentation-quotidienne/comprendre-etiquette-croquettes-chien) en quelques minutes, y compris le calcul des glucides, qui ne figurent jamais sur le sac.",
        ],
      },
      {
        h2: 'Que mesure la note sur 100 de ce classement ?',
        paragraphs: [
          "La note sur 100 mesure la composition affichée, avec 11 critères : protéines, matières grasses et glucides sur matière sèche, premier ingrédient, part animale déclarée, ingrédients animaux sans espèce, céréales en tête de liste, sucres ajoutés, conservateurs controversés, colorants et rapport calcium/phosphore.",
          "La matière sèche désigne ce qui reste de l'aliment sans son eau. Ce calcul rend deux recettes comparables, même quand l'une contient 8 % d'humidité et l'autre 12 %. La FEDIAF, la fédération européenne des fabricants, fixe le minimum de protéines à 18 % sur matière sèche pour un chien adulte.",
          "Le barème récompense les recettes riches en viande, et un chien en bonne santé s'en porte bien. Un chien malade peut avoir d'autres besoins : un chien aux reins fragiles a souvent besoin de moins de phosphore et de protéines. Il passe donc par son vétérinaire, et nos [articles santé](/chien/sante) présentent les formules adaptées plutôt qu'un podium.",
        ],
      },
      {
        h2: 'Pourquoi une marque connue peut-elle être mal classée ?',
        paragraphs: [
          "Une marque connue peut être mal classée parce que la note ne regarde que l'étiquette. Une recette qui commence par une farine de blé perd les points du premier ingrédient et ceux des céréales, quelle que soit la notoriété du nom sur le sac.",
          "Une note moyenne ne veut pas dire qu'un aliment est mauvais pour ton chien. Certaines formules sont étudiées pour une race ou un besoin, et un chien peut très bien les digérer. La note répond à une seule question : que dit la composition, comparée aux autres ?",
          "Les marques partenaires passent par le même barème que les autres. Leur rang ne dépend pas de la commission touchée, et chaque lien commercial est signalé sous la liste.",
        ],
      },
      {
        h2: 'Comment choisir dans ce classement pour ton chien ?',
        paragraphs: [
          "Choisis d'abord la bonne liste, puis la recette la mieux notée que ton chien tolère et que ton budget tient dans la durée. Un chiot, un chien âgé et un chien stérilisé n'ont pas les mêmes besoins, et les boutons en haut de page ouvrent le classement de chaque profil.",
          "Regarde ensuite les matières grasses si ton chien prend du poids, et le premier ingrédient s'il réagit à une viande. Une recette à 100/100 n'aide pas un chien allergique au poulet si le poulet ouvre la liste.",
          "Le passage à de nouvelles croquettes se fait sur 7 à 10 jours : notre guide de la [transition alimentaire](/chien/alimentation-quotidienne/transition-alimentaire-chien) donne les proportions jour par jour. Ton paquet n'est pas dans la liste ? Le [scanner](/scanner) le note à partir de son code-barres ou d'une photo de l'étiquette.",
        ],
      },
    ],
    faqs: [
      { q: 'Quelles sont les meilleures croquettes pour chien ?', a: "Les mieux classées sont en tête de la liste ci-dessus, qui se met à jour au fil des étiquettes lues. La meilleure pour ton chien reste celle qui convient à son âge, à son gabarit et à sa digestion." },
      { q: 'Les croquettes les plus chères sont-elles les meilleures ?', a: "Pas forcément. Le prix ne figure pas dans la note, et une recette chère peut commencer par une céréale. Compare le premier ingrédient et les protéines sur matière sèche avant de regarder le prix au kilo." },
      { q: 'Les croquettes sans céréales sont-elles meilleures ?', a: "Le barème retire des points quand une céréale figure parmi les trois premiers ingrédients, sans interdire les céréales. Une liste dédiée existe dans notre guide des [croquettes sans céréales](/chien/alimentation-quotidienne/croquettes-sans-cereales-chien)." },
      { q: 'Ce classement couvre-t-il toutes les marques ?', a: "Non. Il couvre les produits dont on a lu la composition : le catalogue chien de Maxi Zoo et les sites officiels de nos marques partenaires. La liste grandit chaque semaine." },
      { q: 'Faut-il changer de croquettes si la note de mon chien est basse ?', a: "Pas dans l'urgence. Si ton chien va bien, tu peux comparer tranquillement et changer sur 7 à 10 jours. S'il suit un aliment prescrit par un vétérinaire, garde-le et parles-en avec lui." },
      { q: 'À quelle fréquence le classement change-t-il ?', a: "Il se recalcule à chaque nouvelle lecture d'étiquette. La date affichée en haut de page indique la dernière mise à jour." },
    ],
    sources: [FEDIAF, REG],
  },
  chiot: {
    sections: [
      {
        h2: 'Que doivent contenir de bonnes croquettes pour chiot ?',
        paragraphs: [
          "De bonnes croquettes pour chiot apportent plus de protéines qu'une recette adulte et un calcium maîtrisé. La FEDIAF demande au moins 25 % de protéines sur matière sèche pour un chiot de moins de 14 semaines, contre 18 % pour un chien adulte.",
          "Un chiot construit ses muscles et son squelette en quelques mois, et son estomac reste petit. La recette doit donc être dense et digeste : mieux vaut une viande nommée en tête de liste qu'un mélange de farines. La mention « aliment complet pour chiot » sur le sac confirme que la formule vise la croissance.",
        ],
      },
      {
        h2: 'Quelles croquettes pour un chiot de grande race ?',
        paragraphs: [
          "Un chiot dont le poids adulte dépassera 25 kg a besoin de croquettes modérées en calcium et en calories. Un excès de calcium abîme ses cartilages de croissance et peut laisser des lésions du squelette, et il n'a pas encore le frein qu'a un adulte pour limiter ce qu'il absorbe.",
          "Sur l'étiquette, vise 0,9 à 1,3 % de calcium sur matière sèche, un rapport calcium/phosphore de 1,2 à 1,5 pour 1 et 380 à 410 kcal pour 100 g. La note du scanner ne suffit pas pour ce profil : une recette très bien notée peut être trop riche pour un Labrador de quatre mois.",
          "Lis la page produit avant de commander, et garde notre guide des [croquettes pour chiot de grande race](/chien/alimentation-quotidienne/croquettes-chiot-grande-race) sous la main. N'ajoute jamais de calcium à des croquettes complètes. Si ton chiot boite ou s'appuie moins sur une patte, consulte sans attendre.",
        ],
      },
      {
        h2: 'Quelle taille de croquettes pour un chiot de petite race ?',
        paragraphs: [
          "Un chiot de petite race a besoin de petites croquettes riches en énergie, faciles à croquer. Un Chihuahua ou un Yorkshire brûle vite ses réserves et supporte mal les longues périodes sans manger, d'où l'intérêt de repas rapprochés.",
          "Les recettes « mini » ou « petite taille » de ce classement visent ce profil. Une croquette trop grosse se recrache ou s'avale sans être mâchée : notre guide sur la [taille des croquettes](/chien/alimentation-quotidienne/choisir-taille-croquettes-chien) aide à repérer les signes.",
        ],
      },
      {
        h2: 'Combien de repas et jusqu’à quel âge garder des croquettes chiot ?',
        paragraphs: [
          "Un chiot mange 3 à 4 repas par jour de 2 à 4 mois, 3 repas de 4 à 6 mois, puis 2 à 3 repas jusqu'à 12 mois. Le détail se trouve dans notre guide de l'[alimentation du chiot de 2 à 6 mois](/chien/alimentation-quotidienne/alimentation-chiot-2-6-mois). Le passage en croquettes adulte attend la fin de la croissance : 18 mois pour une grande race et 24 mois pour une race géante comme le Dogue allemand ou le Terre-Neuve.",
          "Changer de recette se fait sur 7 à 10 jours, en mélangeant 25 % du nouvel aliment les 2 premiers jours, 50 % les jours 3 et 4, puis 75 % les jours 5 et 6. En cas de selles molles, ralentis le rythme. Le [calculateur de ration](/outils/ration) donne une quantité de départ à ajuster selon son poids.",
        ],
      },
    ],
    faqs: [
      { q: 'Quelles sont les meilleures croquettes pour chiot ?', a: "Les mieux notées sont en tête de la liste ci-dessus. Pour un chiot de grande race, vérifie aussi le calcium et l'énergie sur la page produit, car la note ne suffit pas pour ce profil." },
      { q: 'Peut-on donner des croquettes adulte à un chiot ?', a: "Non, sauf si le sac indique un aliment complet pour tous les âges. Une recette adulte peut manquer de protéines et ne convient pas à la croissance d'un chiot." },
      { q: 'Faut-il donner des croquettes sans céréales à un chiot ?', a: "Ce n'est pas nécessaire : un chiot digère les céréales cuites. Regarde d'abord la viande nommée en tête de liste et le calcium, puis sa tolérance." },
      { q: 'Quand passer aux croquettes adulte ?', a: "Vers 12 mois pour un petit ou moyen gabarit, 18 mois pour une grande race et 24 mois pour une race géante. Ton vétérinaire peut ajuster ce repère selon sa croissance." },
      { q: 'Faut-il mouiller les croquettes d’un chiot ?', a: "Un peu d'eau tiède aide au sevrage et après un changement de dents difficile. Sers la gamelle rapidement et retire le reste, car une croquette humide se conserve mal." },
      { q: 'Mon chiot a la diarrhée après un changement de croquettes, que faire ?', a: "Reviens à la proportion précédente et ralentis la transition. Un chiot abattu, qui vomit ou dont la diarrhée dure plus d'une journée doit voir un vétérinaire, car il se déshydrate vite." },
    ],
    sources: [FEDIAF, 'Hazewinkel et al., 1985, J Am Anim Hosp Assoc 21:377-391 (calcium et croissance du chiot de grande race)'],
  },
  adulte: {
    sections: [
      {
        h2: 'Quelles croquettes choisir pour un chien adulte en bonne santé ?',
        paragraphs: [
          "Pour un chien adulte en bonne santé, choisis une recette complète avec une viande nommée en tête de liste, au moins 18 % de protéines sur matière sèche et des glucides modérés. Ce classement trie les recettes sur ces repères, et le poids de ton chien décide ensuite de la quantité.",
          "Un adulte n'a plus de squelette à construire. Il a besoin d'entretenir ses muscles sans stocker, ce qui rend la lecture des matières grasses plus utile qu'à tout autre âge. La FEDIAF fixe un minimum de 5,5 % de matières grasses sur matière sèche. Au-delà de 22 %, l'aliment devient très énergétique et la ration doit baisser.",
        ],
      },
      {
        h2: 'Quel taux de protéines pour un chien adulte ?',
        paragraphs: [
          "Un chien adulte reçoit au minimum 18 % de protéines sur matière sèche selon la FEDIAF, et la plupart des recettes de ce classement dépassent nettement ce seuil. Un taux élevé n'a pas d'intérêt en soi si la source est mal nommée : la provenance compte autant que le chiffre.",
          "Pour comparer deux sacs, retire d'abord l'eau. Une recette à 26 % de protéines et 8 % d'humidité monte à environ 28 % sur matière sèche. Le scanner fait ce calcul, et notre article sur les [additifs des croquettes](/chien/sante/additifs-croquettes-chien-conservateurs-colorants) aide à lire le bas de la liste.",
        ],
      },
      {
        h2: 'Quelle différence entre une recette adulte et une recette toutes tailles ?',
        paragraphs: [
          "Une recette adulte par taille adapte surtout la croquette et l'énergie, alors qu'une recette toutes tailles garde le même grain pour tous. Pour un chien de gabarit courant, la seconde suffit le plus souvent, à condition qu'il mâche sans peine.",
          "Les extrêmes gagnent à une recette dédiée. Un Yorkshire croque mieux un petit grain, et un chien de grande taille mange souvent trop vite un grain minuscule. Les classements [chien moyen](/meilleures-croquettes/chien-moyen), [grand chien](/meilleures-croquettes/grand-chien) et [petit chien](/chien/avis-marques/meilleures-croquettes-petit-chien) séparent ces profils.",
        ],
      },
      {
        h2: 'Combien de croquettes donner à un chien adulte ?',
        paragraphs: [
          "La bonne quantité dépend du poids, de l'activité et de la densité énergétique de la recette, et les tableaux au dos du sac servent de point de départ. Le [calculateur de ration](/outils/ration) donne une quantité en grammes selon ton chien, à ajuster après quelques semaines.",
          "Deux repas par jour conviennent à la plupart des adultes. Une balance de cuisine évite l'erreur la plus courante, le gobelet rempli à l'œil. Un chien stérilisé brûle moins : notre guide des [croquettes pour chien stérilisé](/chien/alimentation-quotidienne/croquettes-chien-sterilise) explique comment adapter la gamelle.",
          "Si ton chien prend du poids, regarde les matières grasses de la recette et les friandises du jour avant de baisser la ration au hasard. Notre article sur les [croquettes pour chien en surpoids](/chien/sante/croquettes-chien-surpoids) classe les recettes de la moins grasse à la plus grasse.",
        ],
      },
    ],
    faqs: [
      { q: 'Quelles sont les meilleures croquettes pour chien adulte ?', a: "Les mieux notées sont en tête de la liste ci-dessus. Choisis parmi elles selon le gabarit de ton chien, sa tolérance aux viandes et ton budget." },
      { q: 'À partir de quel âge un chien est-il adulte ?', a: "Vers 12 mois pour un petit ou moyen gabarit, 18 mois pour une grande race et 24 mois pour une race géante. Il passe à une recette senior plus tard, selon sa race et son état." },
      { q: 'Faut-il varier les croquettes d’un chien adulte ?', a: "Ce n'est pas obligatoire si la recette est complète et bien tolérée. Si tu veux changer, passe sur 7 à 10 jours pour éviter les troubles digestifs." },
      { q: 'Un taux de protéines élevé est-il dangereux pour un chien adulte ?', a: "Pour un chien adulte en bonne santé, un taux élevé ne pose pas de problème reconnu. Un chien atteint d'une maladie des reins suit d'autres règles, fixées par son vétérinaire." },
      { q: 'Croquettes ou pâtée pour un chien adulte ?', a: "Les deux conviennent si l'aliment est complet. La pâtée apporte de l'eau, les croquettes coûtent moins cher au repas : notre comparatif [croquettes ou pâtée](/chien/alimentation-quotidienne/croquettes-ou-patee) détaille le choix." },
      { q: 'Combien de temps garder un sac de croquettes ouvert ?', a: "Garde le sac fermé, dans son emballage et au frais. Choisis une taille que ton chien finit en quelques semaines, car les graisses s'oxydent une fois le sac ouvert." },
    ],
    sources: [FEDIAF, REG],
  },
  'chien-moyen': {
    sections: [
      {
        h2: 'Quelles croquettes pour un chien de taille moyenne ?',
        paragraphs: [
          "Un chien de taille moyenne, de 10 à 25 kg environ, mange la plupart des recettes du marché sans difficulté. Choisis donc d'abord sur la composition : une viande nommée en tête de liste, un taux de protéines correct sur matière sèche et une énergie adaptée à son activité.",
          "Beagle, Cocker, Border Collie, Épagneul ou Bouledogue français tombent dans ce gabarit, et leurs modes de vie n'ont rien à voir. Un Border Collie qui court chaque jour et un Beagle de canapé n'ont pas besoin de la même gamelle, même à poids égal.",
        ],
      },
      {
        h2: 'Une recette « medium » change-t-elle vraiment quelque chose ?',
        paragraphs: [
          "Une recette « medium » adapte surtout le diamètre de la croquette et l'énergie au gabarit moyen. Sa composition mérite la même lecture que les autres : un nom de gamme ne remplace pas une viande en tête de liste, et deux recettes medium d'une même marque peuvent afficher des notes différentes.",
          "Une recette toutes tailles convient aussi à beaucoup de chiens moyens. Notre guide sur la [taille des croquettes](/chien/alimentation-quotidienne/choisir-taille-croquettes-chien) montre à quoi reconnaître un grain adapté : le chien croque, ne recrache pas et ne tousse pas après le repas.",
        ],
      },
      {
        h2: 'Comment adapter les croquettes à l’activité de ton chien ?',
        paragraphs: [
          "Un chien moyen très actif peut recevoir une recette plus riche, alors qu'un chien calme ou stérilisé grossit vite avec la même gamelle. Le chiffre à regarder est le taux de matières grasses, qui pèse lourd dans les calories.",
          "Beagle et Labrador sont réputés gourmands, et le Beagle fait partie des races qui prennent facilement du poids. Pèse les rations, compte les friandises et contrôle sa silhouette tous les mois : tu dois sentir ses côtes sans appuyer. Notre outil [poids idéal](/outils/poids) sert de repère.",
          "Un Bouledogue français avale facilement de l'air à cause de son museau court, et il profite de repas fractionnés. Pour tout chien qui engloutit sa ration, une [gamelle anti-glouton](/chien/alimentation-quotidienne/meilleure-gamelle-anti-glouton-chien) aide à ralentir.",
        ],
      },
      {
        h2: 'Quelle quantité de croquettes pour un chien de 10 à 25 kg ?',
        paragraphs: [
          "La quantité dépend de la recette autant que du poids : deux croquettes à 350 et 410 kcal pour 100 g ne se donnent pas en même quantité. Le [calculateur de ration](/outils/ration) tient compte du poids, de l'âge et de l'activité. Partage la ration en deux repas, puis ajuste-la selon l'évolution de sa silhouette.",
          "Le chiot de ce gabarit garde ses croquettes de croissance jusqu'à 12 mois environ, et le [classement chiot](/meilleures-croquettes/chiot) sépare ces recettes. À l'autre bout, notre comparatif des [croquettes pour chien senior](/chien/avis-marques/meilleures-croquettes-chien-senior) aide au moment du changement.",
        ],
      },
    ],
    faqs: [
      { q: 'Quelles sont les meilleures croquettes pour chien moyen ?', a: "Les mieux notées sont en tête de la liste ci-dessus, chiot, adulte et âgé confondus. Vérifie que la recette choisie correspond bien à l'âge de ton chien." },
      { q: 'À partir de quel poids un chien est-il de taille moyenne ?', a: "Les fabricants placent le plus souvent ce gabarit entre 10 et 25 kg. Les seuils varient d'une marque à l'autre : lis la plage de poids indiquée sur le sac." },
      { q: 'Un Beagle a-t-il besoin de croquettes spéciales ?', a: "Pas forcément, mais sa gourmandise impose de surveiller les rations. Une recette modérée en matières grasses et une balance de cuisine font souvent plus qu'une gamme dédiée à la race." },
      { q: 'Puis-je donner des croquettes grande race à un chien moyen ?', a: "Oui si le grain lui convient et que la recette est complète, mais la ration change avec l'énergie affichée. Un chiot moyen reste, lui, sur des croquettes de croissance adaptées à son gabarit." },
      { q: 'Combien de repas par jour pour un chien moyen ?', a: "Deux repas par jour conviennent à la plupart des adultes. Un chien qui mange vite ou un Bouledogue français profite de portions plus petites." },
      { q: 'Quand passer aux croquettes senior ?', a: "L'âge senior dépend du gabarit : dès 5 ans pour un géant et vers 10 ans pour un petit chien, le chien moyen se situant entre les deux. Un chien en pleine santé qui garde son poids n'a pas à changer dès son anniversaire." },
    ],
    sources: [FEDIAF, 'Fiches nutrition par race de Toutou Gourmet (gabarits et prédispositions)'],
  },
  'grand-chien': {
    sections: [
      {
        h2: 'Quelles croquettes choisir pour un grand chien ?',
        paragraphs: [
          "Pour un grand chien, choisis une recette à viande nommée, avec une croquette assez grosse pour être mâchée et une énergie adaptée à son activité. Labrador, Golden Retriever, Berger allemand, Boxer ou Rottweiler mangent de grandes quantités : la moindre différence de composition se multiplie à chaque repas.",
          "Une recette plus dense en énergie réduit le volume de la gamelle, un vrai repère pour un chien de 40 kg. Compare toujours les calories pour 100 g sur la page produit, car deux sacs au même prix peuvent nourrir très différemment.",
        ],
      },
      {
        h2: 'Comment limiter le risque de torsion d’estomac ?',
        paragraphs: [
          "La torsion d'estomac est une urgence vitale chez les grandes races à poitrine profonde, comme le Dogue allemand, le Berger allemand ou le Setter. Fractionne la ration en deux repas ou plus, évite de nourrir juste avant ou après un effort et garde la gamelle au sol.",
          "La gamelle surélevée, longtemps conseillée, augmente le risque selon une étude américaine, avec un risque relatif d'environ 2,1. Notre guide sur la [torsion d'estomac](/chien/sante/torsion-estomac-chien-prevention-alimentation) détaille la prévention. Un ventre gonflé, des efforts pour vomir sans résultat ou une agitation soudaine imposent d'appeler un vétérinaire tout de suite.",
        ],
      },
      {
        h2: 'Les croquettes pour articulations aident-elles un grand chien ?',
        paragraphs: [
          "Le levier le plus sûr pour les articulations d'un grand chien reste un poids de forme, car chaque kilo en trop charge les hanches et les coudes. La glucosamine et la chondroïtine figurent dans beaucoup de recettes, et les preuves de leur effet restent limitées : notre article sur la [glucosamine et la chondroïtine](/chien/alimentation-quotidienne/glucosamine-chondroitine-chien-articulations) fait le point.",
          "Un Labrador ou un Berger allemand qui boite ou peine à se lever a besoin d'un examen, pas seulement d'un changement de sac. Notre guide des [croquettes pour chien avec arthrose](/chien/sante/croquettes-chien-arthrose) présente un classement dédié, à discuter avec ton vétérinaire.",
        ],
      },
      {
        h2: 'Quelle ration pour un chien de 30 ou 40 kg ?',
        paragraphs: [
          "La ration d'un grand chien dépend de son poids, de son âge, de son activité et de la recette. Le [calculateur de ration](/outils/ration) donne une quantité en grammes, et notre guide du [chien de grande race adulte](/chien/alimentation-quotidienne/alimentation-chien-grande-race-adulte-guide) explique les besoins caloriques par poids.",
          "Un chiot de grande race suit d'autres règles : calcium modéré et croquettes de croissance jusqu'à 18 mois au moins, et 24 mois pour une race géante. Ce classement mélange plusieurs âges, alors lis bien le nom de la recette, et préfère le [classement chiot](/meilleures-croquettes/chiot) pour un jeune chien.",
          "Un grand chien vieillit plus tôt qu'un petit, et la question d'une recette senior se pose plus tôt, dès 5 ans pour une race géante. Notre comparatif des [croquettes pour chien senior](/chien/avis-marques/meilleures-croquettes-chien-senior) présente les chiffres à regarder.",
        ],
      },
    ],
    faqs: [
      { q: 'Quelles sont les meilleures croquettes pour grand chien ?', a: "Les mieux notées sont en tête de la liste ci-dessus, tous âges confondus. Vérifie que la recette choisie correspond à l'âge de ton chien, surtout s'il grandit encore." },
      { q: 'À partir de quel poids parle-t-on de grand chien ?', a: "Les fabricants placent ce gabarit autour de 25 kg et plus, et les races géantes au-delà de 40 ou 45 kg. La plage exacte figure sur chaque sac." },
      { q: 'Quelles croquettes pour un Labrador ?', a: "Une recette modérée en matières grasses convient bien, car le Labrador prend vite du poids. Pèse la ration et compte les friandises, comme l'explique notre fiche [nourriture du Labrador](/chien/race/nourriture-labrador-retriever)." },
      { q: 'Faut-il une gamelle surélevée pour un grand chien ?', a: "Non. Une étude américaine l'associe à un risque plus élevé de torsion d'estomac chez les grandes races. Garde la gamelle au sol et fractionne les repas." },
      { q: 'Combien de repas par jour pour un grand chien ?', a: "Au moins deux repas par jour, pour limiter le volume de chaque prise. Les races à poitrine profonde profitent d'une répartition encore plus fine sur conseil du vétérinaire." },
      { q: 'Un grand chien doit-il manger des croquettes plus grosses ?', a: "Une croquette assez grosse pousse le chien à mâcher et ralentit souvent le repas. Un grain trop petit peut être avalé sans être croqué, ce qui n'aide ni la digestion ni la ration." },
    ],
    sources: [FEDIAF, 'Glickman et al., 2000, JAVMA (gamelle surélevée et torsion d’estomac)'],
  },
  friandises: {
    sections: [
      {
        h2: 'Comment reconnaître une bonne friandise pour chien ?',
        paragraphs: [
          "Une bonne friandise pour chien commence par une viande ou un poisson nommé, ajoute peu de sucre et de sel, et garde une liste courte. Elle n'a pas à couvrir les besoins du chien : la gamelle s'en charge. Son rôle tient en une récompense plaisante, au bon moment.",
          "Les friandises ont donc leur propre barème, différent de celui des croquettes, et on ne compare jamais les deux notes. Un stick très bien noté ici ne remplace pas un repas, et une croquette n'a pas à être jugée sur sa longueur de liste.",
        ],
      },
      {
        h2: 'Combien de friandises donner à un chien par jour ?',
        paragraphs: [
          "Les friandises ne doivent pas dépasser 10 % de l'apport calorique du jour, un repère courant des vétérinaires. Un chien de 15 kg qui a besoin de 800 kcal par jour peut donc recevoir 80 kcal de friandises au maximum, et sa ration se réduit d'autant s'il en reçoit souvent.",
          "Ce plafond passe vite pour un petit chien. Un Yorkshire de 3 kg brûle très peu, et quelques biscuits peuvent peser lourd dans sa journée. Coupe les friandises en petits morceaux : le chien retient le geste bien plus que la taille de la récompense.",
          "Notre [guide des friandises naturelles](/chien/alimentation-quotidienne/friandises-naturelles-chien-guide) donne des équivalents concrets, comme des sprats séchés ou un bâton de carotte, et notre outil de [ration](/outils/ration) aide à garder l'équilibre.",
        ],
      },
      {
        h2: 'Quelles friandises choisir pour le dressage ou les dents ?',
        paragraphs: [
          "Pour le dressage, choisis une friandise très petite et très odorante, que le chien avale en une seconde. Une viande séchée coupée en dés fonctionne bien, et ces séances peuvent en consommer beaucoup : retire ces calories de la gamelle. Notre [recette de friandises d'éducation](/chien/alimentation-quotidienne/recette-friandises-education-chien) revient moins cher.",
          "Les sticks dentaires occupent le chien et frottent la dent pendant qu'il mâche. Ils ne remplacent pas le brossage ni le contrôle du vétérinaire, et leur composition mérite d'être lue comme les autres. Surveille ton chien pendant qu'il mâche, et retire le dernier morceau s'il risque de l'avaler entier.",
        ],
      },
      {
        h2: 'Quelles friandises sont dangereuses pour un chien ?',
        paragraphs: [
          "Les os cuits, le chocolat, le raisin et le xylitol sont dangereux pour un chien, même en petite quantité. Les os cuits se brisent en échardes coupantes, le chocolat contient de la théobromine, le raisin peut abîmer les reins et le xylitol, un édulcorant, provoque une chute brutale de la glycémie.",
          "Si ton chien en a mangé, note l'heure et la quantité, puis appelle ton vétérinaire ou un centre antipoison sans attendre les symptômes. Notre rubrique [aliments dangereux](/chien/urgences) donne la conduite à tenir pour chaque cas. Un chien allergique demande aussi d'éviter toute viande qui lui pose problème, jusque dans les friandises.",
        ],
      },
    ],
    faqs: [
      { q: 'Quelles sont les meilleures friandises pour chien ?', a: "Les mieux notées sont en tête de la liste ci-dessus, avec une viande nommée et une liste courte. Choisis ensuite selon la taille de ton chien, ses dents et ses allergies." },
      { q: 'Les friandises sont-elles mauvaises pour un chien ?', a: "Non, si elles restent sous 10 % de ses calories du jour et si la composition est propre. Le risque le plus courant reste la prise de poids quand elles s'ajoutent à une ration complète." },
      { q: 'Peut-on donner des friandises à un chiot ?', a: "Oui, en petite quantité et avec des morceaux adaptés à sa bouche. Vérifie l'âge minimum indiqué sur le paquet, et évite tout ce qui est dur tant qu'il fait ses dents." },
      { q: 'Quelle friandise pour un chien en surpoids ?', a: "Une friandise à une seule protéine, coupée très petit, ou un légume autorisé comme la carotte. Retire ces calories de la ration, et demande conseil au vétérinaire si le chien suit un régime." },
      { q: 'Comment noter une friandise qui n’est pas dans la liste ?', a: "Le [scanner](/scanner) lit le code-barres ou une photo de l'étiquette et applique le barème des friandises. Le résultat indique aussi une quantité par jour quand les données le permettent." },
      { q: 'Faut-il préférer les friandises maison ?', a: "Une friandise maison te laisse choisir chaque ingrédient, et plusieurs de nos recettes tiennent en quelques minutes. Elle se conserve moins longtemps : garde-la au frais et compte ses calories comme les autres." },
    ],
    sources: [WSAVA_TREATS],
  },
}
