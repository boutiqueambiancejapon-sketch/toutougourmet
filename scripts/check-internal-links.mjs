#!/usr/bin/env node
// @cdc seo — garde-fou maillage interne (lancé en prebuild).
// Fait échouer le build si :
//  - un article a un categorySlug absent de data/categories.ts (article orphelin, sans hub)
//  - un lien interne d'un MDX, du dictionnaire d'autoliens ou d'une redirection
//    pointe vers /chien/<catégorie>/<slug> alors que l'article vit sous une autre
//    catégorie (= 404), vers un article inexistant, ou vers /marques/* (301).
// Corriger un lien : reprendre le categorySlug du frontmatter de l'article cible.
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf-8')

// Un bloc par catégorie ; un hub (subCategorySlugs) n'affiche que ses sous-catégories
const categoryBlocks = read('data/categories.ts').split(/\n\s{2}\{/).slice(1)
const categorySlugs = new Set()
const hubOnly = new Set()
for (const block of categoryBlocks) {
  const slug = block.match(/slug:\s*'([\w-]+)'/)?.[1]
  if (!slug) continue
  categorySlugs.add(slug)
  if (block.includes('subCategorySlugs')) hubOnly.add(slug)
}
const brandSlugs = [...read('data/brands.ts').matchAll(/^\s{4}slug:\s*'([\w-]+)'/gm)].map((m) => m[1])
const brandPaths = new Set(['/chien/marque', '/chien/marque/comparatif', ...brandSlugs.map((b) => `/chien/marque/${b}`)])
brandSlugs.forEach((a, i) => brandSlugs.slice(i + 1).forEach((b) => brandPaths.add(`/chien/marque/${a}-vs-${b}`)))

const blogDir = path.join(root, 'content/blog')
const articles = new Map()
for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'))) {
  const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8')
  const fm = raw.split('---')[1] ?? ''
  const cat = fm.match(/^categorySlug:\s*['"]?([\w-]+)['"]?\s*$/m)?.[1] ?? null
  articles.set(file.replace(/\.mdx$/, ''), { file, cat, raw })
}
const canonical = (slug) => {
  const a = articles.get(slug)
  return a.cat ? `/chien/${a.cat}/${slug}` : `/blog/${slug}`
}

const errors = []

for (const a of articles.values()) {
  if (a.cat && !categorySlugs.has(a.cat)) errors.push(`${a.file} : categorySlug « ${a.cat} » absent de data/categories.ts`)
  else if (a.cat && hubOnly.has(a.cat)) errors.push(`${a.file} : categorySlug « ${a.cat} » est un hub qui n'affiche que ses sous-catégories`)
}

function check(url, where) {
  const clean = url.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  const parts = clean.split('/')
  if (parts[1] === 'marques') return errors.push(`${where} : ${clean} redirige (301) → utiliser /chien/marque/…`)
  if (parts[1] === 'blog' && parts.length === 3) {
    if (!articles.has(parts[2])) return errors.push(`${where} : ${clean} → article inexistant`)
    if (canonical(parts[2]) !== clean) return errors.push(`${where} : ${clean} redirige → utiliser ${canonical(parts[2])}`)
  }
  if (parts[1] !== 'chien') return
  if (clean.startsWith('/chien/marque')) {
    if (!brandPaths.has(clean)) errors.push(`${where} : ${clean} → page marque inexistante`)
    return
  }
  if (parts.length === 3 && !categorySlugs.has(parts[2])) errors.push(`${where} : ${clean} → catégorie inexistante`)
  if (parts.length === 4) {
    if (!articles.has(parts[3])) errors.push(`${where} : ${clean} → article inexistant`)
    else if (canonical(parts[3]) !== clean) errors.push(`${where} : ${clean} → 404, bonne URL ${canonical(parts[3])}`)
  }
}

const linkRe = /\]\((\/[^)\s]*)|href=["'](\/[^"']*)["']/g
for (const a of articles.values()) {
  for (const m of a.raw.matchAll(linkRe)) check(m[1] ?? m[2], a.file)
}
for (const m of read('lib/autolink-dictionary.ts').matchAll(/:\s*'(\/[^']+)'/g)) check(m[1], 'autolink-dictionary.ts')
for (const m of read('next.config.ts').matchAll(/destination:\s*'(\/[^']+)'/g)) {
  if (!m[1].includes(':')) check(m[1], 'next.config.ts (redirect)')
}

if (errors.length) {
  console.error(`\n✖ Maillage interne : ${errors.length} lien(s) cassé(s) ou catégorie(s) invalide(s)\n`)
  for (const e of errors) console.error('  - ' + e)
  console.error('')
  process.exit(1)
}
console.log(`✓ Maillage interne : ${articles.size} articles, aucun lien cassé`)
