import { readFileSync, statSync } from 'node:fs'
import { isIP } from 'node:net'
import { Reader, type CountryResponse } from 'mmdb-lib'

// @cdc mesure — pays du visiteur (code ISO à 2 lettres) lu dans une base locale DB-IP country lite
// (CC BY 4.0, format MaxMind DB). La base reste en mémoire ; une fois par heure, on regarde si le
// fichier a changé (mise à jour mensuelle, scripts/update-geoip.sh). Absente ou illisible, tout
// renvoie null sans erreur. L'adresse IP sert à la lecture puis est oubliée : jamais écrite.
// Même logique côté script d'ingestion : scripts/lib/geo.mjs.

const DEFAULT_DB = '/var/lib/toutou-geo/dbip-country-lite.mmdb'

const CHECK_MS = 60 * 60 * 1000

let reader: Reader<CountryResponse> | null = null
let loadedMtime = -1
let checkedAt = 0

function open(): Reader<CountryResponse> | null {
  const now = Date.now()
  if (now - checkedAt < CHECK_MS) return reader
  checkedAt = now
  const path = process.env.GEOIP_DB || DEFAULT_DB
  try {
    const mtime = statSync(path).mtimeMs
    if (mtime !== loadedMtime) {
      reader = new Reader<CountryResponse>(readFileSync(path))
      loadedMtime = mtime
    }
  } catch {
    // Fichier absent ou illisible : on garde la base déjà chargée (null si aucune).
  }
  return reader
}

/** Nettoie une adresse venue d'un en-tête : crochets IPv6, port IPv4, zone, IPv4 mappée. */
function clean(raw: string): string {
  let ip = raw.trim()
  const bracket = /^\[([^\]]+)\](?::\d+)?$/.exec(ip)
  if (bracket) ip = bracket[1]
  else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.split(':')[0]
  ip = ip.split('%')[0]
  if (ip.toLowerCase().startsWith('::ffff:') && isIP(ip.slice(7)) === 4) ip = ip.slice(7)
  return ip
}

/** Code pays ISO (« FR », « US »…) pour une adresse IPv4 ou IPv6, ou null. */
export function countryOf(raw: string | null | undefined): string | null {
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
