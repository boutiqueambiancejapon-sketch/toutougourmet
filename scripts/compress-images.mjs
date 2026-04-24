/**
 * One-shot compressor — re-encodes the Gemini WebP uploads at quality 82
 * and caps the long side at 1600px. Keeps the artistic overlay crisp
 * while dropping typical file sizes from ~2 MB to ~150-250 KB.
 *
 * Usage: node scripts/compress-images.mjs
 */
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = 'public/images'
const DIRS = ['hero', 'articles', 'social', 'breeds']
const MAX_LONG_SIDE = 1600
const QUALITY = 82

async function compressFile(fullPath) {
  const buffer = await sharp(fullPath)
    .resize({ width: MAX_LONG_SIDE, height: MAX_LONG_SIDE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer()
  const { size: before } = statSync(fullPath)
  await sharp(buffer).toFile(fullPath)
  const { size: after } = statSync(fullPath)
  return { before, after }
}

async function main() {
  let totalBefore = 0
  let totalAfter = 0
  for (const dir of DIRS) {
    const full = join(ROOT, dir)
    let files
    try { files = readdirSync(full) } catch { continue }
    for (const name of files) {
      if (!name.endsWith('.webp')) continue
      const p = join(full, name)
      const { before, after } = await compressFile(p)
      totalBefore += before
      totalAfter += after
      const pct = Math.round((1 - after / before) * 100)
      console.log(`${dir}/${name}: ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB (-${pct}%)`)
    }
  }
  const totalPct = Math.round((1 - totalAfter / totalBefore) * 100)
  console.log(`---`)
  console.log(`TOTAL: ${Math.round(totalBefore / 1024)} KB → ${Math.round(totalAfter / 1024)} KB (-${totalPct}%)`)
}

await main()
