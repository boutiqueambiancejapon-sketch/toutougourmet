// Essai manuel de la lecture d'étiquette (APPEL PAYANT au fournisseur d'IA) :
// GEMINI_API_KEY=… npx tsx scripts/try-scanner-extract.ts photo1.png [photo2.png]
import { readFileSync } from 'node:fs'
import { extractLabel } from '../lib/scanner/extract'
import { prepareImage } from '../lib/scanner/images'
import { scoreLabel } from '../lib/scanner/score'

async function main() {
  const files = process.argv.slice(2)
  if (files.length === 0) throw new Error('Donne 1 ou 2 photos')
  const images = await Promise.all(files.map((f) => prepareImage(new File([readFileSync(f)], f))))
  const started = Date.now()
  const { label, model } = await extractLabel(images)
  console.log(JSON.stringify({ model, ms: Date.now() - started, label }, null, 2))
  const score = scoreLabel(label)
  console.log(`Note : ${score.score} (${score.band}) · manque : ${score.missing.join(', ') || 'rien'}`)
  for (const c of score.criteria) console.log(`- ${c.label} : ${c.points ?? '—'}/${c.max} · ${c.explanation}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
