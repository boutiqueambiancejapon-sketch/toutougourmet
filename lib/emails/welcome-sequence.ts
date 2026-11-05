import { getBrandBySlug } from '@/data/brands'
import { CONFIRMED_DISCOUNTS, type OfferSlug } from '@/data/partner-discounts'
import { getPromoPage, promoPath } from '@/data/promo-codes'
import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'
import { button, divider, linkItem, paragraph, renderEmail, siteUrl, smallPrint, type RenderedEmail } from './layout'
import { offerForMonth } from './monthly'
import { accountRemindersEnabled } from './account-reminders'
import { offerCard } from './offer-card'

// @cdc e-mails — suite de bienvenue, après l'e-mail du jour 0 (bienvenue ou guide) : J2 la
// ration, J7 l'offre partenaire du moment (code interne j5 : les lignes déjà écrites en base et
// les liens gardent ce nom ; même carte que la lettre, remise de data/partner-discounts.ts), J10
// le scanner. Envoyée par scripts/welcome-sequence.ts, une fois par étape et par adresse. Voix de
// Milo, le Shiba Inu mascotte (validée le 2026-11-04) : familier, un peu d'humour, faits exacts. Rappels de compte : account-reminders.ts.

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
    subject: 'Combien de grammes par jour pour ton chien ?',
    preheader: 'Son poids, son âge, son activité : le calculateur donne les grammes par jour.',
    blocks: [
      paragraph('Salut,'),
      paragraph("La dose imprimée sur le paquet vaut pour un chien moyen. Un chien stérilisé, âgé ou peu actif a besoin de moins, un sportif de plus. Moi, on a essayé de me mesurer ma ration, j'ai regardé ailleurs. Ton chien sera sûrement plus coopératif."),
      paragraph('Notre calculateur part de son poids, de son âge et de son activité, et te donne les grammes par jour.'),
      button('Calculer sa ration', siteUrl('/outils/ration')),
      paragraph('Deux outils vont avec :'),
      linkItem('Son poids de forme', siteUrl('/outils/poids'), "Pour savoir s'il doit perdre ou prendre quelques kilos."),
      linkItem('Le budget de sa gamelle', siteUrl('/outils/budget'), 'Le coût par mois selon la marque et son poids.'),
      paragraph('Milo'),
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
    subject: discount ? `${discount.split(',')[0]} chez ${name} pour ton chien` : `L'offre partenaire du moment : ${name}`,
    preheader: code ? `Avec le code ${code}. Mode d'emploi et conditions sur notre page.` : "Par notre lien, sans code à taper. Mode d'emploi et conditions sur notre page.",
    blocks: [
      paragraph('Salut,'),
      paragraph("Une fois par mois, je choisis une offre parmi nos marques partenaires. Je suis difficile, et pas seulement à table : on publie uniquement des remises vérifiées, jamais un code ramassé sur un site de bons plans."),
      ...(card ? [card] : []),
      paragraph(code ? `Le code ${code} est déjà rattaché au lien. Le mode d'emploi et les conditions sont sur notre page :` : "La remise passe par le lien, sans code à taper. Le mode d'emploi et les conditions sont sur notre page :"),
      linkItem(`Code promo ${name} : mode d'emploi`, siteUrl(promoPath(slug))),
      linkItem('Toutes les offres de nos partenaires', siteUrl('/codes-promo')),
      smallPrint("Lien partenaire : on touche une commission si tu commandes, ça ne change rien à ton prix."),
      paragraph('Milo'),
    ],
    unsubscribeUrl,
    reason: reason(),
  })
}

export function scannerEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: 'Que valent ses croquettes ? Note sur 100',
    preheader: "Croquettes, pâtées, friandises : scanne le code-barres, la note sur 100 s'affiche.",
    blocks: [
      paragraph('Salut,'),
      paragraph("Le scanner lit la composition des croquettes, des pâtées et des friandises, et leur donne une note sur 100, selon un barème publié. Je ne l'utilise pas : je refuse d'abord, je me renseigne après."),
      paragraph(`Scanne le code-barres du paquet. Si le produit est déjà connu, la note s'affiche aussitôt, sans compte. Sinon, photographie l'étiquette, avec un compte gratuit (${FREE_MONTHLY_SCANS} analyses par photo par mois).`),
      button('Scanner un paquet', siteUrl('/scanner')),
      divider(),
      linkItem('Le classement des croquettes', siteUrl('/meilleures-croquettes'), 'Les paquets déjà notés, du meilleur au moins bon.'),
      linkItem('Le classement des friandises', siteUrl('/meilleures-friandises'), 'Les friandises notées avec leur propre barème.'),
      paragraph("C'est mon dernier e-mail de bienvenue. Ensuite, c'est une lettre par mois, pas plus. Je ne suis pas du genre à insister, demande à ma gamelle."),
      paragraph('Milo'),
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
