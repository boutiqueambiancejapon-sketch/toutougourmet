import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'
import { signupHref } from '@/lib/signup-places'
import { button, heading, label, paragraph, renderEmail, siteUrl, smallPrint, type RenderedEmail } from './layout'

// @cdc e-mails — rappels de compte, désactivés tant que ACCOUNT_REMINDERS_ENABLED=1 n'est pas posée
// (textes à valider par le propriétaire) : compte-j4 invite un inscrit sans compte à en créer un,
// chien-j1 et chien-j4 invitent un compte sans chien à ajouter son profil. Fonctions citées et
// vérifiées dans le code : ration préremplie (RationCalculator), fiche de garde par chien
// (/compte/chien/[id]/garde), alerte allergies du scanner (AllergyAlert). Aucun lien partenaire.

export const REMINDER_STEPS = ['compte-j4', 'chien-j1', 'chien-j4'] as const
export type ReminderStep = (typeof REMINDER_STEPS)[number]

/** Jour d'envoi : depuis l'inscription à la lettre (compte-j4), depuis la création du compte (chien). */
export const REMINDER_DAY: Record<ReminderStep, number> = { 'compte-j4': 4, 'chien-j1': 1, 'chien-j4': 4 }

export const REMINDER_LABEL: Record<ReminderStep, string> = {
  'compte-j4': 'Jour 4 : créer un compte',
  'chien-j1': 'Jour 1 : ajouter son chien',
  'chien-j4': 'Jour 4 : ajouter son chien',
}

export function accountRemindersEnabled(): boolean {
  return process.env.ACCOUNT_REMINDERS_ENABLED === '1'
}

const NEW_DOG_PATH = '/compte/chien/nouveau'
const ACCOUNT_REASON = 'Tu reçois cet e-mail parce que tu as ouvert un compte sur toutou-gourmet.com et que ton compte ne contient pas encore de chien. Deux rappels au plus sur ce sujet.'

export function accountInviteEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: 'Le poids et la ration de ton chien, gardés dans un compte gratuit',
    preheader: 'Tu remplis son profil une fois, les outils le reprennent.',
    blocks: [
      heading('Le profil de ton chien, une fois pour toutes', 1),
      paragraph("Sans compte, chaque outil redemande le poids, l'âge et l'activité de ton chien. Avec un compte gratuit, tu les saisis une fois et le calcul de ration se remplit tout seul."),
      label('Avec un compte'),
      paragraph("Chaque pesée s'ajoute à sa courbe de poids, à côté de la fourchette de sa race."),
      paragraph(`Le scanner lit ${FREE_MONTHLY_SCANS} étiquettes par photo chaque mois et garde tes 20 dernières analyses.`),
      paragraph('La fiche de garde réunit ses repas, ses médicaments et le téléphone du vétérinaire, dans un lien à envoyer à la personne qui le garde.'),
      button('Créer mon compte', siteUrl(signupHref('email-j4', '/compte'))),
      smallPrint('Gratuit, sans carte bancaire. Tu peux supprimer ton compte quand tu veux depuis tes réglages.'),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    unsubscribeUrl,
    reason: "Tu reçois cet e-mail parce que tu t'es inscrit à la lettre de Toutou Gourmet (les e-mails de bienvenue, sur dix jours, puis un par mois).",
  })
}

export function addDogEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: 'Ton compte attend le profil de ton chien',
    preheader: 'Sa ration, sa fiche de garde et une alerte sur ses allergies partent de ce profil.',
    blocks: [
      heading('Ton compte est ouvert, il manque ton chien', 1),
      paragraph("Son nom, son poids, son âge et son activité : les outils du compte partent de ces réponses."),
      label('Une fois son profil rempli'),
      paragraph('Sa ration se calcule sans rien ressaisir.'),
      paragraph('Sa fiche de garde se remplit avec son profil : tu complètes, tu envoies le lien à la personne qui le garde.'),
      paragraph("Le scanner te prévient quand la composition d'un paquet contient un aliment noté dans ses allergies."),
      button('Ajouter mon chien', siteUrl(NEW_DOG_PATH)),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    unsubscribeUrl,
    reason: ACCOUNT_REASON,
  })
}

export function lastDogReminderEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: 'Dernier rappel : le profil de ton chien',
    preheader: 'Note une allergie au poulet, le scanner te signale les paquets qui en contiennent.',
    blocks: [
      heading('Dernier rappel pour son profil', 1),
      paragraph("Ton compte ne contient toujours pas de chien. Un exemple de ce que ça change : tu notes une allergie au poulet dans son profil, et le scanner te signale les paquets qui en contiennent, y compris quand la composition indique seulement « volaille »."),
      paragraph("Le repérage se fait sur la composition affichée et ne remplace pas l'avis du vétérinaire."),
      button('Ajouter mon chien', siteUrl(NEW_DOG_PATH)),
      paragraph("On n'en reparlera plus. Ton compte reste ouvert, avec ou sans profil."),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    unsubscribeUrl,
    reason: ACCOUNT_REASON,
  })
}

export function reminderEmail(step: ReminderStep, unsubscribeUrl: string): RenderedEmail {
  if (step === 'compte-j4') return accountInviteEmail(unsubscribeUrl)
  if (step === 'chien-j1') return addDogEmail(unsubscribeUrl)
  return lastDogReminderEmail(unsubscribeUrl)
}
