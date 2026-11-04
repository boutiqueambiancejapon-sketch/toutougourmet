// @cdc mesure — visites à ne pas compter (propriétaire, serveur). Logique pure, partagée entre le
// script d'ingestion (scripts/ingest-caddy-logs.mjs) et le site (lib/server/analytics-ignore.ts).
// Liste fixe : le serveur lui-même, plus ANALYTICS_IGNORED_IPS (adresses ou plages, séparées par
// des virgules). Empreintes : adresses du moment du propriétaire, chacune salée à part, jamais
// l'adresse en clair. IPv6 : le /64 seulement, car un iPhone change d'adresse dans son préfixe.

import { createHash, randomBytes } from 'node:crypto'
import { BlockList, isIP } from 'node:net'

/** Le serveur, vu depuis Internet (tâches, surveillance, Playwright) et en local. */
export const SERVER_IPS = ['85.190.127.13', '2001:880:a:343::419', '127.0.0.1', '::1']

/** Durée de validité d'une empreinte, prolongée tant que le propriétaire est actif. */
export const IGNORED_IP_TTL_HOURS = 12

/**
 * Nettoie une adresse venue d'un en-tête ou d'un journal ; chaîne vide si elle est invalide.
 * @param {string | null | undefined} raw
 */
export function cleanIp(raw) {
  let ip = String(raw ?? '').trim()
  const bracket = /^\[([^\]]+)\](?::\d+)?$/.exec(ip)
  if (bracket) ip = bracket[1]
  else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.split(':')[0]
  ip = ip.split('%')[0]
  if (ip.toLowerCase().startsWith('::ffff:') && isIP(ip.slice(7)) === 4) ip = ip.slice(7)
  return isIP(ip) ? ip : ''
}

/**
 * Les 4 premiers groupes d'une IPv6 (son /64), en forme normalisée.
 * @param {string} ip
 */
function prefix64(ip) {
  const [head, tail] = ip.toLowerCase().split('::')
  const left = head ? head.split(':') : []
  const right = tail ? tail.split(':') : []
  const missing = 8 - left.length - right.length
  const groups = [...left, ...Array.from({ length: Math.max(missing, 0) }, () => '0'), ...right]
  return groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':')
}

/**
 * Clé d'un visiteur : l'IPv4 entière, ou le /64 d'une IPv6. Chaîne vide si l'adresse est invalide.
 * @param {string | null | undefined} raw
 */
export function visitorKey(raw) {
  const ip = cleanIp(raw)
  if (!ip) return ''
  return isIP(ip) === 6 ? `${prefix64(ip)}::/64` : ip
}

/**
 * Liste fixe : le serveur, plus ANALYTICS_IGNORED_IPS. Une entrée invalide est écartée sans erreur.
 * @param {string | undefined} [extra]
 */
export function buildStaticList(extra = process.env.ANALYTICS_IGNORED_IPS) {
  const list = new BlockList()
  for (const raw of [...SERVER_IPS, ...String(extra ?? '').split(',')]) {
    const [address, bits] = raw.trim().split('/')
    const ip = cleanIp(address)
    if (!ip) continue
    const family = isIP(ip) === 6 ? 'ipv6' : 'ipv4'
    if (bits === undefined) list.addAddress(ip, family)
    else if (/^\d+$/.test(bits) && Number(bits) <= (family === 'ipv6' ? 128 : 32)) list.addSubnet(ip, Number(bits), family)
  }
  return list
}

/**
 * Vrai pour une adresse de la liste fixe. « local » : requête sans X-Forwarded-For (lib/server/rate-window.ts).
 * @param {string | null | undefined} raw
 * @param {BlockList} list
 */
export function isStaticIgnored(raw, list) {
  if (raw === 'local') return true
  const ip = cleanIp(raw)
  if (!ip) return false
  return list.check(ip, isIP(ip) === 6 ? 'ipv6' : 'ipv4')
}

/**
 * @param {string} salt
 * @param {string} key
 */
function digest(salt, key) {
  return createHash('sha256').update(`${salt}:${key}`).digest('hex')
}

/**
 * Nouvelle empreinte d'une adresse, ou null si elle est invalide.
 * @param {string | null | undefined} raw
 */
export function newFingerprint(raw) {
  const key = visitorKey(raw)
  if (!key) return null
  const salt = randomBytes(16).toString('hex')
  return { salt, hash: digest(salt, key) }
}

/**
 * Empreinte de cette adresse parmi les lignes de analytics.ignored_ips, ou null.
 * @param {{ salt: string, hash: string }[]} rows
 * @param {string | null | undefined} raw
 */
export function findFingerprint(rows, raw) {
  const key = visitorKey(raw)
  if (!key) return null
  return rows.find((row) => digest(row.salt, key) === row.hash) ?? null
}
