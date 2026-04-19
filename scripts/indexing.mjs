#!/usr/bin/env node
/**
 * indexing.mjs — Outil local pour soumettre des URLs à Google Indexing API.
 *
 * Zéro dépendance. Appelle Google directement depuis ton Mac (pas besoin du site déployé).
 *
 * Setup (une seule fois, dans ~/.zshrc) :
 *   export GOOGLE_SA_JSON_PATH="/Users/mathias/chemin/vers/service-account.json"
 *
 * Usage :
 *   node scripts/indexing.mjs https://www.toutou-gourmet.com/chien/urgences/chocolat
 *   node scripts/indexing.mjs url1 url2 url3
 *   node scripts/indexing.mjs --all
 *   node scripts/indexing.mjs --all --filter "yaourt|miel"
 *   node scripts/indexing.mjs --since HEAD~3
 *   node scripts/indexing.mjs --delete url1
 *   node scripts/indexing.mjs --dry-run --all
 *
 * Raccourci npm :
 *   npm run index -- url1 url2
 *   npm run index -- --all
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { createSign } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SITE_URL = 'https://www.toutou-gourmet.com'
const INDEXING_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish'

// ─── Auth (JWT RS256 → OAuth2 token, zéro dépendance) ───────────────────────

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  )
  const signingInput = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(signingInput)
  signer.end()
  const signature = base64url(signer.sign(sa.private_key))
  const jwt = `${signingInput}.${signature}`

  const resp = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!resp.ok) {
    throw new Error(`Token exchange failed (${resp.status}): ${await resp.text()}`)
  }
  return (await resp.json()).access_token
}

// ─── Soumission directe à Google ─────────────────────────────────────────────

async function submitUrl(url, action, token) {
  const type = action === 'delete' ? 'URL_DELETED' : 'URL_UPDATED'
  const resp = await fetch(INDEXING_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, type }),
  })

  const text = await resp.text()
  if (resp.status === 429) return { url, ok: false, msg: '⏳ Rate limited (quota 200/jour atteint)' }
  if (!resp.ok) return { url, ok: false, msg: `❌ ${resp.status}: ${text.slice(0, 150)}` }
  return { url, ok: true, msg: '✓ Soumis' }
}

// ─── Frontmatter → URL canonique ─────────────────────────────────────────────

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const out = {}
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)$/)
    if (mm) {
      let v = mm[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1)
      out[mm[1]] = v
    }
  }
  return out
}

function urlFromMdx(relPath) {
  const abs = join(ROOT, relPath)
  if (!existsSync(abs)) return null
  const slug = basename(relPath, '.mdx')
  const fm = parseFrontmatter(readFileSync(abs, 'utf-8'))

  if (relPath.startsWith('content/blog/')) {
    if (!fm.categorySlug) return null
    return `${SITE_URL}/chien/${fm.categorySlug}/${slug}`
  }
  if (relPath.startsWith('content/comparatifs/')) {
    return `${SITE_URL}/chien/marque/${slug}`
  }
  return null
}

function collectAllMdx() {
  const paths = []
  for (const sub of ['blog', 'comparatifs']) {
    const dir = join(ROOT, 'content', sub)
    if (!existsSync(dir)) continue
    for (const f of readdirSync(dir).sort()) {
      if (f.endsWith('.mdx')) paths.push(`content/${sub}/${f}`)
    }
  }
  return paths
}

function collectChangedMdx(since) {
  try {
    const out = execSync(
      `git diff --name-only --diff-filter=AM ${since} HEAD -- content/blog content/comparatifs`,
      { cwd: ROOT, encoding: 'utf-8' }
    )
    return out.split('\n').filter((l) => l && l.endsWith('.mdx'))
  } catch {
    return []
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { urls: [], action: 'update', dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    switch (a) {
      case '--all': args.all = true; break
      case '--since': args.since = argv[++i]; break
      case '--filter': args.filter = argv[++i]; break
      case '--json': args.jsonPath = argv[++i]; break
      case '--delete': args.action = 'delete'; break
      case '--dry-run': args.dryRun = true; break
      case '-h': case '--help': args.help = true; break
      default:
        if (a.startsWith('http')) args.urls.push(a)
        else if (!a.startsWith('-')) args.urls.push(a)
        else { console.error(`Option inconnue: ${a}`); process.exit(2) }
    }
  }
  return args
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help || (args.urls.length === 0 && !args.all && !args.since)) {
    console.log(`
  🐕 Toutou Gourmet — Indexing API (outil local)

  Usage :
    node scripts/indexing.mjs <url> [url2] [url3]     Soumet des URLs
    node scripts/indexing.mjs --all                    Soumet toutes les pages MDX
    node scripts/indexing.mjs --all --filter "regex"   Filtre par regex
    node scripts/indexing.mjs --since HEAD~3           Seulement les MDX modifiés depuis ref git
    node scripts/indexing.mjs --delete <url>           Demande la suppression d'une URL

  Options :
    --json /path/to/sa.json    Chemin du fichier service account
    --dry-run                  Affiche les URLs sans soumettre
    -h, --help                 Cette aide

  Config (une fois, dans ~/.zshrc) :
    export GOOGLE_SA_JSON_PATH="/path/to/service-account.json"
`)
    process.exit(0)
  }

  // ── Charger le service account ──
  const jsonPath = args.jsonPath || process.env.GOOGLE_SA_JSON_PATH
  let sa = null
  if (jsonPath && existsSync(jsonPath)) {
    sa = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    console.log(`🔐 ${sa.client_email}\n`)
  } else if (!args.dryRun) {
    console.error('❌ Chemin du JSON manquant.')
    console.error('   Passe --json /path/to/sa.json')
    console.error('   ou ajoute dans ~/.zshrc : export GOOGLE_SA_JSON_PATH="/path/to/sa.json"')
    process.exit(1)
  }

  // ── Collecter les URLs ──
  let urls = args.urls
  if (args.all) {
    urls = collectAllMdx().map(urlFromMdx).filter(Boolean)
  } else if (args.since) {
    const changed = collectChangedMdx(args.since)
    if (changed.length === 0) {
      console.log(`ℹ️  Aucun MDX modifié depuis ${args.since}`)
      return
    }
    urls = changed.map(urlFromMdx).filter(Boolean)
  }

  if (args.filter) {
    const re = new RegExp(args.filter, 'i')
    urls = urls.filter((u) => re.test(u))
  }

  urls = [...new Set(urls)]
  if (urls.length === 0) {
    console.log('ℹ️  Aucune URL à soumettre.')
    return
  }

  const actionLabel = args.action === 'delete' ? 'DELETE' : 'UPDATE'
  console.log(`🚀 ${urls.length} URL(s) — ${actionLabel}\n`)
  for (const u of urls) console.log(`   ${u}`)
  console.log()

  if (args.dryRun) {
    console.log('✓ Dry run — rien envoyé.')
    return
  }

  // ── Auth ──
  process.stdout.write('🔑 Obtention du token... ')
  const token = await getAccessToken(sa)
  console.log('OK\n')

  // ── Soumission ──
  let success = 0
  let errors = 0

  for (let i = 0; i < urls.length; i++) {
    const result = await submitUrl(urls[i], args.action, token)
    if (result.ok) {
      success++
      console.log(`   ${result.msg}  ${result.url}`)
    } else {
      errors++
      console.log(`   ${result.msg}  ${result.url}`)
      if (result.msg.includes('Rate limited')) {
        console.log(`\n⏳ Quota Google atteint. ${urls.length - i - 1} URL(s) restantes non soumises.`)
        errors += urls.length - i - 1
        break
      }
    }
    // 250ms entre chaque requête
    if (i < urls.length - 1) await new Promise((r) => setTimeout(r, 250))
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ ${success}/${urls.length} soumises · ❌ ${errors} erreurs`)
  if (errors > 0) process.exit(1)
}

main().catch((e) => {
  console.error(`\n❌ ${e.message ?? e}`)
  process.exit(1)
})
