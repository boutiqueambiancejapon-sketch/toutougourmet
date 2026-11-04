// @cdc tableau de bord — règles de la connexion, sans base ni réseau : testées dans
// scripts/test-dashboard-login.ts. Chaque nombre ici est une décision (DECISIONS.md).

const MINUTE = 60_000
const HOUR = 60 * MINUTE

export const SESSION_COOKIE = '__Host-tg_dashboard'
export const DEVICE_COOKIE = '__Host-tg_dashboard_device'
export const DEVICE_COOKIE_DAYS = 365

export const ABSOLUTE_MS = 12 * HOUR
export const IDLE_MS = 2 * HOUR
/** Mot de passe accepté, second facteur attendu. */
export const PENDING_MS = 10 * MINUTE
/** Mot de passe accepté, aucun facteur enrôlé : assez long pour installer une application. */
export const ENROLL_MS = 30 * MINUTE
export const TOUCH_EVERY_MS = MINUTE
/** Ajouter ou retirer un facteur demande une vérification récente. */
export const RECENT_FACTOR_MS = 15 * MINUTE
export const CHALLENGE_MS = 5 * MINUTE

export const LIMIT_WINDOW_MS = 15 * MINUTE
export const MAX_IP_FAILURES = 5
export const MAX_GLOBAL_PASSWORD_FAILURES = 30
export const MAX_GLOBAL_FACTOR_FAILURES = 10
/** Essais de second facteur sur une même session avant de redemander le mot de passe. */
export const MAX_SESSION_FACTOR_FAILURES = 5
export const ALERT_WINDOW_MS = 30 * MINUTE
export const ALERT_FAILURES_AT = 5
export const ALERT_FAILURES_EVERY = 20
export const JOURNAL_DAYS = 90

export type SessionStage = 'second_factor' | 'enroll' | 'full'
export type AttemptKind = 'password' | 'passkey' | 'totp' | 'backup'

export const ROOT = '/tableau-de-bord'
export const LOGIN_PATH = `${ROOT}/connexion`
export const VERIFY_PATH = `${LOGIN_PATH}/verification`
export const ENROLL_PATH = `${LOGIN_PATH}/enrolement`
export const SECURITY_PATH = `${ROOT}/securite`
export const API_PATH = `${LOGIN_PATH}/api`

export interface SessionClock {
  stage: SessionStage
  passwordFp: string
  lastSeenAt: Date
  expiresAt: Date
}

/** Session encore valable : ni expirée (absolue ou inactivité), ni antérieure au mot de passe courant. */
export function sessionIsLive(session: SessionClock, currentPasswordFp: string, now: Date): boolean {
  if (session.passwordFp !== currentPasswordFp) return false
  if (session.expiresAt.getTime() <= now.getTime()) return false
  return now.getTime() - session.lastSeenAt.getTime() < IDLE_MS
}

export function stageLifetimeMs(stage: SessionStage): number {
  if (stage === 'full') return ABSOLUTE_MS
  return stage === 'enroll' ? ENROLL_MS : PENDING_MS
}

export function stageHref(stage: SessionStage, next: unknown = ROOT): string {
  if (stage === 'full') return safeNext(next)
  return stage === 'enroll' ? ENROLL_PATH : VERIFY_PATH
}

export function factorIsRecent(factorAt: Date | null, now: Date): boolean {
  return factorAt !== null && now.getTime() - factorAt.getTime() < RECENT_FACTOR_MS
}

export interface FailureCounts {
  ip: number
  global: number
}

/**
 * Vrai si l'essai doit être refusé. Un appareil déjà connu échappe à la limite globale : une
 * attaque répartie sur plusieurs adresses ne doit pas fermer la porte au propriétaire. La limite
 * par adresse s'applique à tout le monde.
 */
export function attemptBlocked(kind: AttemptKind, counts: FailureCounts, knownDevice: boolean): boolean {
  if (counts.ip >= MAX_IP_FAILURES) return true
  if (knownDevice) return false
  return counts.global >= (kind === 'password' ? MAX_GLOBAL_PASSWORD_FAILURES : MAX_GLOBAL_FACTOR_FAILURES)
}

export function failuresDeserveAlert(failures: number): boolean {
  return failures === ALERT_FAILURES_AT || (failures > ALERT_FAILURES_AT && (failures - ALERT_FAILURES_AT) % ALERT_FAILURES_EVERY === 0)
}

/** Retour après connexion : uniquement un chemin du tableau de bord, jamais un autre site. */
export function safeNext(value: unknown): string {
  if (typeof value !== 'string' || value.length > 300) return ROOT
  if (!/^\/tableau-de-bord(?:[/?#]|$)/.test(value)) return ROOT
  if (value.includes('\\') || value.includes('//') || /[\r\n\t]/.test(value)) return ROOT
  return value.startsWith(LOGIN_PATH) ? ROOT : value
}

/** Routes qui rendent des données : 401 plutôt qu'une redirection vers une page HTML. */
const DATA_ROUTES = [`${ROOT}/direct`, `${ROOT}/conversions/inscrits/export`]

export type RouteKind = 'public' | 'data' | 'page'

export function routeKind(pathname: string, method: string): RouteKind {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (path === LOGIN_PATH || path.startsWith(`${LOGIN_PATH}/`)) return 'public'
  if (DATA_ROUTES.includes(path)) return 'data'
  return method === 'GET' || method === 'HEAD' ? 'page' : 'data'
}

/** Le sondage de la vue « En direct » ne compte pas comme une activité du propriétaire. */
export function routeCountsAsActivity(pathname: string): boolean {
  return pathname !== `${ROOT}/direct`
}

/** Appareil simplifié pour le journal : système et navigateur, rien de plus. */
export function deviceLabel(userAgent: string | null): string {
  const ua = userAgent ?? ''
  const system =
    (/iPhone/.test(ua) && 'iPhone') ||
    (/iPad/.test(ua) && 'iPad') ||
    (/Android/.test(ua) && 'Android') ||
    (/Mac OS X|Macintosh/.test(ua) && 'Mac') ||
    (/Windows/.test(ua) && 'Windows') ||
    (/Linux/.test(ua) && 'Linux') ||
    'Appareil inconnu'
  const browser =
    (/Edg(A|iOS)?\//.test(ua) && 'Edge') ||
    (/(FxiOS|Firefox)\//.test(ua) && 'Firefox') ||
    (/(CriOS|Chrome)\//.test(ua) && 'Chrome') ||
    (/Safari\//.test(ua) && 'Safari') ||
    ''
  return browser ? `${system} · ${browser}` : system
}
