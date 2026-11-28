#!/usr/bin/env node
// @cdc mesure — lit les journaux d'accès de Caddy (JSON, dans journald) et les range dans
// analytics.hits. Lancé toutes les minutes par toutou-ingest.timer. Reprend là où il
// s'était arrêté grâce au curseur journald (analytics.ingest_state).
// Humains : seules les pages sont gardées (pas les fichiers statiques), sans IP ni User-Agent.
// Robots : toutes les requêtes, avec IP et User-Agent (repérage des faux robots).
// Pays (code ISO, base locale DB-IP, scripts/lib/geo.mjs) pour tous ; l'IP humaine sert à le lire puis est oubliée.
// Usage : DATABASE_URL=postgresql:///toutou?host=/var/run/postgresql node scripts/ingest-caddy-logs.mjs [--dry]

import { spawn } from 'node:child_process'
import readline from 'node:readline'
import pg from 'pg'
import { aiReferrer, classifyUa, deviceOf } from './lib/bots.mjs'
import { countryOf } from './lib/geo.mjs'
import { buildStaticList, findFingerprint, isStaticIgnored, visitorKey } from './lib/analytics-ignore.mjs'

const DRY = process.argv.includes('--dry')
// Adresses gardées (ex. « www.toutou-gourmet.com,toutou-gourmet.com ») ; vide = toutes.
const HOSTS = (process.env.INGEST_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean)
const SOURCE = 'caddy-journal'
const BATCH = 500
const RETENTION_DAYS = 180
const STATIC = /^\/(_next\/|images\/|fonts\/|favicon|icons?\/|apple-touch|manifest|robots\.txt$|sitemap)|\.(js|css|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|txt|xml|json)$/i
// Images de partage et icônes générées par Next.js (/blog/x/opengraph-image-ab12cd), fiches PDF : pas des pages.
const ASSET = /(^|\/)(opengraph-image|twitter-image)(-[a-z0-9]+)?(\.\w+)?$|(^|\/)(apple-)?icon\d*(-[a-z0-9]+)?\.\w+$|(^|\/)(apple-)?icon\d*$|\/sw\.js$|\.(pdf|webmanifest)$/i

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql:///toutou?host=/var/run/postgresql', max: 2 })

// @cdc mesure — visites à ne pas compter (scripts/lib/analytics-ignore.mjs). Le serveur et
// ANALYTICS_IGNORED_IPS : toutes les requêtes, robots compris. Le propriétaire, par empreinte :
// ses pages vues humaines. Les 20 dernières secondes du journal attendent le passage suivant : le
// site a ainsi le temps de recevoir l'événement de la page et de poser l'empreinte d'une nouvelle adresse.
const STATIC_IGNORED = buildStaticList()
const SETTLE_DELAY = '-20s'
let ownerRows = []
const ownerSeen = new Map()

function isOwnerIp(ip) {
  const key = visitorKey(ip)
  if (!key) return false
  if (!ownerSeen.has(key)) ownerSeen.set(key, findFingerprint(ownerRows, ip) !== null)
  return ownerSeen.get(key)
}

/** Table absente (SQL pas encore posé) : on ingère comme avant, seule la liste fixe s'applique. */
async function loadOwnerRows() {
  try {
    if (!DRY) await pool.query('DELETE FROM analytics.ignored_ips WHERE expires_at <= now()')
    const { rows } = await pool.query('SELECT salt, hash FROM analytics.ignored_ips WHERE expires_at > now()')
    ownerRows = rows
  } catch (err) {
    console.error('[ingest] empreintes illisibles :', err.message)
  }
}

function header(h, name) {
  const v = h?.[name] ?? h?.[name.toLowerCase()]
  return Array.isArray(v) ? v[0] : v
}

function hostOf(url) {
  if (!url) return null
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return null }
}

