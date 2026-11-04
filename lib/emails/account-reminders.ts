import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'
import { signupHref } from '@/lib/signup-places'
import { button, paragraph, renderEmail, siteUrl, smallPrint, type RenderedEmail } from './layout'

// @cdc e-mails — rappels de compte, actifs avec ACCOUNT_REMINDERS_ENABLED=1, voix de Milo
// (validée par le propriétaire le 2026-11-04) : compte-j4 invite un inscrit sans compte à en créer un,
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
    subject: 'Sa ration et son poids enregistrés, gratuitement',
    preheader: 'Tu remplis son profil une fois, les outils le reprennent.',
    blocks: [
      paragraph('Salut,'),
      paragraph("Sans compte, chaque outil redemande le poids, l'âge et l'activité de ton chien. Avec un compte gratuit, tu les saisis une fois. Moins de formulaires pour toi, et plus de temps pour le regarder faire des bêtises."),
      paragraph("Chaque pesée s'ajoute à sa courbe de poids."),
      paragraph(`Le scanner lit ${FREE_MONTHLY_SCANS} étiquettes par photo chaque mois et garde tes 20 dernières analyses.`),
      paragraph('La fiche de garde réunit ses repas, ses médicaments et le téléphone du vétérinaire, dans un lien à envoyer à la personne qui le garde. La mienne fait trois pages, je ne sais pas pourquoi.'),
      button('Créer mon compte', siteUrl(signupHref('email-j4', '/compte'))),
      smallPrint('Gratuit, sans carte bancaire. Tu peux supprimer ton compte quand tu veux depuis tes réglages.'),
      paragraph('Milo'),
    ],
    unsubscribeUrl,
    reason: "Tu reçois cet e-mail parce que tu t'es inscrit à la lettre de Toutou Gourmet (les e-mails de bienvenue, sur dix jours, puis un par mois).",
  })
}

export function addDogEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: 'Ajoute ton chien : sa ration se calcule toute seule',
    preheader: 'Sa ration, sa fiche de garde et une alerte sur ses allergies partent de son profil.',
    blocks: [
      paragraph('Salut,'),
      paragraph("Ton compte est bien ouvert, mais il manque l'essentiel : ton chien. Sans lui, nos outils tournent un peu à vide."),
      paragraph("Une fois son profil rempli, sa ration se calcule toute seule, sa fiche de garde est prête à envoyer, et le scanner te signale les paquets qui contiennent un aliment noté dans ses allergies."),
      button('Ajouter mon chien', siteUrl(NEW_DOG_PATH)),
      paragraph('Je ne te relance qu\'une seule fois. Les Shibas ont leur fierté.'),
      paragraph('Milo'),
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
      paragraph('Salut,'),
      paragraph("Toujours pas de chien dans ton compte. Un exemple de ce que ça change : tu notes une allergie au poulet dans son profil, et le scanner te signale les paquets qui en contiennent, même quand la composition dit seulement « volaille »."),
      paragraph("Le repérage se fait sur la composition affichée et ne remplace pas l'avis du vétérinaire."),
      button('Ajouter mon chien', siteUrl(NEW_DOG_PATH)),
      paragraph("Je n'en reparlerai plus. Ton compte reste ouvert, avec ou sans profil. Moi, je retourne bouder."),
      paragraph('Milo'),
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
