import type { FaqEntry } from '@/components/outils/ToolPage'

// @cdc lot 6 — FAQ de /scanner, partagée entre l'affichage et le JSON-LD FAQPage.

export function scannerFaq(monthlyLimit: number): FaqEntry[] {
  return [
    {
      question: 'Faut-il un compte pour utiliser le scanner ?',
      answer: `Non pour le code-barres : un produit déjà analysé, ou présent avec sa composition sur Open Pet Food Facts, s'affiche sans compte. Oui pour l'analyse par photos, qui fait appel à une IA payante : ${monthlyLimit} analyses gratuites par mois avec un compte. Le compteur repart à zéro le 1er de chaque mois.`,
    },
    {
      question: 'Faut-il installer une application pour scanner des croquettes ?',
      answer:
        "Non. Le scanner tourne dans le navigateur du téléphone ou de l'ordinateur, sur iPhone comme sur Android. Si la caméra est refusée ou ne lit pas le code, tu peux taper les chiffres du code-barres ou envoyer une photo prise avant.",
    },
    {
      question: 'Comment savoir si des croquettes pour chien sont de bonne qualité ?',
      answer:
        "Regarde d'abord le premier ingrédient : une viande ou un poisson d'espèce nommée, plutôt que « viandes et sous-produits animaux ». Vérifie ensuite les protéines sur matière sèche (18 % au minimum selon la FEDIAF, plus de 30 % pour une bonne note) et les glucides estimés, de préférence sous 40 %. Le scanner fait ces calculs à partir de l'étiquette et signale les additifs controversés comme le BHA ou l'éthoxyquine.",
    },
    {
      question: 'Le scanner note-t-il aussi les pâtées pour chien ?',
      answer:
        "Oui, si l'étiquette donne l'humidité, obligatoire au-delà de 14 % (règlement CE 767/2009). Protéines et glucides sont ramenés sur matière sèche : une pâtée à 80 % d'eau se compare alors à une croquette. Les aliments pour chat ne sont pas notés.",
    },
    {
      question: 'Le scanner note-t-il les friandises pour chien ?',
      answer:
        "Oui, avec un barème à part sur 100 points, publié dans la méthode : viande ou poisson nommé en premier, part de viande déclarée, ni sucre ni sel ajoutés, pas de colorant, de conservateur sans nom ni d'arôme artificiel, liste courte, ni glycérine ni farine en tête. Si l'étiquette donne les calories, le résultat indique combien en donner par jour selon le gabarit, sans dépasser 10 % de l'apport calorique (repère courant des vétérinaires). Xylitol, raisin, chocolat, oignon ou ail, peau de buffle et os cuits déclenchent une alerte.",
    },
    {
      question: 'La note convient-elle à un chiot ou à un chien malade ?',
      answer:
        "La note juge la composition pour un chien adulte en bonne santé. Un chiot a d'autres besoins : la FEDIAF demande par exemple 25 g de protéines pour 100 g de matière sèche avant 14 semaines. Pour un chien atteint d'une maladie rénale, digestive ou d'un diabète, le choix de l'aliment se fait avec le vétérinaire.",
    },
    {
      question: 'Où voir les croquettes et les friandises les mieux notées ?',
      answer:
        "Le classement des croquettes et pâtées trie par note sur 100 tous les produits qui ont une fiche publiée, avec une page par marque. Les friandises ont leur propre classement, calculé avec leur barème. Une marque absente n'a pas encore de fiche : scanne son code-barres pour l'ajouter.",
    },
    {
      question: 'Mes photos et l\'image de la caméra sont-elles enregistrées ?',
      answer:
        "Non. L'image de la caméra sert à lire le code-barres dans ton navigateur : rien n'est envoyé. Les photos d'étiquette sont lues en mémoire le temps de l'analyse, via l'API Gemini de Google, puis oubliées. On garde seulement le texte lu et la note, rattachés à ton compte.",
    },
    {
      question: 'Une photo floue ou ratée me coûte-t-elle une analyse ?',
      answer:
        "Non. Une photo floue, une image qui n'est pas une étiquette ou un aliment pour chat ne sont pas décomptés. S'il manque une partie (la composition ou les constituants), on garde la session ouverte : la photo manquante ne compte pas une deuxième fois.",
    },
    {
      question: "L'IA peut-elle se tromper en lisant l'étiquette ?",
      answer:
        "Oui : un chiffre mal lu sur un sac plié, une virgule invisible. Les chiffres douteux sont marqués « à vérifier » et tu peux les corriger : la note se recalcule tout de suite. La correction part ensuite à la rédaction, qui vérifie avant de modifier la fiche.",
    },
    {
      question: 'Que vaut une note calculée avec Open Pet Food Facts ?',
      answer:
        "La même chose qu'avec tes photos : notre barème s'applique aux ingrédients et constituants de la fiche. Ces données sont saisies par des contributeurs bénévoles et peuvent dater d'une ancienne recette : compare avec ton sac, et corrige un chiffre s'il diffère.",
    },
    {
      question: 'Les marques paient-elles pour leur note ?',
      answer: 'Non. Le barème est le même pour tous les produits et il est publié sur cette page, dans la méthode.',
    },
  ]
}
