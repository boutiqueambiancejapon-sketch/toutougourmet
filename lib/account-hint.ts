// @cdc lot 4 — témoin « un compte est connecté sur ce navigateur ». Posé par Better Auth à la
// connexion (lib/server/auth.ts), retiré à la déconnexion. Il ne prouve rien : le serveur vérifie
// toujours la vraie session. Il évite seulement d'appeler le serveur pour les visiteurs anonymes.

export const SESSION_HINT_COOKIE = 'tg_compte'

export function hasSessionHint(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').some((c) => c === `${SESSION_HINT_COOKIE}=1`)
}

export function clearSessionHint(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
}
