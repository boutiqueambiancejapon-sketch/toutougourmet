import { button, heading, linkItem, paragraph, renderEmail, siteUrl, smallPrint, type RenderedEmail } from '@/lib/emails/layout'
import { unsubscribeUrlFromEnv } from '@/lib/emails/unsubscribe'
import { GUIDE_PDF_PATH, GUIDE_TITLE } from '@/lib/guide/config'
import { signupHref } from '@/lib/signup-places'
import type { ToolResultText } from '@/lib/tool-email'
import { sendTransactionalEmail } from './mailer'

// @cdc outils — e-mail « Ton résultat » envoyé tout de suite après la demande sous un outil
// (app/api/outils/email) : le chiffre recalculé par le serveur, le lien pour refaire le calcul,
// le guide PDF et l'invitation au compte (place « tool-email », attribuée à la création du compte).
// Gabarit commun lib/emails/layout.ts, envoi Brevo lib/server/mailer.ts.

export function toolResultEmail(result: ToolResultText, unsubscribeUrl?: string): RenderedEmail {
  return renderEmail({
    subject: result.subject,
    preheader: result.headline,
    blocks: [
      heading('Ton résultat', 1),
      paragraph(result.headline),
      ...result.details.map((line) => paragraph(line, true)),
      button('Refaire le calcul', siteUrl(result.redoPath)),
      heading('Garde son profil, la ration se recalcule toute seule'),
      paragraph('Avec un compte gratuit, ses outils sont déjà remplis, sa ration suit son poids et tu notes ses pesées sur une courbe.'),
      button('Créer mon compte gratuit', siteUrl(signupHref('tool-email', result.redoPath.split('?')[0]))),
      heading(GUIDE_TITLE),
      linkItem('Télécharger le guide (PDF)', siteUrl(GUIDE_PDF_PATH), 'Les aliments classés, les numéros antipoison et les recettes maison.'),
      smallPrint('Chaque mois, tu recevras aussi notre lettre : un guide, une recette, une offre partenaire vérifiée.'),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    unsubscribeUrl,
    reason: 'Tu reçois cet e-mail parce que tu as demandé ton résultat sur toutou-gourmet.com.',
  })
}

/** Envoie l'e-mail du résultat. Lève une erreur si Brevo refuse (la route répond alors 502). */
export async function sendToolResultEmail(email: string, result: ToolResultText): Promise<void> {
  const unsubscribeUrl = unsubscribeUrlFromEnv(email) ?? undefined
  const mail = toolResultEmail(result, unsubscribeUrl)
  await sendTransactionalEmail({
    to: email,
    ...mail,
    headers: unsubscribeUrl ? { 'List-Unsubscribe': `<${unsubscribeUrl}>` } : undefined,
    tags: ['outil'],
  })
}
