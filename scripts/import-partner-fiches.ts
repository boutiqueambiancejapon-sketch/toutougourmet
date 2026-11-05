// Crée ou met à jour les fiches des marques partenaires à partir de data/partner-fiches.json, relevé sur
// leurs sites officiels. Même barème que les autres fiches, sans IA.
//   tsx scripts/import-partner-fiches.ts              : affiche les notes
//   tsx scripts/import-partner-fiches.ts --appliquer  : écrit
import { readFileSync } from 'node:fs'
import pg from 'pg'
import { analyseLabel, scoreVersionFor } from '../lib/scanner/analyse'
import { MAXI_ZOO_CATEGORIES, maxiZooLabel, type MaxiZooParse } from '../lib/scanner/maxizoo'
import { baseSlug } from '../lib/scanner/slug'

const CATEGORY = { sec: 'Chien > Nourriture pour chien > Croquettes pour chiens', humide: 'Chien > Nourriture pour chien > Nourriture humide pour chien' }

interface PartnerFiche {
  brand: string
  product: string
  url: string
  type: keyof typeof CATEGORY
  composition: string
  constituants: Extract<MaxiZooParse, { ok: true }>['constituants']
  kcal100g: number | null
  logo: string
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--appliquer')
  const fiches = JSON.parse(readFileSync('data/partner-fiches.json', 'utf8')) as PartnerFiche[]
  const pool = apply ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null
  for (const f of fiches) {
    const label = maxiZooLabel({ brand: f.brand, name: `${f.brand} ${f.product}`, ean: '', category: CATEGORY[f.type] }, { ok: true, constituants: f.constituants, composition: f.composition, kcal100g: f.kcal100g })
    if (!label || !MAXI_ZOO_CATEGORIES[CATEGORY[f.type]]) throw new Error(`fiche illisible : ${f.brand} ${f.product}`)
    label.ean = null
    const details = analyseLabel(label)
    console.log(`${details.score ?? '?'}  ${f.brand} · ${f.product} (${label.ingredients.length} ingrédients, premier : ${label.ingredients[0]?.nom})`)
    if (!pool || details.score === null) continue
    await pool.query(
      `INSERT INTO app.food_analysis (slug, brand, product, extracted, details, score, algorithm_version, model, source, reviewed, image_url, scan_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'site-marque', 'marque', true, $8, 0)
       ON CONFLICT (slug) DO UPDATE SET extracted = $4, details = $5, score = $6, algorithm_version = $7, image_url = $8, updated_at = now()`,
      [baseSlug(f.brand, f.product, null), f.brand, f.product, JSON.stringify(label), JSON.stringify(details), details.score, scoreVersionFor(label), f.logo],
    )
  }
  await pool?.end()
}

void main()
