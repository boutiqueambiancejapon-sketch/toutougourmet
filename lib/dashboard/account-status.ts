// @cdc tableau de bord — pastille d'un compte et adresse de sa fiche. L'URL porte l'identifiant du
// compte, jamais l'e-mail : Caddy journalise les URL complètes.

export const ACCOUNT_ROOT = '/tableau-de-bord/conversions/comptes'

export const accountHref = (id: string): string => `${ACCOUNT_ROOT}/${encodeURIComponent(id)}`

/** Identifiants créés par Better Auth : lettres, chiffres, tirets. Tout le reste : page introuvable. */
export const isAccountId = (id: string): boolean => /^[A-Za-z0-9_-]{8,64}$/.test(id)

export type AccountStatus = { label: 'Confirmé'; tone: 'green' } | { label: 'Sans chien'; tone: 'amber' } | { label: 'À confirmer'; tone: 'rose' }

export function accountStatus(account: { verified: boolean; dogs: number }): AccountStatus {
  if (!account.verified) return { label: 'À confirmer', tone: 'rose' }
  return account.dogs > 0 ? { label: 'Confirmé', tone: 'green' } : { label: 'Sans chien', tone: 'amber' }
}

/** Ligne sous l'adresse : chiens du compte, sinon « Aucun chien ». */
export const dogNamesLine = (names: string[]): string => (names.length > 0 ? names.join(', ') : 'Aucun chien')
