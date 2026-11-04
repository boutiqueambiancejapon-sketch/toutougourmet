import { cookies } from 'next/headers'

// @cdc tableau de bord — page des inscrits. La recherche par adresse ne passe jamais dans l'URL :
// Caddy journalise l'URL complète de chaque requête. Le formulaire l'envoie en POST (action
// serveur), elle vit dans un cookie httpOnly limité à la page (Caddy masque les cookies dans ses
// journaux), 15 minutes au plus.

export const SEARCH_COOKIE = 'tdb_recherche'
export const SEARCH_PATH = '/tableau-de-bord/conversions/inscrits'
export const SEARCH_MAX = 120
export const SEARCH_MAX_AGE = 15 * 60

export type ListKind = 'lettre' | 'comptes' | 'envois'

export function parseList(value: string | string[] | undefined): ListKind {
  const list = Array.isArray(value) ? value[0] : value
  return list === 'comptes' || list === 'envois' ? list : 'lettre'
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(n) && n > 1 && n < 10_000 ? n : 1
}

export function cleanQuery(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, SEARCH_MAX) : ''
}

/**
 * Valeur du cookie en base64url : un « % » tapé dans la recherche faisait échouer le décodage de
 * Next pendant la redirection de l'action serveur (URIError, réponse 500).
 */
export const encodeSearch = (query: string): string => Buffer.from(query, 'utf8').toString('base64url')

export async function readSearch(): Promise<string> {
  const raw = (await cookies()).get(SEARCH_COOKIE)?.value
  return raw ? cleanQuery(Buffer.from(raw, 'base64url').toString('utf8')) : ''
}

export function listHref(list: ListKind, page = 1): string {
  const params = new URLSearchParams()
  if (list !== 'lettre') params.set('liste', list)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${SEARCH_PATH}?${qs}` : SEARCH_PATH
}
