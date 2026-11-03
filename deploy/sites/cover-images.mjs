#!/usr/bin/env node
// Couvertures d'articles des sites hébergés (hors Toutou Gourmet), générées le matin avec Gemini.
// Lancé par covers.sh (minuterie site-covers.timer). Usage :
//   node cover-images.mjs [--dry] [--site=<nom>] [--only=<slug>] [--max=3] [--days=7] [--no-push]
// --dry      : liste ce qui serait généré, aucun appel payant, aucun commit.
// --only     : ne traite que cet article (test).
// --no-push  : écrit l'image et le champ dans le clone, sans commit ni push (relecture humaine).
// Garde-fous : une seule image par article (état ~/.toutou-covers-state.json), au plus 3 par site et par passage.
// La clé GEMINI_API_KEY est lue dans ~/.config/toutou/gemini.env et n'est jamais écrite nulle part.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import path from 'node:path'

const HOME = homedir()
const HERE = path.dirname(new URL(import.meta.url).pathname)
const OWNER = 'boutiqueambiancejapon-sketch'
const WORK = path.join(HOME, 'sites-covers')
const BACKUP = path.join(WORK, '_generated')
const STATE_FILE = path.join(HOME, '.toutou-covers-state.json')
const MODEL = 'gemini-3.1-flash-image'
const MAX_ATTEMPTS = 2 // essais sans image reçue (erreur API) avant d'abandonner un article
const LIMIT_KB = 200

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => args.find((a) => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=') ?? d
const DRY = flag('dry')
const NO_PUSH = flag('no-push')
const ONLY_SITE = opt('site')
const ONLY_SLUG = opt('only')
const MAX = Math.min(3, Number(opt('max', '3')))
const DAYS = Number(opt('days', '7'))

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)

// sharp : pas de dépendance ajoutée, on prend le premier node_modules disponible.
function loadSharp() {
  const bases = [
    path.join(HERE, '../../package.json'),
    '/srv/toutou/current/package.json',
    ...['10minlanguages', 'robot-tondeuse', 'visit-belgium'].map((r) => path.join(HOME, 'sites-work', r, 'package.json')),
  ]
  for (const b of bases) {
    try { return createRequire(b)('sharp') } catch { /* suivant */ }
  }
  throw new Error('sharp introuvable')
}

// ─── Petit lecteur / éditeur de frontmatter (édition textuelle, la mise en forme d'origine est gardée) ───

function splitFm(src) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src)
  if (!m) return null
  return { fm: m[1], body: src.slice(m[0].length) }
}
const joinFm = (fm, body) => `---\n${fm}\n---\n${body}`

function unquote(v) {
  v = v.trim()
  if (v.startsWith('"')) { try { return JSON.parse(v) } catch { return v.slice(1, -1) } }
  if (v.startsWith("'")) return v.slice(1, -1).replace(/''/g, "'")
  return v
}
function getTop(fm, key) {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(fm)
  return m ? unquote(m[1]) : undefined
}
function blockRange(lines, parent) {
  const start = lines.findIndex((l) => l === `${parent}:` || l.startsWith(`${parent}: `) || l.startsWith(`${parent}:\t`))
  if (start < 0) return null
  let end = start + 1
  while (end < lines.length && /^\s+\S/.test(lines[end])) end += 1
  return { start, end }
}
function getNested(fm, parent, key) {
  const lines = fm.split('\n')
  const r = blockRange(lines, parent)
  if (!r) return undefined
  for (let i = r.start + 1; i < r.end; i += 1) {
    const m = new RegExp(`^\\s+${key}:[ \\t]*(.*)$`).exec(lines[i])
    if (m) return unquote(m[1])
  }
  return undefined
}
const q = (v) => JSON.stringify(v)
function setTop(fm, key, value, after = ['description', 'excerpt', 'title']) {
  const re = new RegExp(`^${key}:.*$`, 'm')
  if (re.test(fm)) return fm.replace(re, `${key}: ${q(value)}`)
  const lines = fm.split('\n')
  for (const a of after) {
    const i = lines.findIndex((l) => l.startsWith(`${a}:`))
    if (i >= 0) { lines.splice(i + 1, 0, `${key}: ${q(value)}`); return lines.join('\n') }
  }
  return `${fm}\n${key}: ${q(value)}`
}
function setNested(fm, parent, key, value) {
  const lines = fm.split('\n')
  const r = blockRange(lines, parent)
  if (!r || !/^\S+:\s*$/.test(lines[r.start])) {
    if (r) throw new Error(`champ ${parent} non éditable (valeur en ligne)`)
    return `${fm}\n${parent}:\n  ${key}: ${q(value)}`
  }
  const indent = /^(\s+)/.exec(lines[r.start + 1] ?? '')?.[1] ?? '  '
  for (let i = r.start + 1; i < r.end; i += 1) {
    if (new RegExp(`^\\s+${key}:`).test(lines[i])) { lines[i] = `${indent}${key}: ${q(value)}`; return lines.join('\n') }
  }
  lines.splice(r.end, 0, `${indent}${key}: ${q(value)}`)
  return lines.join('\n')
}

