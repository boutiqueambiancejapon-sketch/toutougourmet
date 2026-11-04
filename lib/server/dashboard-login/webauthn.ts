import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON, AuthenticatorTransport, RegistrationResponseJSON } from '@simplewebauthn/server'
import { listPasskeys } from './factors'
import { requirePool } from './mode'

// @cdc tableau de bord — clés d'accès (Face ID), bibliothèque SimpleWebAuthn. RP ID figé sur
// dashboard.toutou-gourmet.com. Seule exception, pour les essais : RP ID « localhost », qui ne peut
// servir à rien depuis Internet. Vérification de l'utilisateur exigée (Face ID ou code de l'iPhone).

const PROD_RP_ID = 'dashboard.toutou-gourmet.com'
const USER_ID = new TextEncoder().encode('toutou-dashboard-owner')

export function relyingParty(env: Record<string, string | undefined> = process.env): { rpID: string; origin: string } {
  if (env.DASHBOARD_WEBAUTHN_RP_ID === 'localhost') {
    const origin = env.DASHBOARD_WEBAUTHN_ORIGIN ?? ''
    return { rpID: 'localhost', origin: /^http:\/\/localhost:\d+$/.test(origin) ? origin : 'http://localhost:3070' }
  }
  return { rpID: PROD_RP_ID, origin: `https://${PROD_RP_ID}` }
}

export async function registrationOptions() {
  const { rpID } = relyingParty()
  const existing = await listPasskeys()
  return generateRegistrationOptions({
    rpName: 'Toutou Gourmet',
    rpID,
    userID: USER_ID,
    userName: 'Tableau de bord',
    userDisplayName: 'Tableau de bord',
    attestationType: 'none',
    excludeCredentials: existing.map((p) => ({ id: p.credentialId, transports: p.transports })),
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    preferredAuthenticatorType: 'localDevice',
  })
}

/** Vrai si la clé est vérifiée et enregistrée. Toute réponse illisible vaut un refus. */
export async function saveRegistration(response: RegistrationResponseJSON, challenge: string, label: string): Promise<boolean> {
  const { rpID, origin } = relyingParty()
  try {
    const result = await verifyRegistrationResponse({ response, expectedChallenge: challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true })
    if (!result.verified) return false
    const { credential, credentialBackedUp } = result.registrationInfo
    await requirePool().query(
      'INSERT INTO app.dashboard_passkey (credential_id, public_key, counter, transports, backed_up, label) VALUES ($1, $2, $3, $4::jsonb, $5, $6)',
      [credential.id, Buffer.from(credential.publicKey).toString('base64url'), credential.counter, JSON.stringify(credential.transports ?? []), credentialBackedUp, label],
    )
    return true
  } catch (err) {
    console.error('[dashboard-login] enregistrement refusé', err instanceof Error ? err.message : err)
    return false
  }
}

export async function authenticationOptions() {
  const { rpID } = relyingParty()
  const keys = await listPasskeys()
  return generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    allowCredentials: keys.map((p) => ({ id: p.credentialId, transports: p.transports })),
  })
}

/** Connexion directe : aucune clé citée, un visiteur n'apprend rien. L'iPhone propose la sienne. */
export function directAuthenticationOptions() {
  return generateAuthenticationOptions({ rpID: relyingParty().rpID, userVerification: 'required', allowCredentials: [] })
}

/** Défi annoncé par le navigateur, à confronter à ceux que le serveur a émis. Illisible : null. */
export function challengeOf(response: AuthenticationResponseJSON): string | null {
  try {
    const data: unknown = JSON.parse(Buffer.from(response.response.clientDataJSON, 'base64url').toString('utf8'))
    const value = typeof data === 'object' && data !== null && 'challenge' in data ? data.challenge : null
    return typeof value === 'string' && value.length <= 128 ? value : null
  } catch {
    return null
  }
}

export async function checkAuthentication(response: AuthenticationResponseJSON, challenge: string): Promise<boolean> {
  const { rpID, origin } = relyingParty()
  const stored = (await listPasskeys()).find((p) => p.credentialId === response.id)
  if (!stored) return false
  try {
    const result = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: {
        id: stored.credentialId,
        publicKey: new Uint8Array(Buffer.from(stored.publicKey, 'base64url')),
        counter: stored.counter,
        transports: stored.transports as AuthenticatorTransport[],
      },
    })
    if (!result.verified) return false
    await requirePool().query('UPDATE app.dashboard_passkey SET counter = $2, last_used_at = now() WHERE credential_id = $1', [stored.credentialId, result.authenticationInfo.newCounter])
    return true
  } catch (err) {
    console.error('[dashboard-login] clé refusée', err instanceof Error ? err.message : err)
    return false
  }
}

export async function removePasskey(credentialId: string): Promise<boolean> {
  const { rowCount } = await requirePool().query('DELETE FROM app.dashboard_passkey WHERE credential_id = $1', [credentialId])
  return rowCount === 1
}
