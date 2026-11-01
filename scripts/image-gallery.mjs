#!/usr/bin/env node
// Page de revue des variantes générées : regroupe <slot>-<n>.webp par slot, 3 colonnes.
// Usage : node scripts/image-gallery.mjs [dir]   (défaut : ~/toutou-preview/current/public/maquettes-img)
import { readdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'

const dir = process.argv[2] ?? path.join(homedir(), 'toutou-preview/current/public/maquettes-img')
const files = (await readdir(dir)).filter((f) => /-\d+\.webp$/.test(f)).sort()
const slots = new Map()
for (const f of files) {
  const slot = f.replace(/-\d+\.webp$/, '')
  slots.set(slot, [...(slots.get(slot) ?? []), f])
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const rows = [...slots].map(([slot, imgs], i) => `
<section><h2>${i + 1}. ${esc(slot.replace(/^art-/, ''))}</h2><div class="g">
${imgs.map((f) => `<figure><img src="${f}" loading="lazy" alt=""><figcaption>Version ${f.match(/-(\d+)\.webp$/)[1]}</figcaption></figure>`).join('')}
</div></section>`).join('')
await writeFile(path.join(dir, 'index.html'), `<!doctype html><html lang="fr"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Choix des images</title><style>
body{font-family:system-ui,sans-serif;background:#FAFAF8;color:#1A1109;margin:0;padding:16px}
h1{font-size:22px}h2{font-size:16px;margin:28px 0 8px}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
figure{margin:0}img{width:100%;border-radius:14px;display:block}figcaption{font-size:14px;padding:4px 2px;font-weight:600}
</style><h1>Choix des images (${slots.size} articles)</h1>
<p>Pour chaque article, réponds avec le numéro de la version préférée, par exemple « 1 : v2, 2 : v3 ».</p>${rows}</html>`)
console.log(`index.html : ${slots.size} slots, ${files.length} images`)
