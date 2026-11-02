// @cdc lot 4 — messages en français pour les erreurs renvoyées par Better Auth.

interface AuthError {
  code?: string
  status?: number
  message?: string
}

export function authErrorMessage(error: AuthError | null | undefined): string {
  if (!error) return ''
  if (error.status === 429) return 'Trop de tentatives. Attends une minute avant de réessayer.'
  switch (error.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'E-mail ou mot de passe incorrect.'
    case 'EMAIL_NOT_VERIFIED':
      return "Ton adresse n'est pas encore confirmée. On vient de te renvoyer le lien par e-mail."
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'Un compte existe déjà avec cette adresse. Connecte-toi, ou demande un nouveau mot de passe.'
    case 'PASSWORD_TOO_SHORT':
      return 'Le mot de passe doit faire au moins 8 caractères.'
    case 'PASSWORD_TOO_LONG':
      return 'Le mot de passe doit faire au plus 128 caractères.'
    case 'INVALID_EMAIL':
      return "Cette adresse e-mail n'est pas valide."
    case 'INVALID_TOKEN':
      return "Ce lien n'est plus valable. Demande un nouveau lien."
    default:
      return "Ça n'a pas marché. Réessaie dans un moment."
  }
}
