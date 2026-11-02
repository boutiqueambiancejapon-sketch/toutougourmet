// Aperçu des fiches de partage du scanner sans lancer le site : npx tsx scripts/render-scan-story.tsx /tmp/sortie
import { writeFile } from 'node:fs/promises'
import { scanOgResponse, scanStoryResponse } from '../lib/og/scan-image'
import { PREMIUM_LABEL, SUPERMARKET_LABEL } from '../lib/scanner/fixtures'
import { scoreLabel } from '../lib/scanner/score'

async function main() {
  const out = process.argv[2] || '/tmp'
  for (const [name, label] of [['premium', PREMIUM_LABEL], ['supermarche', SUPERMARKET_LABEL]] as const) {
    const input = { brand: label.marque, product: label.produit, details: scoreLabel(label), source: 'photo' as const }
    await writeFile(`${out}/story-${name}.png`, Buffer.from(await (await scanStoryResponse(input)).arrayBuffer()))
    await writeFile(`${out}/og-${name}.png`, Buffer.from(await (await scanOgResponse(input)).arrayBuffer()))
  }
  console.log(`Images écrites dans ${out}`)
}

void main()
