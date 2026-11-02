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
      question: 'Le scanner note-t-il aussi les pâtées pour chien ?',
      answer:
        "Oui, si l'étiquette donne l'humidité, obligatoire au-delà de 14 % (règlement CE 767/2009). Protéines et glucides sont ramenés sur matière sèche : une pâtée à 80 % d'eau se compare alors à une croquette. Les aliments pour chat et les friandises ne sont pas notés.",
    },
    {
      question: 'Mes photos et l\'image de la caméra sont-elles enregistrées ?',
      answer:
        "Non. L'image de la caméra sert à lire le code-barres dans ton navigateur : rien n'est envoyé. Les photos d'étiquette sont lues en mémoire le temps de l'analyse, via l'API Gemini de Google, puis oubliées. On garde seulement le texte lu et la note, rattachés à ton compte.",
    },
    {
      question: 'Une photo floue ou ratée me coûte-t-elle une analyse ?',
      answer:
        "Non. Une photo floue, une image qui n'est pas une étiquette, un aliment pour chat ou une friandise ne sont pas décomptés. S'il manque une partie (la composition ou les constituants), on garde la session ouverte : la photo manquante ne compte pas une deuxième fois.",
    },
    {
      question: "L'IA peut-elle se tromper en lisant l'étiquette ?",
      answer:
        "Oui : un chiffre mal lu sur un sac plié, une virgule invisible. Les chiffres douteux sont marqués « à vérifier » et tu peux les corriger : la note se recalcule tout de suite. La correction part ensuite à la rédaction, qui vérifie avant de modifier la fiche.",
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
