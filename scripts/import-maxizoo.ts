// Crée ou complète les fiches à partir des pages produit Maxi Zoo. Sans IA, une page toutes les 4 s.
//   tsx scripts/import-maxizoo.ts --limite=100 [--essai]
// Fichier Awin hors du dépôt : MAXIZOO_FEED (défaut /srv/toutou/shared/maxizoo-feed.csv.gz).
// Suivi : MAXIZOO_STATE (défaut /srv/toutou/shared/maxizoo-state.json), un code-barres n'est lu qu'une fois.
// Fiche relue à la main ou venue d'une photo : jamais touchée.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import pg from 'pg'
import { analyseLabel, scoreVersionFor } from '../lib/scanner/analyse'
import { isMixedProduct, MAXI_ZOO_CATEGORIES, maxiZooLabel, pageText, parseMaxiZooPage, type MaxiZooItem } from '../lib/scanner/maxizoo'
import { baseSlug, cleanEan } from '../lib/scanner/slug'

const FEED = process.env.MAXIZOO_FEED || '/srv/toutou/shared/maxizoo-feed.csv.gz'
const STATE = process.env.MAXIZOO_STATE || '/srv/toutou/shared/maxizoo-state.json'
const PRIORITY = ['royal canin', 'pro plan', 'purina', 'hill', 'pedigree', 'edgard', 'eukanuba', 'cesar', 'orijen', 'acana', 'carnilove', 'real nature', 'select gold', 'premiere', 'multifit']
const USER_AGENT = 'Mozilla/5.0 (compatible; ToutouGourmet/1.0; +https://www.toutou-gourmet.com)'

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' } else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' } else if (c !== '\r') cell += c
  }
  return rows
}

type Item = MaxiZooItem & { url: string; image: string | null }

const IMAGE_HOST = 'https://images2.productserve.com/'

function loadItems(): Item[] {
  const [head, ...rows] = parseCsv(gunzipSync(readFileSync(FEED)).toString('utf8'))
  const at = (name: string) => head.indexOf(name)
  const seen = new Map<string, Item>()
  for (const r of rows) {
    const ean = cleanEan(r[at('ean')])
    const url = r[at('merchant_deep_link')] ?? ''
    const category = r[at('merchant_category')] ?? ''
    const name = r[at('product_name')] ?? ''
    if (!ean || !MAXI_ZOO_CATEGORIES[category] || !url.startsWith('https://www.maxizoo.fr/p/') || isMixedProduct(name) || seen.has(ean)) continue
    const image = r[at('aw_image_url')] ?? ''
    seen.set(ean, { ean, url, category, name, brand: r[at('brand_name')] ?? '', image: image.startsWith(IMAGE_HOST) ? image : null })
  }
  const rank = (i: Item) => {
    const p = PRIORITY.findIndex((b) => i.brand.toLowerCase().includes(b))
    return (i.ean.startsWith('205') ? 100 : 0) + (p < 0 ? 50 : p)
  }
  return [...seen.values()].sort((a, b) => rank(a) - rank(b) || a.ean.localeCompare(b.ean))
}

async function main(): Promise<void> {
  const limit = Number(/--limite=(\d+)/.exec(process.argv.join(' '))?.[1] ?? 100)
  const dry = process.argv.includes('--essai')
  const state: Record<string, string> = existsSync(STATE) ? (JSON.parse(readFileSync(STATE, 'utf8')) as Record<string, string>) : {}
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const all = loadItems()
  // Image : sans lire aucune page, pour toute fiche dont le code-barres est dans le fichier.
  const withImage = all.filter((i) => i.image)
  if (!dry) {
    const updated = await pool.query(
      `UPDATE app.food_analysis f SET image_url = v.image FROM unnest($1::text[], $2::text[]) AS v(ean, image) WHERE f.ean = v.ean AND f.image_url IS DISTINCT FROM v.image`,
      [withImage.map((i) => i.ean), withImage.map((i) => i.image)],
    )
    console.log(`${updated.rowCount ?? 0} images ajoutées`)
  }
  const items = all.filter((i) => !state[i.ean]).slice(0, limit)
  const counts: Record<string, number> = {}
  const note = (ean: string, result: string) => {
    counts[result] = (counts[result] ?? 0) + 1
    if (!dry && result !== 'erreur-reseau') state[ean] = result
  }
  for (const item of items) {
    try {
      const res = await fetch(item.url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(25_000) })
      if (!res.ok) { note(item.ean, res.status === 404 ? 'page-absente' : 'erreur-reseau'); continue }
      const page = parseMaxiZooPage(pageText(await res.text()))
      if (!page.ok) { note(item.ean, page.reason); continue }
      const label = maxiZooLabel(item, page)
      if (!label) { note(item.ean, 'composition-absente'); continue }
      const details = analyseLabel(label)
      if (details.score === null) { note(item.ean, 'pas-de-note'); continue }
      const { rows } = await pool.query<{ id: string; source: string; reviewed: boolean; score: number | null }>('SELECT id, source, reviewed, score FROM app.food_analysis WHERE ean = $1', [item.ean])
      const existing = rows[0]
      if (existing && (existing.reviewed || existing.source === 'photo')) { note(item.ean, 'fiche-gardee'); continue }
      if (dry) { note(item.ean, existing ? 'a-mettre-a-jour' : 'a-creer'); continue }
      const version = scoreVersionFor(label)
      if (existing) {
        await pool.query(`UPDATE app.food_analysis SET extracted = $2, details = $3, score = $4, algorithm_version = $5, model = 'maxizoo', source = 'maxizoo', brand = $6, product = $7, image_url = $8, updated_at = now() WHERE id = $1`, [existing.id, JSON.stringify(label), JSON.stringify(details), details.score, version, label.marque, label.produit, item.image])
        note(item.ean, 'mise-a-jour')
      } else {
        const base = baseSlug(label.marque, label.produit, item.ean)
        await pool.query(
          `INSERT INTO app.food_analysis (ean, slug, brand, product, extracted, details, score, algorithm_version, model, source, scan_count, image_url)
           VALUES ($1, CASE WHEN EXISTS (SELECT 1 FROM app.food_analysis WHERE slug = $2) THEN $3 ELSE $2 END, $4, $5, $6, $7, $8, $9, 'maxizoo', 'maxizoo', 0, $10)`,
          [item.ean, base, `${base.slice(0, 92)}-${item.ean.slice(-6)}`, label.marque, label.produit, JSON.stringify(label), JSON.stringify(details), details.score, version, item.image],
        )
        note(item.ean, 'creee')
      }
    } catch (err) {
      console.error(`[maxizoo] ${item.ean}`, err instanceof Error ? err.message : err)
      // Une erreur de la base ne vient pas de la page : inutile d'en lire d'autres.
      if (err instanceof pg.DatabaseError) {
        process.exitCode = 1
        break
      }
      note(item.ean, 'erreur-reseau')
    }
    await new Promise((r) => setTimeout(r, 4000))
  }
  if (!dry) writeFileSync(STATE, JSON.stringify(state))
  console.log(`${items.length} pages lues`, JSON.stringify(counts))
  await pool.end()
}

void main()
