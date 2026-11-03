import type { FaqEntry } from '@/components/outils/ToolPage'
import { YUKA_CHECKED_LABEL, YUKA_PUBLISHER } from './yuka-facts'

// @cdc seo-geo §4 — FAQ de /scanner/alternative-yuka-animaux, partagée entre l'affichage et le
// JSON-LD FAQPage. Six questions au plus (demande du propriétaire). Faits Yuka : yuka-facts.ts.

export function yukaFaq(freeScans: number, premiumScans: number): FaqEntry[] {
  return [
    {
      question: 'Existe-t-il un Yuka pour les animaux ?',
      answer: `Non. Yuka analyse les produits alimentaires et les cosmétiques, et son centre d'aide indique qu'il n'analyse pas les aliments pour animaux (vérifié le ${YUKA_CHECKED_LABEL}). Pour les croquettes, les pâtées et les friandises pour chien, le scanner de Toutou Gourmet donne une note sur 100 à partir du code-barres ou d'une photo de l'étiquette.`,
    },
    {
      question: 'Peut-on scanner des croquettes avec Yuka ?',
      answer:
        "Le centre d'aide de Yuka répond que l'application n'analyse pas les aliments pour animaux et ne prévoit pas de le faire pour l'instant. Il l'explique par des ingrédients et des besoins nutritionnels différents de ceux de l'alimentation humaine.",
    },
    {
      question: 'Le scanner de croquettes Toutou Gourmet est-il gratuit ?',
      answer: `Oui. Un produit déjà connu, retrouvé par son code-barres, s'affiche sans compte. L'analyse d'une étiquette par photo demande un compte gratuit : ${freeScans} analyses par mois, ${premiumScans} avec Premium, gratuit pendant le lancement et sans carte bancaire.`,
    },
    {
      question: 'Faut-il installer une application pour scanner des croquettes ?',
      answer:
        "Non. Le scanner tourne dans le navigateur du téléphone, sur iPhone comme sur Android, et sur ordinateur. Si la caméra ne lit pas le code-barres, on peut taper ses chiffres.",
    },
    {
      question: 'Le scanner note-t-il les friandises et les aliments pour chat ?',
      answer:
        "Les friandises pour chien, oui : biscuits, snacks, os à mâcher et autres aliments complémentaires ont leur propre barème sur 100, qui juge la recette (viande, sucres, sel, additifs) et donne un nombre de friandises par jour quand les calories sont écrites. Les aliments pour chat, non : un chat a d'autres besoins (25 g de protéines pour 100 g de matière sèche au minimum chez le chat adulte selon la FEDIAF, contre 18 g chez le chien). Une photo d'aliment pour chat est refusée sans être décomptée.",
    },
    {
      question: 'Toutou Gourmet a-t-il un partenariat avec Yuka ?',
      answer: `Non. Toutou Gourmet n'a aucun lien avec Yuka : ni partenariat, ni affiliation. Yuka est une marque de ${YUKA_PUBLISHER}. Il est cité sur cette page pour comparer, à partir de ses propres pages.`,
    },
  ]
}
