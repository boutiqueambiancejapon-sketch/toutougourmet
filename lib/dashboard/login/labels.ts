// @cdc tableau de bord — libellés du journal de connexion (écran Sécurité).

const KINDS: Record<string, string> = {
  password: 'Mot de passe',
  passkey: 'Clé d’accès',
  totp: 'Code de l’application',
  backup: 'Code de secours',
  enroll: 'Facteur ajouté',
  'factor-removed': 'Facteur retiré',
  codes: 'Codes de secours renouvelés',
  logout: 'Déconnexion',
  'logout-all': 'Déconnexion partout',
  'session-closed': 'Session fermée',
  reset: 'Réinitialisation par le serveur',
}

const OUTCOMES: Record<string, string> = {
  success: 'réussi',
  failure: 'refusé',
  blocked: 'bloqué',
  cleared: 'refus effacé par le serveur',
}

export const eventKindLabel = (kind: string): string => KINDS[kind] ?? kind
export const eventOutcomeLabel = (outcome: string): string => OUTCOMES[outcome] ?? outcome

const STAGES: Record<string, string> = {
  full: 'connectée',
  second_factor: 'attend le second facteur',
  enroll: 'attend l’enrôlement',
}

export const sessionStageLabel = (stage: string): string => STAGES[stage] ?? stage
