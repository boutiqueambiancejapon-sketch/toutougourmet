import { GUIDE_PDF_PATH, GUIDE_TITLE } from '@/lib/guide/config'
import { button, paragraph, renderEmail, siteUrl, type RenderedEmail } from './layout'

// @cdc e-mails — e-mail du guide, envoyé juste après l'inscription au guide (texte de la maquette
// validée). Lien direct vers le PDF. Une fois par adresse : lib/server/guide-email.ts.

export const GUIDE_SUBJECT = 'Ton guide de la gamelle est arrivé'

export interface GuideEmailInput {
  foodCount: number
  recipeCount: number
  /** Lien de désinscription signé ; absent sans NEWSLETTER_SECRET (pied réduit). */
  unsubscribeUrl?: string
}

export function guideEmail({ foodCount, recipeCount, unsubscribeUrl }: GuideEmailInput): RenderedEmail {
  return renderEmail({
    subject: GUIDE_SUBJECT,
    preheader: `${GUIDE_TITLE} : ${foodCount} aliments classés, les numéros antipoison et ${recipeCount} recettes.`,
    blocks: [
      paragraph('Salut,'),
      paragraph(`Voici ton guide : ${foodCount} aliments classés, les numéros antipoison et ${recipeCount} recettes. Imprime la page urgences et colle-la sur le frigo.`),
      button('Télécharger le guide (PDF)', siteUrl(GUIDE_PDF_PATH)),
      paragraph(`Côté recettes, j'en accepte une sur ${recipeCount}. Un Shiba ne se refait pas, ton chien sera sûrement moins compliqué.`),
      paragraph('Chaque mois, tu recevras ma lettre : un guide, une recette, une offre partenaire vérifiée.'),
      paragraph('Milo'),
    ],
    unsubscribeUrl,
    reason: 'Tu reçois cet e-mail parce que tu as demandé le guide sur toutou-gourmet.com.',
  })
}
