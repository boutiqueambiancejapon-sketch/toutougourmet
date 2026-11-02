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

const DRY = process.argv.includes('--dry')
// Adresses gardées (ex. « www.toutou-gourmet.com,toutou-gourmet.com ») ; vide = toutes.
const HOSTS = (process.env.INGEST_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean)
const SOURCE = 'caddy-journal'
const BATCH = 500
const RETENTION_DAYS = 180
const STATIC = /^\/(_next\/|images\/|fonts\/|favicon|icons?\/|apple-touch|manifest|robots\.txt$|sitemap)|\.(js|css|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|txt|xml|json)$/i

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql:///toutou?host=/var/run/postgresql', max: 2 })

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
  const uri = req.uri || '/'
  const path = uri.split('?')[0].slice(0, 300)
  const ua = header(req.headers, 'User-Agent') || ''
  const { kind, bot, operator } = classifyUa(ua)
  if (kind === 'human' && (STATIC.test(path) || req.method !== 'GET' || path.startsWith('/api/'))) return null
  // Préchargements de Next.js (liens du menu chargés en arrière-plan) et tableau de bord du
  // propriétaire : ce ne sont pas des visites.
  const prefetch = header(req.headers, 'RSC') || header(req.headers, 'Next-Router-Prefetch') ||
    /prefetch/i.test(header(req.headers, 'Sec-Purpose') || header(req.headers, 'Purpose') || '') || /[?&]_rsc=/.test(uri)
  if (kind === 'human' && prefetch) return null
  if (String(req.host || '').startsWith('dashboard.')) return null
  const refHost = hostOf(header(req.headers, 'Referer'))
  const clientIp = req.client_ip || req.remote_ip || null
  return {
    ts: new Date(entry.ts * 1000).toISOString(),
    host: (req.host || '').slice(0, 100),
    method: (req.method || '').slice(0, 10),
    path,
    status: entry.status ?? 0,
    bytes: entry.size ?? null,
    duration_ms: entry.duration != null ? Math.round(entry.duration * 1000) : null,
    kind, bot, operator,
    device: kind === 'human' ? deviceOf(ua) : null,
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

async function main() {
  const { rows } = await pool.query('SELECT cursor FROM analytics.ingest_state WHERE source = $1', [SOURCE])
  const cursor = rows[0]?.cursor
  const args = ['-u', 'caddy', '-o', 'json', '--no-pager', ...(cursor ? ['--after-cursor', cursor] : ['--since', '-7d'])]
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
    await pool.query(`DELETE FROM analytics.hits WHERE ts < now() - interval '${RETENTION_DAYS} days'`)
    await pool.query(`DELETE FROM analytics.events WHERE ts < now() - interval '400 days'`)
  }
  console.log(`[ingest] ${seen} lignes lues, ${kept} gardées${DRY ? ' (essai, rien écrit)' : ''}`)
}

main().catch((err) => { console.error('[ingest]', err.message); process.exitCode = 1 }).finally(() => pool.end())
