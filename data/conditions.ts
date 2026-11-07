// @cdc légal — conditions générales d'utilisation du site et de Milo (demande du propriétaire du 2026-11-07).
// Changer le texte d'une règle : changer CGU_VERSION, chaque compte réaccepte avant sa prochaine question à Milo.

export const CGU_VERSION = '2026-11-07'

export interface Article {
  id: string
  titre: string
  paragraphes: string[]
}

export const CONDITIONS: Article[] = [
  { id: 'objet', titre: 'Objet', paragraphes: [
    'Ces conditions encadrent l’utilisation du site toutou-gourmet.com : articles, outils, scanner, compte et Milo, l’assistant. Utiliser le site vaut acceptation de ces conditions. Pour poser une question à Milo, tu les acceptes en cochant la case prévue avant ton premier message.',
    'L’éditeur du site est présenté dans les mentions légales.',
  ] },
  { id: 'informations', titre: 'Des informations, pas un avis vétérinaire', paragraphes: [
    'Les articles, outils, notes et réponses du site donnent des informations générales sur l’alimentation du chien. Ils ne remplacent ni une consultation, ni un diagnostic, ni un traitement prescrit par un vétérinaire.',
    'Si ton chien est malade, sous traitement, gestant, très jeune, âgé, ou s’il a avalé un produit peut-être toxique, demande l’avis de ton vétérinaire. En cas d’urgence, appelle-le tout de suite ou contacte un centre antipoison vétérinaire.',
  ] },
  { id: 'compte', titre: 'Ton compte', paragraphes: [
    'Le compte est gratuit. Tu donnes une adresse e-mail valide et tu gardes ton mot de passe pour toi : ce qui se passe depuis ton compte est réputé fait par toi. Tu peux supprimer ton compte à tout moment depuis son espace.',
    'Un compte ouvert pour nuire au site, avec une fausse identité ou par un programme automatique peut être suspendu ou supprimé sans préavis.',
  ] },
  { id: 'milo', titre: 'Milo, l’assistant', paragraphes: [
    'Les réponses de Milo sont écrites automatiquement par une intelligence artificielle (Gemini, de Google), à partir de nos articles quand c’est possible. Elles peuvent être incomplètes, dépassées ou fausses. Vérifie toute information importante, et rien de ce que dit Milo ne remplace l’avis de ton vétérinaire.',
    'Milo ne pose pas de diagnostic et ne donne pas de dose de médicament ou de complément. Sur une maladie, un traitement, une gestation ou un signe d’urgence, il te renvoie vers ton vétérinaire.',
    'Le nombre de questions par jour est limité. Il est interdit d’interroger Milo par un programme automatique, de contourner ses limites, de lui faire produire des contenus illicites, ou de copier ses réponses en masse.',
    'N’écris pas d’information personnelle dans tes questions (nom, adresse, téléphone, santé d’une personne). Certaines conversations peuvent être gardées pour entraîner Milo et améliorer sa précision, dans les conditions de la politique de confidentialité.',
    'On peut modifier, limiter ou arrêter Milo à tout moment, notamment en cas d’abus.',
  ] },
  { id: 'notes', titre: 'Scanner et notes des produits', paragraphes: [
    'Les notes sur 100 sont calculées à partir de la composition et des analyses affichées par les fabricants et les vendeurs. Ces données peuvent contenir des erreurs ou changer sans que nous le sachions : l’emballage du produit fait foi. Une note décrit une composition, elle ne dit pas qu’un produit convient à ton chien.',
  ] },
  { id: 'partenaires', titre: 'Liens partenaires', paragraphes: [
    'Certains liens mènent vers des marchands partenaires (Maxi Zoo, Dog Chef, Franklin et d’autres). Si tu commandes, nous touchons une commission, sans surcoût pour toi. Le classement des produits ne dépend pas de ces commissions.',
    'Une commande passée chez un marchand se fait sous ses propres conditions de vente : prix, livraison, rétractation et service client relèvent de lui seul.',
  ] },
  { id: 'responsabilite', titre: 'Responsabilité', paragraphes: [
    'Nous faisons de notre mieux pour que le site soit exact et disponible, sans pouvoir le garantir. Dans les limites prévues par la loi, nous ne sommes pas responsables des décisions prises sur la seule base des informations du site ou des réponses de Milo, ni des interruptions du service.',
    'Rien dans ces conditions ne limite les droits que la loi te reconnaît comme consommateur.',
  ] },
  { id: 'propriete', titre: 'Propriété intellectuelle', paragraphes: [
    'Les textes, images, notes, outils et le personnage de Milo appartiennent à Toutou Gourmet. Tu peux les lire et les partager par un lien ; toute copie ou réutilisation, même partielle, demande notre accord écrit.',
  ] },
  { id: 'donnees', titre: 'Données personnelles', paragraphes: [
    'Les données de ton compte, de tes chiens et de tes conversations avec Milo sont traitées comme le décrit la politique de confidentialité.',
  ] },
  { id: 'changements', titre: 'Changements et droit applicable', paragraphes: [
    'Ces conditions peuvent changer. La date de la version en vigueur figure en haut de la page ; avant ta prochaine question à Milo, on te demande d’accepter la nouvelle version.',
    'Ces conditions relèvent du droit français. En cas de désaccord, écris-nous d’abord par le formulaire de contact : nous cherchons une solution amiable avant toute autre démarche.',
  ] },
]
