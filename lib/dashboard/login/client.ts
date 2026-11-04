import { API_PATH } from './policy'

// @cdc tableau de bord — appels du navigateur vers /tableau-de-bord/connexion/api et textes d'erreur.
// Messages neutres : rien ne dit si l'identifiant, le mot de passe ou le code était faux.

export interface LoginReply {
  ok: boolean
  error?: string
  next?: string
  codes?: string[]
  options?: unknown
  uri?: string
  secret?: string
  qr?: string
}

export async function callLogin(action: string, body: Record<string, unknown> = {}): Promise<LoginReply> {
  try {
    const res = await fetch(`${API_PATH}/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify(body),
    })
    return (await res.json()) as LoginReply
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

const ERRORS: Record<string, string> = {
  invalid: 'Connexion impossible. Vérifie ta saisie.',
  blocked: 'Trop d’essais. Réessaie dans 15 minutes.',
  session: 'Session expirée. Reconnecte-toi.',
  reauth: 'Par sécurité, reconnecte-toi avant ce changement.',
  'last-factor': 'Garde au moins une clé d’accès ou une application de codes.',
  exists: 'Une application de codes est déjà enregistrée.',
  unavailable: 'Service indisponible. Réessaie dans une minute.',
}

export function errorText(error: string | undefined): string {
  return ERRORS[error ?? ''] ?? ERRORS.invalid
}

/** Après une clé refusée ou annulée dans la fenêtre du système : rien n'est parti vers le serveur. */
export const PASSKEY_CANCELLED = 'Clé d’accès annulée ou indisponible sur cet appareil.'

export const buttonPrimary = 'inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-pill bg-ink px-5 font-semibold text-cream disabled:opacity-60'
export const buttonSecondary = 'inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-pill border-2 border-line px-5 font-semibold text-ink hover:border-line-2 disabled:opacity-60'
export const linkButton = 'inline-flex min-h-11 items-center whitespace-nowrap text-sm text-ink-2 underline underline-offset-2'
export const fieldClass = 'mt-1 block min-h-12 w-full rounded-box border border-line-2 bg-paper px-3 text-base text-ink'
