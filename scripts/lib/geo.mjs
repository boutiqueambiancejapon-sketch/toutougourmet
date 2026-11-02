// @cdc mesure — pays (code ISO à 2 lettres) d'une adresse IP, lu dans la base locale DB-IP
// country lite (CC BY 4.0, format MaxMind DB). Équivalent de lib/server/geo.ts pour les scripts.
// Base ouverte une seule fois ; absente ou illisible : null partout, aucune erreur.

import { readFileSync } from 'node:fs'
import { isIP } from 'node:net'
import { Reader } from 'mmdb-lib'

const DEFAULT_DB = '/var/lib/toutou-geo/dbip-country-lite.mmdb'

let reader

function open() {
  if (reader !== undefined) return reader
  try {
    reader = new Reader(readFileSync(process.env.GEOIP_DB || DEFAULT_DB))
  } catch {
    reader = null
  }
  return reader
}

function clean(raw) {
  let ip = String(raw).trim()
  const bracket = /^\[([^\]]+)\](?::\d+)?$/.exec(ip)
  if (bracket) ip = bracket[1]
  else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.split(':')[0]
  ip = ip.split('%')[0]
  if (ip.toLowerCase().startsWith('::ffff:') && isIP(ip.slice(7)) === 4) ip = ip.slice(7)
  return ip
}

/** Code pays ISO (« FR », « US »…) pour une adresse IPv4 ou IPv6, ou null. */
export function countryOf(raw) {
  if (!raw) return null
  const ip = clean(raw)
  if (!isIP(ip)) return null
  const db = open()
  if (!db) return null
  try {
    const res = db.get(ip)
    const code = res?.country?.iso_code ?? res?.registered_country?.iso_code
    return code && /^[A-Z]{2}$/.test(code) ? code : null
  } catch {
    return null
  }
}