// ─── Sites ───

function parisDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d) // AAAA-MM-JJ
}
const listMdx = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mdx') && !f.startsWith('_')).map((f) => path.join(dir, f)) : [])
const subdirs = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => statSync(path.join(dir, f)).isDirectory()).map((f) => path.join(dir, f)) : [])
const fileOk = (repo, url) => Boolean(url) && !/^https?:/.test(url) && existsSync(path.join(repo, 'public', url))

/** Chaque adaptateur renvoie les articles du dépôt : { slug, file, date, title, description, category, draft, missing, target, hint, apply(alt) } */
const SITES = {
  '10minlanguages': {
    domain: '10minlanguages.com', lang: 'English', format: 'webp',
    articles(repo) {
      const imagesTs = path.join(repo, 'data/images.ts')
      const ts = readFileSync(imagesTs, 'utf8')
      return listMdx(path.join(repo, 'content/blog')).map((file) => {
        const fm = splitFm(readFileSync(file, 'utf8'))?.fm ?? ''
        const slot = getTop(fm, 'image')
        const at = slot ? ts.indexOf(`id: '${slot}'`) : -1
        const next = at >= 0 ? ts.indexOf('\n  {', at) : -1
        const block = at >= 0 ? ts.slice(at, next < 0 ? undefined : next) : ''
        const ready = /ready:\s*true/.test(block)
        const ext = /ext:\s*'jpg'/.test(block) ? 'jpg' : 'webp'
        const url = slot ? `/images/${slot}.${ext}` : undefined
        return {
          slug: path.basename(file, '.mdx'), file, date: getTop(fm, 'date'), title: getTop(fm, 'title'),
          description: getTop(fm, 'description'), category: getTop(fm, 'category'), draft: getTop(fm, 'draft') === 'true',
          missing: Boolean(slot) && (!ready || !fileOk(repo, url)),
          skipReason: !slot ? 'pas de champ image' : at < 0 ? `slot ${slot} absent de data/images.ts` : undefined,
          target: url, hint: /prompt:\s*'([^']*)'/.exec(block)?.[1],
          apply() {
            const cur = readFileSync(imagesTs, 'utf8')
            const a = cur.indexOf(`id: '${slot}'`)
            const n = cur.indexOf('\n  {', a)
            const end = n < 0 ? cur.length : n
            const seg = cur.slice(a, end).replace(/ready:\s*false/, 'ready: true')
            writeFileSync(imagesTs, cur.slice(0, a) + seg + cur.slice(end))
            return ['data/images.ts']
          },
        }
      })
    },
  },
  klarolab: {
    none: "pas d'image par article (pages TSX recensées dans lib/articles.ts, seule une image par rubrique)",
  },
  'robot-tondeuse': {
    domain: 'quel-robot-tondeuse.com', lang: 'French', format: 'jpeg',
    articles(repo) {
      return listMdx(path.join(repo, 'content/articles')).map((file) => {
        const src = readFileSync(file, 'utf8')
        const fm = splitFm(src)?.fm ?? ''
        const slug = path.basename(file, '.mdx')
        const cur = getTop(fm, 'featureImage')
        const url = `/images/${slug}-cover.jpeg`
        return {
          slug, file, date: getTop(fm, 'publishedAt'), title: getTop(fm, 'title'), description: getTop(fm, 'description'),
          category: getTop(fm, 'categorie'), draft: getTop(fm, 'draft') === 'true',
          // une image « generique » est la couverture de repli posée quand la génération de nuit a échoué
          missing: !fileOk(repo, cur) || /generique/.test(cur ?? ''),
          target: url,
          apply() {
            const s = splitFm(readFileSync(file, 'utf8'))
            writeFileSync(file, joinFm(setTop(s.fm, 'featureImage', url), s.body))
            return [path.relative(repo, file)]
          },
        }
      })
    },
  },
  'voyance-fiable': {
    domain: 'voyance-fiable.com', lang: 'French', format: 'jpeg',
    articles(repo) {
      return subdirs(path.join(repo, 'content/articles')).flatMap((d) => listMdx(d)).map((file) => {
        const fm = splitFm(readFileSync(file, 'utf8'))?.fm ?? ''
        const date = getTop(fm, 'date')
        const slug = getTop(fm, 'slug') || path.basename(file, '.mdx').replace(/^\d{4}-\d{2}-\d{2}-/, '')
        const cur = getNested(fm, 'images', 'featured') || getNested(fm, 'cover', 'src')
        const url = `/images/articles/${date}-${slug}-hero.jpeg`
        return {
          slug, file, date, title: getTop(fm, 'title'), description: getTop(fm, 'excerpt') || getTop(fm, 'description'),
          category: getTop(fm, 'category') || path.basename(path.dirname(file)), draft: getTop(fm, 'draft') === 'true',
          missing: !fileOk(repo, cur), target: url,
          apply(alt) {
            const s = splitFm(readFileSync(file, 'utf8'))
            let f = setNested(s.fm, 'cover', 'src', url)
            f = setNested(f, 'cover', 'alt', alt)
            f = setNested(f, 'images', 'featured', url)
            f = setNested(f, 'alt', 'featured', alt)
            writeFileSync(file, joinFm(f, s.body))
            return [path.relative(repo, file)]
          },
        }
      })
    },
  },
  'travel-belgium': {
    domain: 'travel-to-belgium.com', lang: 'English', format: 'jpeg',
    articles(repo) {
      const files = [...listMdx(path.join(repo, 'content/articles')), ...subdirs(path.join(repo, 'content/blog')).flatMap((d) => listMdx(d))]
      return files.map((file) => {
        const fm = splitFm(readFileSync(file, 'utf8'))?.fm ?? ''
        const slug = path.basename(file, '.mdx')
        const inBlog = file.includes('/content/blog/')
        const cat = inBlog ? path.basename(path.dirname(file)) : getTop(fm, 'categorie') || 'general'
        const cur = getTop(fm, 'featureImage')
        const url = `/images/blog/${cat}/featured-${slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')}.jpeg`
        return {
          slug, file, date: getTop(fm, 'publishedAt'), title: getTop(fm, 'title'), description: getTop(fm, 'description'),
          category: cat, draft: getTop(fm, 'draft') === 'true', missing: !fileOk(repo, cur), target: url,
          apply() {
            const s = splitFm(readFileSync(file, 'utf8'))
            writeFileSync(file, joinFm(setTop(s.fm, 'featureImage', url), s.body))
            return [path.relative(repo, file)]
          },
        }
      })
    },
  },
}

