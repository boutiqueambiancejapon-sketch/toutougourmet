// @cdc e-mails — type de chaque e-mail individuel, écrit dans analytics.email_log. Module pur :
// lu par l'envoi (lib/server/mailer.ts) et par le suivi du tableau de bord.

export const EMAIL_KIND_LABEL = {
  guide: 'Guide PDF',
  bienvenue: 'Bienvenue',
  'suite-j2': 'Suite, jour 2 : la ration',
  'suite-j5': "Suite, jour 7 : l'offre du moment",
  'suite-j10': 'Suite, jour 10 : le scanner',
  'compte-j4': 'Rappel, jour 4 : créer un compte',
  'chien-j1': 'Rappel, jour 1 : ajouter son chien',
  'chien-j4': 'Rappel, jour 4 : ajouter son chien',
  outil: "Résultat d'outil",
  confirmation: "Confirmation d'adresse",
  'mot-de-passe': 'Mot de passe oublié',
  suppression: 'Suppression du compte',
  test: 'Test du tableau de bord',
  interne: 'Résumé hebdomadaire',
} as const

export type EmailKind = keyof typeof EMAIL_KIND_LABEL
export type EmailLogState = 'sent' | 'failed' | 'simulated'

/**
 * Types comptés dans le plafond d'un e-mail par jour. Restent à part les e-mails de sécurité du
 * compte, les tests et le résumé envoyé au propriétaire.
 */
export const CAPPED_KINDS: readonly EmailKind[] = ['guide', 'bienvenue', 'suite-j2', 'suite-j5', 'suite-j10', 'compte-j4', 'chien-j1', 'chien-j4', 'outil']

/** Nom d'expéditeur de Milo, la mascotte. Les e-mails de sécurité du compte restent au nom du site. */
export const MILO_SENDER = 'Milo, de Toutou Gourmet'
const MILO_KINDS: readonly EmailKind[] = ['guide', 'bienvenue', 'suite-j2', 'suite-j5', 'suite-j10', 'compte-j4', 'chien-j1', 'chien-j4', 'outil', 'test']

export function senderNameFor(kind: EmailKind, fallback: string): string {
  return MILO_KINDS.includes(kind) ? MILO_SENDER : fallback
}
