#!/usr/bin/env node
// @cdc guide — fabrique public/guides/guide-de-la-gamelle.pdf à partir de la route d'impression
// /guide-alimentation/livre d'un site Next.js qui tourne (next start ou next dev).
//
//   npm run guide:pdf                                  # site sur http://127.0.0.1:3000
//   GUIDE_BASE_URL=http://127.0.0.1:3098 npm run guide:pdf
//   node scripts/build-guide.mjs --shots /tmp/guide    # + une capture PNG par page
//
// Vérifie chaque page avant d'écrire le PDF : aucun contenu coupé (débordement), aucune page
// vide, numéros de pied de page dans l'ordre, nombre de pages du PDF = nombre de pages du plan.
// Images : chaque image du livre est réduite et recompressée en JPEG (sharp) avant l'impression,
// Chromium embarque alors le JPEG tel quel (un WebP serait recodé sans perte, donc énorme).
// Polices : celles du site (next/font), embarquées en sous-ensemble par Chromium.
//
// Playwright n'est pas une dépendance du site : il est cherché dans le projet, puis dans
// PLAYWRIGHT_DIR (dossier qui contient node_modules/playwright), puis dans ~/tools/pw.

import { createRequire } from 'node:module'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const BOOK_PATH = '/guide-alimentation/livre'
const OUT = path.join(ROOT, 'public/guides/guide-de-la-gamelle.pdf')
const MAX_BYTES = 4 * 1024 * 1024
const IMAGE_WIDTH = 1600
const IMAGE_QUALITY = 74
const PREVIEW_WIDTH = 480

const args = process.argv.slice(2)
const argValue = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const baseUrl = (argValue('--url') ?? process.env.GUIDE_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '')
const shotsDir = argValue('--shots')
const force = args.includes('--force')

function loadPlaywright() {
  const candidates = [path.join(ROOT, 'package.json'), process.env.PLAYWRIGHT_DIR && path.join(process.env.PLAYWRIGHT_DIR, 'package.json'), path.join(homedir(), 'tools/pw/package.json')]
  for (const c of candidates.filter(Boolean)) {
    try {
      return createRequire(c)('playwright')
    } catch {
      // essai suivant
    }
  }
  throw new Error('Playwright introuvable : npm i -D playwright, ou PLAYWRIGHT_DIR=<dossier avec node_modules/playwright>')
}

/** Fichier de public/ visé par une URL d'image (directe ou /_next/image?url=…). */
function publicFileOf(requestUrl) {
  const url = new URL(requestUrl)
  const src = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname
  if (!src || !src.startsWith('/') || src.includes('..')) return null
  return path.join(ROOT, 'public', decodeURIComponent(src))
}

async function jpegOf(file) {
  const input = await readFile(file)
  return sharp(input).resize({ width: IMAGE_WIDTH, withoutEnlargement: true }).jpeg({ quality: IMAGE_QUALITY, mozjpeg: true }).toBuffer()
}

async function main() {
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } })
  const imageBytes = { count: 0, bytes: 0 }
  await page.route(/\/_next\/image\?|\/images\/.+\.(webp|jpe?g|png)$/, async (route) => {
    const file = publicFileOf(route.request().url())
    if (!file) return route.continue()
    try {
      const body = await jpegOf(file)
      imageBytes.count += 1
      imageBytes.bytes += body.length
      await route.fulfill({ status: 200, contentType: 'image/jpeg', body })
    } catch (err) {
      console.error(`[guide] image illisible ${file} : ${err.message}`)
      await route.abort()
    }
  })

  const url = `${baseUrl}${BOOK_PATH}`
  const res = await page.goto(url, { waitUntil: 'load' })
  if (!res || !res.ok()) throw new Error(`${url} a répondu ${res?.status()}`)
  await page.emulateMedia({ media: 'print' })
  await page.evaluate(async () => {
    // next/image charge en différé les images hors écran : on les force toutes.
    for (const img of document.images) img.loading = 'eager'
    await document.fonts.ready
    const settle = (img) => new Promise((r) => {
      img.addEventListener('load', r, { once: true })
      img.addEventListener('error', r, { once: true })
    })
    await Promise.all([...document.images].map((img) => (img.complete ? null : settle(img))))
  })

  const report = await page.evaluate(() =>
    [...document.querySelectorAll('.bk-page')].map((p, i) => {
      const body = p.querySelector('.bk-body')
      const foot = p.querySelector('.bk-foot')
      return {
        index: i + 1,
        number: Number(p.getAttribute('data-page')),
        overflow: body ? body.scrollHeight - body.clientHeight : 0,
        text: body ? body.innerText.trim().length : 0,
        footNumber: foot ? Number(foot.textContent.split('·').pop()) : null,
        hiddenImages: [...p.querySelectorAll('.bk-img')].filter((img) => getComputedStyle(img).display === 'none').length,
      }
    }),
  )
  const problems = []
  for (const r of report) {
    if (r.number !== r.index) problems.push(`page ${r.index} : numéro ${r.number} dans le plan`)
    if (r.overflow > 1) problems.push(`page ${r.index} : contenu coupé (${r.overflow} px de trop)`)
    if (r.text < 40) problems.push(`page ${r.index} : page presque vide`)
    if (r.footNumber !== null && r.footNumber !== r.index) problems.push(`page ${r.index} : pied de page ${r.footNumber}`)
    if (r.hiddenImages > 0) console.warn(`[guide] page ${r.index} : image masquée faute de place`)
  }

  // Aperçus de la page /guide-alimentation : pages marquées data-preview, en WebP léger.
  await mkdir(path.dirname(OUT), { recursive: true })
  for (const handle of await page.$$('.bk-page[data-preview]')) {
    const name = await handle.getAttribute('data-preview')
    const png = await handle.screenshot()
    await sharp(png).resize({ width: PREVIEW_WIDTH }).webp({ quality: 80 }).toFile(path.join(path.dirname(OUT), `apercu-${name}.webp`))
  }

  if (shotsDir) {
    await mkdir(shotsDir, { recursive: true })
    const sections = await page.$$('.bk-page')
    for (const [i, s] of sections.entries()) await s.screenshot({ path: path.join(shotsDir, `page-${String(i + 1).padStart(2, '0')}.png`) })
  }

  if (problems.length > 0) {
    console.error(`[guide] ${problems.length} problème(s) :\n- ${problems.join('\n- ')}`)
    if (!force) {
      await browser.close()
      process.exit(1)
    }
  }

  const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, outline: true, tagged: true })
  await browser.close()

  const pdfPages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length
  if (pdfPages !== report.length) {
    console.error(`[guide] le PDF compte ${pdfPages} pages, le plan ${report.length} : une page déborde sur la suivante`)
    if (!force) process.exit(1)
  }
  await mkdir(path.dirname(OUT), { recursive: true })
  const tmp = `${OUT}.tmp`
  await writeFile(tmp, pdf)
  await rename(tmp, OUT)
  const { size } = await stat(OUT)
  const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} Mo`
  console.log(`[guide] ${path.relative(ROOT, OUT)} : ${report.length} pages, ${mb(size)} (images ${imageBytes.count}, ${mb(imageBytes.bytes)})`)
  if (size > MAX_BYTES) console.warn(`[guide] plus de ${mb(MAX_BYTES)} : baisser IMAGE_WIDTH ou IMAGE_QUALITY`)
}

main().catch((err) => {
  console.error(`[guide] ${err.message}`)
  process.exit(1)
})
