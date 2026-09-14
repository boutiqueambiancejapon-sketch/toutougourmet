#!/usr/bin/env node
/**
 * translation-queue.mjs — Pilote la traduction quotidienne FR → NL-BE.
 *
 * Zéro dépendance. Trois modes :
 *   --status               Couverture : combien d'articles FR ont une version NL
 *   --next [N]             Les N prochains articles FR à traduire (défaut 2)
 *   --scaffold <fr-slug> --slug <nl-slug>
 *                          Crée content/nl/blog/<nl-slug>.mdx avec le frontmatter
 *                          correct, `draft: true` et le corps FR comme base
 *   --lint                 Vérifie les fichiers NL (cohérence + résidus français)
 *
 * Usage:
 *   node scripts/translation-queue.mjs --status
 *   node scripts/translation-queue.mjs --next 2
 *   node scripts/translation-queue.mjs --next 5 --category urgences
 *   node scripts/translation-queue.mjs --scaffold chien-peut-manger-fromage --slug mag-mijn-hond-kaas-eten
 *   node scripts/translation-queue.mjs --lint
 *
 * Le scaffold pose `draft: true` : tant que le champ est là, l'article est
 * exclu du build, du sitemap et des hreflang. On le retire une fois la
 * traduction relue — c'est le seul geste qui publie.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const FR_DIR = join(ROOT, 'content/blog')
const NL_DIR = join(ROOT, 'content/nl/blog')
const SITE_URL = 'https://www.toutou-gourmet.com'

// Organismes français qui n'ont rien à faire dans un article belge.
// Le skill `.claude/skills/boileau-nl/SKILL.md` détaille les remplacements.
const FRENCH_ONLY_TERMS = ['CNITV', 'CAPAE', 'ANSES', 'AFSCA', 'NVWA']

// ─── Args ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    switch (a) {
      case '--status': args.status = true; break
      case '--next': {
        const v = argv[i + 1]
        args.next = v && !v.startsWith('--') ? Number(next()) : 2
        break
      }
      case '--category': args.category = next(); break
      case '--scaffold': args.scaffold = next(); break
      case '--slug': args.slug = next(); break
      case '--lint': args.lint = true; break
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
  node scripts/translation-queue.mjs --status
  node scripts/translation-queue.mjs --next [N] [--category <fr-slug>]
  node scripts/translation-queue.mjs --scaffold <fr-slug> --slug <nl-slug>
  node scripts/translation-queue.mjs --lint`)
}

// ─── Frontmatter ─────────────────────────────────────────────────────────────

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { fm: {}, body: text }
  const fm = {}
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)$/)
    if (!mm) continue
    let v = mm[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    fm[mm[1]] = v
  }
  return { fm, body: m[2] }
}

function readArticles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const { fm, body } = splitFrontmatter(readFileSync(join(dir, f), 'utf-8'))
      return { file: f, slug: f.replace(/\.mdx$/, ''), fm, body }
    })
}

function nlCategories() {
  return JSON.parse(readFileSync(join(ROOT, 'data/nl-categories.json'), 'utf-8'))
}

// ─── Modes ───────────────────────────────────────────────────────────────────

function translatedFrSlugs(nl) {
  return new Set(nl.map((a) => a.fm.translationOf).filter(Boolean))
}

function status() {
  const fr = readArticles(FR_DIR)
  const nl = readArticles(NL_DIR)
  const done = translatedFrSlugs(nl)
  const drafts = nl.filter((a) => a.fm.draft === 'true')
  const pct = fr.length ? ((done.size / fr.length) * 100).toFixed(1) : '0.0'

  console.log(`Articles FR      : ${fr.length}`)
  console.log(`Traduits en NL   : ${done.size} (${pct} %)`)
  console.log(`Dont brouillons  : ${drafts.length}${drafts.length ? ' — non publiés' : ''}`)
  console.log(`Restants         : ${fr.length - done.size}`)

  const byCategory = new Map()
  for (const a of fr) {
    if (done.has(a.slug)) continue
    const c = a.fm.categorySlug || '(sans catégorie)'
    byCategory.set(c, (byCategory.get(c) ?? 0) + 1)
  }
  if (byCategory.size) {
    console.log('\nÀ traduire par catégorie :')
    for (const [cat, n] of [...byCategory].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(4)}  ${cat}`)
    }
  }
  if (drafts.length) {
    console.log('\nBrouillons en attente de relecture :')
    for (const d of drafts) console.log(`  content/nl/blog/${d.file}`)
  }
}

function next(count, categoryFilter) {
  const fr = readArticles(FR_DIR)
  const done = translatedFrSlugs(readArticles(NL_DIR))
  const known = new Set(nlCategories().map((c) => c.frSlug))

  const queue = fr
    .filter((a) => !done.has(a.slug))
    .filter((a) => a.fm.categorySlug && known.has(a.fm.categorySlug))
    .filter((a) => !categoryFilter || a.fm.categorySlug === categoryFilter)
    // Les plus récents d'abord : ce sont ceux dont le sujet est encore chaud
    // et dont les sources sont les plus fraîches.
    .sort((a, b) => String(b.fm.date).localeCompare(String(a.fm.date)))
    .slice(0, count)

  if (!queue.length) {
    console.log('Rien à traduire avec ces critères.')
    return
  }

  for (const a of queue) {
    console.log(`\n${a.slug}`)
    console.log(`  catégorie : ${a.fm.categorySlug} (${a.fm.category})`)
    console.log(`  date      : ${a.fm.date}`)
    console.log(`  titre     : ${a.fm.title}`)
    console.log(`  source    : ${SITE_URL}/chien/${a.fm.categorySlug}/${a.slug}`)
    console.log(`  scaffold  : node scripts/translation-queue.mjs --scaffold ${a.slug} --slug <slug-nl>`)
  }
  const skipped = fr.filter((a) => a.fm.categorySlug && !known.has(a.fm.categorySlug))
  if (skipped.length) {
    console.log(`\n⚠️  ${skipped.length} article(s) FR ignoré(s) : categorySlug absent de data/nl-categories.json`)
  }
}

function scaffold(frSlug, nlSlug) {
  if (!nlSlug) {
    console.error('❌ --scaffold exige aussi --slug <slug-nl>')
    process.exit(2)
  }
  const frPath = join(FR_DIR, `${frSlug}.mdx`)
  if (!existsSync(frPath)) {
    console.error(`❌ Article FR introuvable : content/blog/${frSlug}.mdx`)
    process.exit(1)
  }
  const outPath = join(NL_DIR, `${nlSlug}.mdx`)
  if (existsSync(outPath)) {
    console.error(`❌ Existe déjà : content/nl/blog/${nlSlug}.mdx`)
    process.exit(1)
  }
  const already = readArticles(NL_DIR).find((a) => a.fm.translationOf === frSlug)
  if (already) {
    console.error(`❌ ${frSlug} est déjà traduit dans content/nl/blog/${already.file}`)
    process.exit(1)
  }

  const { fm, body } = splitFrontmatter(readFileSync(frPath, 'utf-8'))
  const cat = nlCategories().find((c) => c.frSlug === fm.categorySlug)
  if (!cat) {
    console.error(`❌ categorySlug "${fm.categorySlug}" absent de data/nl-categories.json`)
    process.exit(1)
  }
  const today = new Date().toISOString().slice(0, 10)

  const header = [
    '---',
    `title: "À TRADUIRE — ${fm.title}"`,
    `description: "À TRADUIRE — ${fm.description}"`,
    `date: "${today}"`,
    `updatedAt: "${today}"`,
    `category: "${fm.category}"`,
    `categorySlug: "${fm.categorySlug}"`,
    `translationOf: "${frSlug}"`,
    'tags: []',
    `author: "${fm.author ?? 'Équipe Toutou Gourmet'}"`,
    'draft: true',
    '---',
    '',
    '<!-- Corps FR à réécrire en nl-BE. Charger .claude/skills/boileau-nl/SKILL.md AVANT.',
    '     Retirer `draft: true` publie l\'article (build + sitemap + hreflang). -->',
    '',
  ].join('\n')

  mkdirSync(NL_DIR, { recursive: true })
  writeFileSync(outPath, header + body.trimStart() + '\n', 'utf-8')

  console.log(`✓ content/nl/blog/${nlSlug}.mdx`)
  console.log(`  source    : content/blog/${frSlug}.mdx`)
  console.log(`  URL cible : ${SITE_URL}/nl/hond/${cat.slug}/${nlSlug}`)
  console.log('  draft: true — l\'article reste hors build tant que la ligne est là')
}

function lint() {
  const fr = readArticles(FR_DIR)
  const frBySlug = new Map(fr.map((a) => [a.slug, a]))
  const nl = readArticles(NL_DIR)
  const known = new Map(nlCategories().map((c) => [c.frSlug, c.slug]))
  let errors = 0
  let warnings = 0

  for (const a of nl) {
    const where = `content/nl/blog/${a.file}`
    const draft = a.fm.draft === 'true'

    if (!a.fm.translationOf) {
      console.error(`❌ ${where} : pas de translationOf — ni hreflang ni cover ne se résoudront`)
      errors++
      continue
    }
    const source = frBySlug.get(a.fm.translationOf)
    if (!source) {
      console.error(`❌ ${where} : translationOf "${a.fm.translationOf}" ne correspond à aucun content/blog/*.mdx`)
      errors++
      continue
    }
    if (!known.has(a.fm.categorySlug)) {
      console.error(`❌ ${where} : categorySlug "${a.fm.categorySlug}" absent de data/nl-categories.json`)
      errors++
    }
    if (a.fm.category !== source.fm.category) {
      console.error(`❌ ${where} : category "${a.fm.category}" ≠ "${source.fm.category}" côté FR — la cover tombera sur le fallback`)
      errors++
    }

    // Les checks de contenu ne s'appliquent pas à un brouillon : il contient
    // encore le texte français, c'est justement son état normal.
    if (draft) {
      console.log(`· ${where} : brouillon, checks de contenu ignorés`)
      continue
    }

    for (const term of FRENCH_ONLY_TERMS) {
      if (new RegExp(`\\b${term}\\b`).test(a.body)) {
        console.error(`❌ ${where} : mention "${term}" — organisme français, voir boileau-nl §1`)
        errors++
      }
    }
    if (/\buw?\b(?=\s+hond)/i.test(a.body)) {
      console.warn(`⚠️  ${where} : vouvoiement "u/uw" détecté — le site tutoie (je/jouw)`)
      warnings++
    }
    if (/\s[?:;!]/.test(a.body)) {
      console.warn(`⚠️  ${where} : espace avant ? : ; ! — règle française, pas néerlandaise`)
      warnings++
    }
    if (/«|»/.test(a.body)) {
      console.warn(`⚠️  ${where} : guillemets français « » dans un texte néerlandais`)
      warnings++
    }
    if (/À TRADUIRE/.test(a.body) || /À TRADUIRE/.test(a.fm.title ?? '')) {
      console.error(`❌ ${where} : marqueur "À TRADUIRE" encore présent alors que draft est retiré`)
      errors++
    }
  }

  console.log(`\n${nl.length} fichier(s) NL · ${errors} erreur(s) · ${warnings} avertissement(s)`)
  if (errors) process.exit(1)
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = parseArgs(process.argv.slice(2))
if (args.help || (!args.status && !args.next && !args.scaffold && !args.lint)) {
  printHelp()
  process.exit(args.help ? 0 : 2)
}
if (args.status) status()
if (args.next) next(args.next, args.category)
if (args.scaffold) scaffold(args.scaffold, args.slug)
if (args.lint) lint()
