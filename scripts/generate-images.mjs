#!/usr/bin/env node
// Génère des images de marque avec Gemini (docs/prompts/gemini-image-system.md).
// Usage : node scripts/generate-images.mjs <jobs.json> [--variants 1] [--model gemini-3.1-flash-image] [--out dir]
// jobs.json : [{ "slot": "art-…", "subject": "…", "composition": "…", "decorations": ["…"], "tone": "rose", "ratio": "3:2" }]
// La clé est lue dans ~/.config/toutou/gemini.env (GEMINI_API_KEY=…), jamais dans le dépôt.
// Sortie : <out>/<slot>-<n>.webp (1600 px de large, WebP 85) pour la revue humaine (§8 du prompt).
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const jobsFile = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'))
if (!jobsFile) {
  console.error('Usage : node scripts/generate-images.mjs <jobs.json> [--variants 1] [--model …] [--out dir]')
  process.exit(1)
}
const VARIANTS = Number(opt('variants', '1'))
const MODEL = opt('model', 'gemini-3.1-flash-image')
const OUT = opt('out', path.join(homedir(), 'toutou-preview/current/public/maquettes-img'))

async function apiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  const env = await readFile(path.join(homedir(), '.config/toutou/gemini.env'), 'utf8')
  const m = /^GEMINI_API_KEY=(.+)$/m.exec(env)
  if (!m) throw new Error('GEMINI_API_KEY absente de ~/.config/toutou/gemini.env')
  return m[1].trim()
}

/** Prompt système figé : le bloc de code de la section 4 du document de marque. */
async function systemPrompt() {
  const doc = await readFile(new URL('../docs/prompts/gemini-image-system.md', import.meta.url), 'utf8')
  const section = doc.slice(doc.indexOf('## 4. Prompt système'))
  const m = /```\n([\s\S]*?)```/.exec(section)
  if (!m) throw new Error('Prompt système introuvable (section 4)')
  return m[1].trim()
}

function fullPrompt(system, job) {
  return `${system.replace('{ratio}', job.ratio)}

SLOT: ${job.slot}
SUBJECT: ${job.subject}
COMPOSITION NOTES: ${job.composition}
DECORATIVE ELEMENTS (strict): ${job.decorations.join(', ')}
TONE ACCENT: ${job.tone}
RATIO: ${job.ratio}`
}

async function generate(key, prompt, ratio) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: ratio } },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`)
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)
  if (!part) throw new Error(`Pas d'image dans la réponse (${data.candidates?.[0]?.finishReason ?? 'raison inconnue'})`)
  return Buffer.from(part.inlineData.data, 'base64')
}

const key = await apiKey()
const system = await systemPrompt()
const jobs = JSON.parse(await readFile(jobsFile, 'utf8'))
await mkdir(OUT, { recursive: true })

for (const job of jobs) {
  const prompt = fullPrompt(system, job)
  for (let n = 1; n <= VARIANTS; n += 1) {
    try {
      const raw = await generate(key, prompt, job.ratio)
      const webp = await sharp(raw).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer()
      const file = path.join(OUT, `${job.slot}-${n}.webp`)
      await writeFile(file, webp)
      console.log(`✓ ${job.slot} v${n} (${Math.round(webp.length / 1024)} Ko)`)
    } catch (err) {
      console.error(`✗ ${job.slot} v${n} : ${err.message}`)
    }
  }
}
