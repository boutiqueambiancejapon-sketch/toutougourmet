// @cdc e-mails — conseil de saison de la lettre mensuelle : un guide existant par mois, et deux
// phrases reprises de son TL;DR (aucun chiffre ajouté). Clé : mois de l'envoi (1 = janvier).

export interface SeasonalTip {
  slug: string
  text: string
}

export const SEASONAL_TIPS: Record<number, SeasonalTip> = {
  1: {
    slug: 'alimentation-chien-hiver-froid-guide',
    text: "Un chien qui vit dehors l'hiver a besoin de 10 à 50 % de calories en plus selon le froid et son activité, alors qu'un chien d'intérieur garde sa ration habituelle. Par temps froid, il boit aussi moins de lui-même : vérifie que sa gamelle d'eau se vide.",
  },
  2: {
    slug: 'chien-peut-manger-clementine-orange',
    text: "La pulpe de clémentine ou d'orange n'est pas toxique : un ou deux quartiers pelés, quelques fois par semaine, conviennent à la plupart des chiens adultes. Retire toujours la peau et les pépins, et garde le jus pour toi.",
  },
  3: {
    slug: 'chien-mange-chocolat-urgence',
    text: "Avant Pâques, range les œufs en chocolat hors de sa portée : deux carrés de chocolat noir à 70 % suffisent à rendre malade un chien de 5 kg. S'il en avale, appelle ton vétérinaire dans les deux heures, tant qu'il peut encore le faire vomir.",
  },
  4: {
    slug: 'chien-peut-manger-asperges',
    text: "Ton chien peut goûter aux asperges de saison, de préférence cuites et coupées en petits morceaux, car un gros tronçon fibreux peut se coincer. L'asperge décorative des plantes d'intérieur, elle, est toxique.",
  },
  5: {
    slug: 'chien-peut-manger-fraises',
    text: "Une demi-fraise à quatre fraises équeutées selon son gabarit, deux à quatre fois par semaine, font une friandise à 4 kcal la fraise. Confiture, glace et yaourt à la fraise restent interdits, à cause du sucre et parfois du xylitol.",
  },
  6: {
    slug: 'alimentation-chien-ete-canicule-guide',
    text: "Par forte chaleur, un chien peut boire jusqu'à deux fois plus qu'à l'ordinaire, et la pâtée ou des croquettes humidifiées l'aident à s'hydrater. Sers ses repas tôt le matin ou après 19 h, en deux ou trois portions.",
  },
  7: {
    slug: 'chien-barbecue-securite-aliments-eviter',
    text: "Au barbecue, garde les os cuits loin de ton chien : la cuisson les rend cassants et leurs éclats peuvent perforer son tube digestif. Les restes marinés à l'ail ou à l'oignon n'ont pas leur place dans sa gamelle non plus.",
  },
  8: {
    slug: 'chien-peut-manger-pasteque',
    text: "Sans pépins ni écorce, la chair de pastèque rafraîchit ton chien avec 91 % d'eau et 39 kcal pour 100 g. Compte un ou deux dés de 2 cm pour un chien de moins de 10 kg, deux à trois fois par semaine au plus.",
  },
  9: {
    slug: 'chien-mange-raisin-urgence',
    text: "Pendant les vendanges, ramasse les grappes tombées : raisin frais, sec ou cuit, tout est toxique pour le chien, et certains font une insuffisance rénale après une poignée. Appelle ton vétérinaire même pour une petite quantité, dans les deux heures si possible.",
  },
  10: {
    slug: 'chien-peut-manger-champignons',
    text: "En forêt, empêche ton chien de croquer les champignons sauvages : l'amanite phalloïde tue par insuffisance du foie, et les premiers signes n'apparaissent qu'après 6 à 24 heures. Les champignons du commerce, cuits et nature, lui conviennent.",
  },
  11: {
    slug: 'chataignes-marrons-inde-chien-difference-danger',
    text: "Une châtaigne cuite, nature et épluchée peut finir dans sa gamelle en petite quantité. Le marron d'Inde, qui tombe au même endroit dans une bogue presque identique, est toxique : en balade, regarde ce que ton chien ramasse sous les feuilles.",
  },
  12: {
    slug: 'repas-noel-chien-aliments-autorises-dangereux',
    text: "Au repas de Noël, le chocolat, les raisins secs et la farce à l'oignon intoxiquent le chien. La peau de dinde, le foie gras et les sauces peuvent, eux, déclencher une pancréatite.",
  },
}