/** Une ligne de journal Caddy → une ligne analytics.hits, ou null si elle ne nous intéresse pas. */
function toHit(entry) {
  const req = entry.request
  if (!req || !String(entry.logger || '').startsWith('http.log.access')) return null
  if (HOSTS.length && !HOSTS.includes(String(req.host || '').toLowerCase().split(':')[0])) return null
  const clientIp = req.client_ip || req.remote_ip || null
  if (isStaticIgnored(clientIp, STATIC_IGNORED)) return null
  const uri = req.uri || '/'
  const path = uri.split('?')[0].slice(0, 300)
  const ua = header(req.headers, 'User-Agent') || ''
  let { kind, bot, operator } = classifyUa(ua)
  // @cdc mesure — filtre anti-robots (2026-11-21) : un vrai navigateur envoie toujours Accept-Language ; un
  // navigateur sans tête ou un Chrome très ancien est un robot qui se fait passer pour une personne.
  if (kind === 'human' && req.method === 'GET') {
    const lang = header(req.headers, 'Accept-Language')
    const chrome = /Chrome\/(\d+)\./.exec(ua)
    if (!lang) { kind = 'scraper'; bot = 'sans langue' }
    else if (/HeadlessChrome|PhantomJS|Electron\//.test(ua)) { kind = 'scraper'; bot = 'navigateur sans tête' }
    else if (chrome && Number(chrome[1]) < 100) { kind = 'scraper'; bot = 'navigateur périmé' }
  }
  if ((kind === 'human' || kind === 'scraper') && (STATIC.test(path) || ASSET.test(path) || req.method !== 'GET' || path.startsWith('/api/'))) return null
  // Préchargements de Next.js (liens du menu chargés en arrière-plan) et tableau de bord du
  // propriétaire : ce ne sont pas des visites.
  const prefetch = header(req.headers, 'RSC') || header(req.headers, 'Next-Router-Prefetch') ||
    /prefetch/i.test(header(req.headers, 'Sec-Purpose') || header(req.headers, 'Purpose') || '') || /[?&]_rsc=/.test(uri)
  if ((kind === 'human' || kind === 'scraper') && prefetch) return null
  if (String(req.host || '').startsWith('dashboard.')) return null
  if (kind === 'human' && isOwnerIp(clientIp)) return null
  const refHost = hostOf(header(req.headers, 'Referer'))
  return {
    ts: new Date(entry.ts * 1000).toISOString(),
    host: (req.host || '').slice(0, 100),
    method: (req.method || '').slice(0, 10),
    path,
    status: entry.status ?? 0,
    bytes: entry.size ?? null,
    duration_ms: entry.duration != null ? Math.round(entry.duration * 1000) : null,
    kind, bot, operator,
    device: kind === 'human' || kind === 'scraper' ? deviceOf(ua) : null,
    ref_host: refHost && refHost !== (req.host || '').replace(/^www\./, '') ? refHost.slice(0, 100) : null,
    ref_ai: kind === 'human' ? aiReferrer(refHost, uri) : null,
    ip: kind === 'human' ? null : clientIp,
    ua: kind === 'human' ? null : ua.slice(0, 300),
    country: countryOf(clientIp),
  }
}

const COLS = ['ts', 'host', 'method', 'path', 'status', 'bytes', 'duration_ms', 'kind', 'bot', 'operator', 'device', 'ref_host', 'ref_ai', 'ip', 'ua', 'country']

async function flush(rows, cursor) {
  if (DRY) { for (const r of rows.slice(0, 5)) console.log(r); return }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    if (rows.length) {
      const values = []
      const tuples = rows.map((r, i) => `(${COLS.map((_, j) => `$${i * COLS.length + j + 1}`).join(',')})`)
      for (const r of rows) for (const c of COLS) values.push(r[c])
      await client.query(`INSERT INTO analytics.hits (${COLS.join(',')}) VALUES ${tuples.join(',')}`, values)
    }
    if (cursor) {
      await client.query(
        `INSERT INTO analytics.ingest_state (source, cursor, updated_at) VALUES ($1, $2, now())
         ON CONFLICT (source) DO UPDATE SET cursor = EXCLUDED.cursor, updated_at = now()`,
        [SOURCE, cursor],
      )
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// @cdc mesure — filtre anti-robots, seconde passe : une page vue « humaine » sans balise JS (événement Pageview de la
// même page, même appareil, à 2 minutes près) et sans référent est un robot qui imite un navigateur. Les pages des
// 5 dernières minutes attendent leur balise. Le référent externe (Google…) garde le bénéfice du doute.
export const RECLASS_SQL = `UPDATE analytics.hits h SET kind = 'scraper', bot = 'sans balise JS'
  WHERE h.kind = 'human' AND h.ref_host IS NULL AND h.ts < now() - interval '5 minutes' AND h.ts >= $1
    AND NOT EXISTS (SELECT 1 FROM analytics.events e WHERE e.name = 'Pageview' AND e.page = h.path
      AND e.ts BETWEEN h.ts - interval '120 seconds' AND h.ts + interval '120 seconds' AND e.device IS NOT DISTINCT FROM h.device)`

// @cdc mesure — robots qui exécutent le JavaScript (la balise part quand même) : page vue sans référent ni page
// précédente depuis un pays hors des marchés du site, ou plus de 30 pages vues en une heure pour une même empreinte.
// Renommées « Pageview (robot) » : gardées pour contrôle, hors de tous les comptes de personnes.
const MARKETS = (process.env.ANALYTICS_MARKETS || 'FR,BE,CH,LU,MC,CA,RE,GP,MQ,GF,YT,NC,PF,PM,MA,DZ,TN,SN,CI').split(',')
export const RECLASS_EVENTS_SQL = `UPDATE analytics.events SET name = 'Pageview (robot)'
  WHERE name = 'Pageview' AND ts >= $1 AND ts < now() - interval '5 minutes' AND (
    (ref_host IS NULL AND props->>'from' IS NULL AND (country IS NULL OR NOT country = ANY($2::text[])))
    OR visitor IN (SELECT visitor FROM analytics.events WHERE name IN ('Pageview', 'Pageview (robot)') AND ts >= $1 AND visitor IS NOT NULL
                    GROUP BY visitor, date_trunc('hour', ts) HAVING count(*) > 30))`

// @cdc mesure — page vue « humaine » sans référent depuis un pays hors des marchés du site : robot (28/11/2026 : visites directes ×8
// depuis le 21/11, à 85 % des États-Unis, de Singapour, du Brésil et de Chine). Même règle que les balises ci-dessus.
export const RECLASS_MARKETS_SQL = `UPDATE analytics.hits SET kind = 'scraper', bot = 'hors marchés, sans référent'
  WHERE kind = 'human' AND ref_host IS NULL AND ts >= $1 AND (country IS NULL OR NOT country = ANY($2::text[]))`

async function main() {
  const { rows } = await pool.query('SELECT cursor FROM analytics.ingest_state WHERE source = $1', [SOURCE])
  const cursor = rows[0]?.cursor
  await loadOwnerRows()
  const args = ['-u', 'caddy', '-o', 'json', '--no-pager', '--until', SETTLE_DELAY, ...(cursor ? ['--after-cursor', cursor] : ['--since', '-7d'])]
  const jc = spawn('journalctl', args, { stdio: ['ignore', 'pipe', 'inherit'] })
  const rl = readline.createInterface({ input: jc.stdout })

  let batch = []
  let lastCursor = null
  let seen = 0
  let kept = 0
  for await (const line of rl) {
    let rec
    try { rec = JSON.parse(line) } catch { continue }
    lastCursor = rec.__CURSOR || lastCursor
    seen++
    const msg = typeof rec.MESSAGE === 'string' ? rec.MESSAGE : ''
    if (!msg.startsWith('{')) continue
    let entry
    try { entry = JSON.parse(msg) } catch { continue }
    const hit = toHit(entry)
    if (hit) { batch.push(hit); kept++ }
    if (batch.length >= BATCH) { await flush(batch, lastCursor); batch = [] }
  }
  await flush(batch, lastCursor)
  const code = await new Promise((res) => jc.on('close', res))
  if (code !== 0 && seen === 0) throw new Error(`journalctl a échoué (code ${code}) : droits de lecture du journal ?`)

  if (!DRY) {
    const re = await pool.query(RECLASS_SQL, [new Date(Date.now() - 2 * 3600_000).toISOString()])
    if (re.rowCount) console.log(`[ingest] ${re.rowCount} pages vues reclassées en robots (sans balise JS)`)
    const mk = await pool.query(RECLASS_MARKETS_SQL, [new Date(Date.now() - 2 * 3600_000).toISOString(), MARKETS])
    if (mk.rowCount) console.log(`[ingest] ${mk.rowCount} pages vues hors marchés sans référent reclassées en robots`)
    const ev = await pool.query(RECLASS_EVENTS_SQL, [new Date(Date.now() - 2 * 3600_000).toISOString(), MARKETS])
    if (ev.rowCount) console.log(`[ingest] ${ev.rowCount} balises de robots écartées`)
    await pool.query(`DELETE FROM analytics.hits WHERE ts < now() - interval '${RETENTION_DAYS} days'`)
    await pool.query(`DELETE FROM analytics.events WHERE ts < now() - interval '400 days'`)
  }
  console.log(`[ingest] ${seen} lignes lues, ${kept} gardées${DRY ? ' (essai, rien écrit)' : ''}`)
}

main().catch((err) => { console.error('[ingest]', err.message); process.exitCode = 1 }).finally(() => pool.end())
