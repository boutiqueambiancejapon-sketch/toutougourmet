import { getBrandBySlug } from '@/data/brands'
import { CONFIRMED_DISCOUNTS, type OfferSlug } from '@/data/partner-discounts'
import { getPromoPage, promoPath } from '@/data/promo-codes'
import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'
import { button, divider, heading, label, linkItem, paragraph, renderEmail, siteUrl, smallPrint, type RenderedEmail } from './layout'
import { offerForMonth } from './monthly'
import { accountRemindersEnabled } from './account-reminders'
import { offerCard } from './offer-card'

// @cdc e-mails — suite de bienvenue, après l'e-mail du jour 0 (bienvenue ou guide) : J2 la
// ration, J7 l'offre partenaire du moment (code interne j5 : les lignes déjà écrites en base et
// les liens gardent ce nom ; même carte que la lettre, remise de data/partner-discounts.ts), J10
// le scanner. Envoyée par scripts/welcome-sequence.ts, une fois par étape et par adresse. Même ton
// que lib/emails/welcome.ts (tutoiement, phrases courtes). Rappels de compte : account-reminders.ts.

export const WELCOME_STEPS = ['j2', 'j5', 'j10'] as const
export type WelcomeStep = (typeof WELCOME_STEPS)[number]

/** Jour d'envoi de chaque étape, compté depuis l'inscription (jour 0). */
export const STEP_DAY: Record<WelcomeStep, number> = { j2: 2, j5: 7, j10: 10 }

export const STEP_LABEL: Record<WelcomeStep, string> = {
  j2: 'Jour 2 : la ration',
  j5: "Jour 7 : l'offre du moment",
  j10: 'Jour 10 : le scanner',
}

/** Pied des e-mails : avec le rappel J4 activé, la suite compte 4 e-mails pour un inscrit sans compte. */
const reason = (): string =>
  `Tu reçois cet e-mail parce que tu t'es inscrit à la lettre de Toutou Gourmet (${accountRemindersEnabled() ? "les e-mails de bienvenue, sur dix jours" : '3 e-mails de bienvenue'}, puis un par mois).`

export function rationEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: 'Calcule la ration de ton chien, au gramme près',
    preheader: 'Son poids, son âge, son activité : le calculateur donne les grammes par jour.',
    blocks: [
      heading('Combien de grammes par jour pour ton chien ?', 1),
      paragraph("La quantité imprimée sur le paquet vaut pour un chien moyen. Un chien stérilisé, âgé ou peu actif a besoin de moins, un chien sportif de plus."),
      paragraph("Notre calculateur part de son poids, de son âge et de son activité, applique la formule NRC des besoins énergétiques et convertit le résultat en grammes de croquettes."),
      button('Calculer sa ration', siteUrl('/outils/ration')),
      paragraph('Deux outils vont avec :'),
      linkItem('Son poids de forme', siteUrl('/outils/poids'), "Pour savoir s'il doit perdre ou prendre quelques kilos avant de fixer la ration."),
      linkItem('Le budget de sa gamelle', siteUrl('/outils/budget'), 'Le coût par mois selon la marque et son poids.'),
      smallPrint('Avec un compte gratuit, la ration et le poids de ton chien restent enregistrés, et les outils se remplissent tout seuls.'),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    unsubscribeUrl,
    reason: reason(),
  })
}

/** Offre de l'étape J7 (code j5) : celle du mois suivant, pour ne pas répéter la lettre mensuelle. */
export function offerSlugFor(date: Date): OfferSlug {
  return offerForMonth(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)))
}

export function offerEmail(unsubscribeUrl: string, date: Date): RenderedEmail {
  const slug = offerSlugFor(date)
  const brand = getBrandBySlug(slug)
  const discount = CONFIRMED_DISCOUNTS[slug]
  const name = brand?.name ?? slug
  const card = offerCard(slug, 'bienvenue-j5')
  const code = getPromoPage(slug)?.code
  return renderEmail({
    subject: discount ? `${name} : ${discount}` : `L'offre partenaire du moment : ${name}`,
    preheader: code ? `Avec le code ${code}. Mode d'emploi et conditions sur notre page.` : "Par notre lien, sans code à taper. Mode d'emploi et conditions sur notre page.",
    blocks: [
      heading("L'offre partenaire du moment", 1),
      paragraph("Une fois par mois, on choisit une offre parmi nos marques partenaires. On ne publie que des remises vérifiées : pas de code récupéré sur un site de bons plans."),
      ...(card ? [card] : []),
      paragraph(code ? `Le code ${code} est déjà rattaché au lien. Le mode d'emploi pas à pas et les conditions sont sur notre page :` : "La remise passe par le lien, sans code à taper. Le mode d'emploi pas à pas et les conditions sont sur notre page :"),
      linkItem(`Code promo ${name} : mode d'emploi`, siteUrl(promoPath(slug))),
      linkItem('Toutes les offres de nos partenaires', siteUrl('/codes-promo')),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    unsubscribeUrl,
    reason: reason(),
  })
}

export function scannerEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: 'Que valent les croquettes de ton chien ? Note sur 100',
    preheader: "Croquettes, pâtées, friandises : scanne le code-barres, la note sur 100 s'affiche.",
    blocks: [
      heading('Que valent ses croquettes ?', 1),
      paragraph("Le scanner lit la composition des croquettes, des pâtées et des friandises pour chien et leur donne une note sur 100, selon un barème publié."),
      label('Comment ça marche'),
      paragraph("Scanne le code-barres du paquet. Si le produit est déjà connu, la note s'affiche aussitôt, sans compte."),
      paragraph(`Sinon, photographie l'étiquette : deux photos pour des croquettes ou une pâtée, une seule pour une friandise. Il faut un compte gratuit, ${FREE_MONTHLY_SCANS} analyses par photo par mois.`),
      button('Scanner un paquet', siteUrl('/scanner')),
      divider(),
      linkItem('Le classement des croquettes', siteUrl('/croquettes'), 'Les paquets déjà notés, du meilleur au moins bon.'),
      linkItem('Le classement des friandises', siteUrl('/croquettes/friandises'), 'Les friandises notées avec leur propre barème.'),
      paragraph("C'est le dernier e-mail de bienvenue. Ensuite, un e-mail par mois, pas plus."),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    unsubscribeUrl,
    reason: reason(),
  })
}

export function welcomeStepEmail(step: WelcomeStep, unsubscribeUrl: string, date: Date): RenderedEmail {
  if (step === 'j2') return rationEmail(unsubscribeUrl)
  if (step === 'j5') return offerEmail(unsubscribeUrl, date)
  return scannerEmail(unsubscribeUrl)
}
