import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes } from 'node:crypto'

// @cdc tableau de bord — clés dérivées de DASHBOARD_AUTH_SECRET (HKDF), une par usage. Le secret
// reste sur le serveur (/srv/toutou/shared/.env). Le changer invalide le secret TOTP et les codes
// de secours : la procédure de secours de deploy/README.md repart alors de zéro.

export const MIN_SECRET_LENGTH = 32

type KeyUse = 'ip' | 'backup' | 'password' | 'totp' | 'device'

export function authSecret(): string | null {
  const secret = process.env.DASHBOARD_AUTH_SECRET
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null
}

function key(use: KeyUse): Buffer {
  const secret = authSecret()
  if (!secret) throw new Error('DASHBOARD_AUTH_SECRET absent')
  return Buffer.from(hkdfSync('sha256', secret, 'toutou-dashboard', use, 32))
}

function keyed(use: KeyUse, value: string): string {
  return createHmac('sha256', key(use)).update(value).digest('base64url')
}

export const ipHash = (ip: string): string => keyed('ip', ip)
export const backupCodeHash = (code: string): string => keyed('backup', code)
export const deviceHash = (token: string): string => keyed('device', token)

/** Empreinte du couple identifiant et mot de passe, stockée dans chaque session. */
export function passwordFingerprint(): string | null {
  const { DASHBOARD_USER: user, DASHBOARD_PASSWORD: password } = process.env
  return user && password && authSecret() ? keyed('password', `${user}\0${password}`) : null
}

/** Valeur aléatoire du cookie. En base, seule son empreinte : la base seule n'ouvre rien. */
export function newToken(): string {
  return randomBytes(32).toString('base64url')
}

export function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('base64url')
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key('totp'), iv)
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64url')).join('.')
}

export function decryptSecret(sealed: string): string | null {
  try {
    const [iv, tag, data] = sealed.split('.').map((part) => Buffer.from(part, 'base64url'))
    const decipher = createDecipheriv('aes-256-gcm', key('totp'), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}
