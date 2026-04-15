#!/usr/bin/env node
/**
 * submit-indexing.mjs — Soumet des URLs à l'API Indexing via /api/indexing (prod)
 *
 * Zéro dépendance : utilise fetch natif, fs, git diff.
 * Construit les URLs canoniques directement depuis le frontmatter MDX,
 * impossible de se tromper de categorySlug.
 *
 * Usage:
 *   node scripts/submit-indexing.mjs --url https://www.toutou-gourmet.com/chien/.../slug
 *   node scripts/submit-indexing.mjs --all
 *   node scripts/submit-indexing.mjs --since HEAD~1
 *   node scripts/submit-indexing.mjs --since <git-sha>
 *   node scripts/submit-indexing.mjs --all --filter "yaourt|miel"
 *   node scripts/submit-indexing.mjs --all --dry-run
 *   node scripts/submit-indexing.mjs --action delete --url https://...
 *
 * Auth: nécessite l'env INDEXING_API_SECRET (shell ou .env.local).
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SITE_URL = 'https://www.toutou-gourmet.com'
const ENDPOINT_DEFAULT = `${SITE_URL}/api/indexing`
const MAX_PER_REQUEST = 200

// ─── Args ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { action: 'update', endpoint: ENDPOINT_DEFAULT }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    switch (a) {
      case '--url': args.url = next(); break
      case '--all': args.all = true; break
      case '--since': args.since = next(); break
      case '--filter': args.filter = next(); break
      case '--action': args.action = next(); break
      case '--endpoint': args.endpoint = next(); break
      case '--dry-run': args.dryRun = true; break
      case '-h':
      case '--help': args.help = true; break
      default:
        console.error(`Unknown arg: ${a}`)
        process.exit(2)
    }
  }
  return args
}

function printHelp() {
  console.log(`Usage:
  node scripts/submit-indexing.mjs [source] [options]

Sources (mutually exclusive, required):
  --url <url>      Soumet une URL unique
  --all            Scan tous les MDX et soumet toutes les URLs canoniques
  --since <ref>    Soumet uniquement les MDX ajoutés/modifiés depuis <ref> (git)

Options:
  --filter <regex> Filtre les URLs par regex (appliqué sur l'URL complète)
  --action update|delete  Défaut: update
  --endpoint <url> Défaut: ${ENDPOINT_DEFAULT}
  --dry-run        Affiche les URLs sans appeler l'API
  -h, --help       Affiche cette aide

Env:
  INDEXING_API_SECRET  Secret partagé avec la route (requis sauf --dry-run)`)
}

// ─── .env.local loader (zero-dep) ────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = join(ROOT, '.env.local')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) {
      let v = m[2]
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      process.env[m[1]] = v
    }
  }
}

// ─── Frontmatter parser (zero-dep, suffisant pour categorySlug) ──────────────

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const out = {}
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)$/)
    if (mm) {
      let v = mm[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      out[mm[1]] = v
    }
  }
  return out
}

// ─── URL building ────────────────────────────────────────────────────────────

function urlFromMdxFile(relPath) {
  const abs = join(ROOT, relPath)
  if (!existsSync(abs)) return null
  const slug = basename(relPath, '.mdx')
  const text = readFileSync(abs, 'utf-8')
  const fm = parseFrontmatter(text)

  if (relPath.startsWith('content/blog/')) {
    const cat = fm.categorySlug
    if (!cat) {
      console.warn(`⚠️  ${relPath} → pas de categorySlug dans le frontmatter, skip`)
      return null
    }
    return `${SITE_URL}/chien/${cat}/${slug}`
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
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.mdx')) paths.push(`content/${sub}/${f}`)
    }
  }
  return paths
}

function collectChangedMdx(since) {
  let out
  try {
    out = execSync(
      `git diff --name-only --diff-filter=AM ${since} HEAD -- content/blog content/comparatifs`,
      { cwd: ROOT, encoding: 'utf-8' }
    )
  } catch (err) {
    console.error(`❌ git diff failed: ${err.message}`)
    process.exit(1)
  }
  return out.split('\n').filter((l) => l && l.endsWith('.mdx'))
}

// ─── Submit ──────────────────────────────────────────────────────────────────

async function submitChunk(endpoint, secret, action, urls) {
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, action, urls }),
  })
  const text = await resp.text()
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${text.slice(0, 300)}`)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 300)}`)
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    process.exit(0)
  }

  loadEnvLocal()
  const secret = process.env.INDEXING_API_SECRET
  if (!secret && !args.dryRun) {
    console.error('❌ INDEXING_API_SECRET manquant (shell env ou .env.local)')
    process.exit(1)
  }

  // ── Collect ──
  let urls = []
  if (args.url) {
    urls = [args.url]
  } else if (args.all) {
    urls = collectAllMdx().map(urlFromMdxFile).filter(Boolean)
  } else if (args.since) {
    const changed = collectChangedMdx(args.since)
    if (changed.length === 0) {
      console.log(`ℹ️  Aucun MDX modifié depuis ${args.since}.`)
      process.exit(0)
    }
    urls = changed.map(urlFromMdxFile).filter(Boolean)
  } else {
    console.error('❌ Précise une source : --url, --all, --since <ref>')
    printHelp()
    process.exit(2)
  }

  if (args.filter) {
    const re = new RegExp(args.filter, 'i')
    urls = urls.filter((u) => re.test(u))
  }

  urls = [...new Set(urls)]

  if (urls.length === 0) {
    console.log('ℹ️  Aucune URL à soumettre après filtrage.')
    process.exit(0)
  }

  console.log(`🚀 ${urls.length} URL(s) — action=${args.action} endpoint=${args.endpoint}`)
  for (const u of urls) console.log(`   • ${u}`)

  if (args.dryRun) {
    console.log('✓ Dry run — rien envoyé.')
    return
  }

  // ── Submit (chunk 200) ──
  let totalSuccess = 0
  let totalErrors = 0
  for (let i = 0; i < urls.length; i += MAX_PER_REQUEST) {
    const chunk = urls.slice(i, i + MAX_PER_REQUEST)
    const data = await submitChunk(args.endpoint, secret, args.action, chunk)
    totalSuccess += data.success ?? 0
    totalErrors += data.errors ?? 0
    for (const r of data.results ?? []) {
      const icon = r.status === 'success' ? '✓' : '✗'
      console.log(`   ${icon} ${r.url} (${r.code})`)
    }
  }

  console.log('─'.repeat(60))
  console.log(`✅ ${totalSuccess}/${urls.length} succès · ❌ ${totalErrors} erreurs`)
  if (totalErrors > 0) process.exit(1)
}

main().catch((err) => {
  console.error(`❌ ${err.message ?? err}`)
  process.exit(1)
})