// ─── Style par site (deploy/sites/cover-styles/<site>.md) ───

function style(site, category) {
  const md = readFileSync(path.join(HERE, 'cover-styles', `${site}.md`), 'utf8')
  const block = (heading) => {
    const i = md.indexOf(heading)
    if (i < 0) return ''
    return /```text\n([\s\S]*?)```/.exec(md.slice(i))?.[1].trim() ?? ''
  }
  const norm = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return { common: block('## Style commun'), variant: category ? block(`## Variante : ${norm(category)}`) : '' }
}

function buildPrompt(site, conf, a) {
  const st = style(site, a.category)
  return [
    `Create ONE cover image (16:9, full-bleed) for an article published on ${conf.domain}.`,
    `ARTICLE TITLE: ${a.title}`,
    a.description ? `ARTICLE SUMMARY: ${a.description}` : '',
    a.hint ? `SCENE BRIEF: ${a.hint}` : '',
    `Depict the article's concrete subject in the site's house style below, so it sits naturally next to the site's existing covers.`,
    `SITE VISUAL STYLE (follow strictly): ${st.common}`,
    st.variant ? `CATEGORY VARIANT: ${st.variant}` : '',
    'HARD RULES: absolutely no text, letters, numbers, captions, signage text, watermarks, logos or brand names anywhere in the image; no recognizable real person or celebrity; no collage of several images; no border or frame.',
    `Also reply with ONE short sentence of image alt text in ${conf.lang} (max 140 characters) describing what the image shows, nothing else in the text.`,
  ].filter(Boolean).join('\n\n')
}

// ─── Gemini ───

function apiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim()
  const env = readFileSync(path.join(HOME, '.config/toutou/gemini.env'), 'utf8')
  const m = /^GEMINI_API_KEY=(.+)$/m.exec(env)
  if (!m) throw new Error('GEMINI_API_KEY absente')
  return m[1].trim().replace(/^["']|["']$/g, '')
}

async function generate(prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '16:9' } },
    }),
    signal: AbortSignal.timeout(180000),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`API Gemini HTTP ${res.status}`)
  const parts = data.candidates?.[0]?.content?.parts ?? []
  const img = parts.find((p) => p.inlineData?.data)
  if (!img) throw new Error(`pas d'image dans la réponse (${data.candidates?.[0]?.finishReason ?? 'raison inconnue'})`)
  const alt = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join(' ').replace(/\s+/g, ' ').trim().replace(/^["«]\s*|\s*["»]$/g, '')
  return { raw: Buffer.from(img.inlineData.data, 'base64'), alt }
}

async function encode(sharp, raw, format) {
  for (let quality = 82; quality >= 50; quality -= 6) {
    const img = sharp(raw).resize(1376, 768, { fit: 'cover', position: 'attention' })
    const buf = format === 'webp' ? await img.webp({ quality, effort: 5 }).toBuffer() : await img.jpeg({ quality, mozjpeg: true }).toBuffer()
    if (buf.length < LIMIT_KB * 1024) return buf
  }
  throw new Error(`image > ${LIMIT_KB} Ko même compressée`)
}

// ─── Git ───

const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

function syncClone(repoName, branch) {
  const dir = path.join(WORK, repoName)
  if (!existsSync(path.join(dir, '.git'))) {
    mkdirSync(WORK, { recursive: true })
    git(WORK, 'clone', '-q', '--branch', branch, '--single-branch', `https://github.com/${OWNER}/${repoName}.git`, dir)
    return dir
  }
  git(dir, 'fetch', '-q', 'origin', branch)
  if (git(dir, 'status', '--porcelain')) {
    log(`  ${repoName} : modifications non commitées d'un passage interrompu, remises à zéro (copies dans ${BACKUP})`)
    git(dir, 'reset', '-q', '--hard', 'HEAD')
    git(dir, 'clean', '-qfd')
  }
  git(dir, 'checkout', '-q', branch)
  try {
    git(dir, 'rebase', '-q', `origin/${branch}`) // garde un commit local pas encore poussé
  } catch {
    try { git(dir, 'rebase', '--abort') } catch { /* rien */ }
    log(`  ${repoName} : commit local en conflit avec GitHub, abandonné (copies dans ${BACKUP})`)
    git(dir, 'reset', '-q', '--hard', `origin/${branch}`)
  }
  return dir
}

// Identité de commit : celle du dépôt Toutou (les clones neufs n'en ont pas).
function identity() {
  const get = (k) => { try { return git(path.join(HERE, '../..'), 'config', k) } catch { return '' } }
  const name = get('user.name') || 'boutiqueambiancejapon-sketch'
  const email = get('user.email') || 'boutiqueambiancejapon-sketch@users.noreply.github.com'
  return ['-c', `user.name=${name}`, '-c', `user.email=${email}`]
}

function push(dir, branch) {
  try {
    git(dir, 'push', '-q', 'origin', `HEAD:${branch}`)
  } catch {
    git(dir, 'fetch', '-q', 'origin', branch)
    git(dir, 'rebase', '-q', `origin/${branch}`)
    git(dir, 'push', '-q', 'origin', `HEAD:${branch}`)
  }
}

// ─── Passage ───

const loadState = () => (existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : {})
const saveState = (s) => writeFileSync(STATE_FILE, `${JSON.stringify(s, null, 2)}\n`)

const conf = readFileSync(path.join(HERE, 'sites.conf'), 'utf8').split('\n')
  .filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => { const [name, repo, port, branch] = l.trim().split(/\s+/); return { name, repo, port, branch } })

const since = parisDate(-DAYS)
const today = parisDate()
let failures = 0
let paid = 0
let sharp

log(`Couvertures ${DRY ? '(essai à blanc) ' : ''}: articles publiés du ${since} au ${today}, au plus ${MAX} par site.`)

