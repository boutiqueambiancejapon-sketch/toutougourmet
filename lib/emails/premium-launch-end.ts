import { launchEndsAt } from '@/lib/premium/access'
import { formatEuros, frDate, PRICE_CENTS, yearlySaving } from '@/lib/premium/pricing'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'
import { button, heading, paragraph, renderEmail, siteUrl, type RenderedEmail } from './layout'

// @cdc e-mails — prévenance de fin du Premium gratuit du lancement (décision du 2026-11-03 : les
// comptes Premium du lancement passent au payant, prévenus avant). Gabarit prêt, NON envoyé : aucun
// script ni minuterie ne l'expédie. Aperçu et test : /tableau-de-bord/emails/premium-lancement.
// E-mail lié au compte (transactionnel) : pas de lien de désinscription, raison de l'envoi en pied.

export interface LaunchEndInput {
  name: string
  /** Date de fin de gratuité, déjà formatée (« 31 janvier 2027 ») */
  endsOn: string
}

const saving = yearlySaving()

/** Données de l'aperçu : PREMIUM_LAUNCH_ENDS_AT si configurée, sinon une date d'exemple (dans 30 jours). */
export function premiumLaunchPreviewInput(now = new Date()): LaunchEndInput & { configured: boolean } {
  const end = launchEndsAt()
  const date = end ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  return { name: 'Camille', endsOn: frDate(date), configured: end !== null }
}

export function premiumLaunchEndEmail({ name, endsOn }: LaunchEndInput): RenderedEmail {
  return renderEmail({
    subject: `Ton Premium gratuit s'arrête le ${endsOn}`,
    preheader: `Ensuite, ${formatEuros(PRICE_CENTS.month)} par mois ou ${formatEuros(PRICE_CENTS.year)} par an. Rien n'est prélevé sans ton accord.`,
    blocks: [
      heading(`Ton Premium gratuit s'arrête le ${endsOn}`, 1),
      paragraph(`Bonjour ${name},`),
      paragraph(`Tu as activé Premium pendant le lancement de Toutou Gourmet. Merci d'avoir essayé le site dès ses débuts. La gratuité s'arrête le ${endsOn}.`),
      paragraph(`Pour garder ${PREMIUM_MONTHLY_SCANS} analyses par photo par mois, l'alerte de poids et tout l'historique de tes analyses, deux formules, TVA comprise :`),
      paragraph(`Mensuelle : ${formatEuros(PRICE_CENTS.month)} par mois, sans engagement.`),
      paragraph(`Annuelle : ${formatEuros(PRICE_CENTS.year)} par an, soit ${formatEuros(saving.perMonthCents)} par mois.`),
      paragraph(`Si tu t'abonnes au moins deux jours avant le ${endsOn}, le premier prélèvement attend la fin de ta gratuité.`),
      button('Choisir ma formule', siteUrl('/compte/reglages#premium')),
      paragraph(`Sans abonnement, rien n'est prélevé : ton compte repasse en gratuit le ${endsOn}. Tes chiens, tes pesées et tes analyses restent là, avec ${FREE_MONTHLY_SCANS} analyses par photo par mois.`, true),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    reason: 'Tu reçois cet e-mail parce que tu as activé Premium sur ton compte Toutou Gourmet pendant le lancement.',
  })
}