for (const s of conf) {
  if (ONLY_SITE && s.name !== ONLY_SITE) continue
  const site = SITES[s.name]
  if (!site) { log(`${s.name} : site inconnu du script, ignoré`); continue }
  if (site.none) { log(`${s.name} : rien à faire (${site.none})`); continue }
  try {
    const dir = syncClone(s.repo, s.branch)
    const state = loadState()
    const all = site.articles(dir)
    const recent = all.filter((a) => a.date && a.date >= since && a.date <= today && !a.draft && (!ONLY_SLUG || a.slug === ONLY_SLUG))
    for (const a of recent.filter((x) => x.skipReason)) log(`  ${s.name}/${a.slug} : ignoré (${a.skipReason})`)
    const todo = recent.filter((a) => a.missing && !a.skipReason).sort((x, y) => y.date.localeCompare(x.date))
    log(`${s.name} : ${recent.length} article(s) récent(s), ${todo.length} sans couverture`)
    const done = []
    for (const a of todo) {
      const key = `${s.name}:${a.slug}`
      const st = state[key]
      const backup = path.join(BACKUP, s.name, path.basename(a.target))
      if (existsSync(path.join(dir, 'public', a.target)) && st?.status !== 'generated') {
        // le fichier attendu existe déjà (posé à la main ou par la tâche de nuit) : on relie seulement le champ, gratuit
        if (DRY) { log(`  ${a.slug} (${a.date}) : image déjà présente à public${a.target}, champ à relier (gratuit)`); continue }
        done.push({ a, files: a.apply(a.title) })
        log(`  ${a.slug} : image existante reliée (aucun appel)`)
        continue
      }
      if (st?.status === 'generated') {
        if (DRY) { log(`  ${a.slug} (${a.date}) : déjà générée le ${st.at.slice(0, 10)}, ${existsSync(backup) ? 'copie réutilisable' : 'pas de copie'}`); continue }
        if (!existsSync(backup)) { log(`  ${a.slug} : déjà générée le ${st.at.slice(0, 10)} mais introuvable, aucune nouvelle image (règle : une seule par article)`); continue }
        mkdirSync(path.dirname(path.join(dir, 'public', a.target)), { recursive: true })
        copyFileSync(backup, path.join(dir, 'public', a.target))
        done.push({ a, files: [path.join('public', a.target), ...a.apply(st.alt || a.title)] })
        log(`  ${a.slug} : image déjà payée reprise depuis la copie`)
        continue
      }
      if ((st?.attempts ?? 0) >= MAX_ATTEMPTS) { log(`  ${a.slug} : ${st.attempts} échecs, abandonné`); continue }
      if (done.length >= MAX) { log(`  ${a.slug} (${a.date}) : reporté (limite de ${MAX} par passage)`); continue }
      if (DRY) { log(`  À GÉNÉRER ${a.slug} (${a.date}, ${a.category ?? 'sans rubrique'}) → public${a.target}`); done.push({ a }); continue }
      try {
        sharp ??= loadSharp()
        log(`  ${a.slug} : génération…`)
        const { raw, alt } = await generate(buildPrompt(s.name, site, a))
        paid += 1
        const buf = await encode(sharp, raw, site.format)
        mkdirSync(path.join(BACKUP, s.name), { recursive: true })
        writeFileSync(backup, buf)
        writeFileSync(path.join(BACKUP, s.name, `${path.basename(a.target)}.raw.png`), raw)
        state[key] = { status: 'generated', at: new Date().toISOString(), file: a.target, alt }
        saveState(state)
        const out = path.join(dir, 'public', a.target)
        mkdirSync(path.dirname(out), { recursive: true })
        writeFileSync(out, buf)
        done.push({ a, files: [path.join('public', a.target), ...a.apply(alt || a.title)] })
        log(`  ✓ ${a.slug} : ${Math.round(buf.length / 1024)} Ko, alt « ${alt} »`)
      } catch (err) {
        failures += 1
        state[key] = { status: 'failed', attempts: (st?.attempts ?? 0) + 1, at: new Date().toISOString(), error: String(err.message).slice(0, 200) }
        saveState(state)
        log(`  ✗ ${a.slug} : ${err.message}`)
      }
    }
    if (DRY || !done.length) continue
    if (NO_PUSH) { log(`  ${s.name} : --no-push, fichiers laissés dans ${dir} pour relecture`); continue }
    git(dir, 'add', '--', ...new Set(done.flatMap((d) => d.files)))
    const slugs = done.map((d) => d.a.slug).join(', ')
    git(dir, ...identity(), 'commit', '-q', '-m', `content(images): add cover for ${slugs}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`)
    push(dir, s.branch)
    log(`  ${s.name} : commit poussé sur ${s.branch} (${slugs})`)
  } catch (err) {
    failures += 1
    log(`✗ ${s.name} : ${String(err.message).split('\n')[0]}`)
  }
}

log(`Fin : ${paid} appel(s) payant(s), ${failures} échec(s).`)
process.exit(failures ? 1 : 0)
