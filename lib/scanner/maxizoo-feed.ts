import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { isMixedProduct, MAXI_ZOO_CATEGORIES, type MaxiZooItem } from './maxizoo'
import { cleanEan } from './slug'

// @cdc scanner — lecture du fichier Awin de Maxi Zoo, partagée par l'import des fiches et la recherche des articles.

export type FeedItem = MaxiZooItem & { url: string; image: string | null; buy: string | null; prix: number | null; prixKg: number | null; prixAncien: number | null }

const euros = (s: string | undefined): number | null => {
  const n = Number((s ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null
}

const IMAGE_HOST = 'https://images2.productserve.com/'
const BUY_LINK = /^https:\/\/www\.awin1\.com\/pclick\.php\?p=\d+&a=1112904&m=68698$/
const PRIORITY = ['royal canin', 'pro plan', 'purina', 'hill', 'pedigree', 'edgard', 'eukanuba', 'cesar', 'orijen', 'acana', 'carnilove', 'real nature', 'select gold', 'premiere', 'multifit']

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

/** Produits du fichier Awin, marques connues d'abord, sans doublon de code-barres. */
export function loadFeedItems(path: string, opts: { anyCategory?: boolean } = {}): FeedItem[] {
  const [head, ...rows] = parseCsv(gunzipSync(readFileSync(path)).toString('utf8'))
  const at = (name: string) => head.indexOf(name)
  const seen = new Map<string, FeedItem>()
  for (const r of rows) {
    const raw = r[at('ean')] ?? ''
    // Le fichier perd les zéros de tête (Hill's, Orijen, Acana) : la caméra lit 13 chiffres, avec ces zéros.
    const ean = cleanEan(raw.length === 11 ? `00${raw}` : raw)
    const url = r[at('merchant_deep_link')] ?? ''
    const category = r[at('merchant_category')] ?? ''
    const name = r[at('product_name')] ?? ''
    if (!ean || !(opts.anyCategory || MAXI_ZOO_CATEGORIES[category]) || !url.startsWith('https://www.maxizoo.fr/p/') || isMixedProduct(name) || seen.has(ean)) continue
    const image = r[at('aw_image_url')] ?? ''
    const buy = r[at('aw_deep_link')] ?? ''
    const prix = euros(r[at('search_price')])
    const ancien = euros(r[at('product_price_old')])
    // Prix au kilo : seulement quand Maxi Zoo l'exprime en €/kg (pas en €/l ni à la pièce).
    const prixKg = /€\s*\/\s*kg/i.test(r[at('base_price_amount')] ?? '') ? euros(r[at('base_price')]) : null
    seen.set(ean, { ean, url, category, name, brand: r[at('brand_name')] ?? '', image: image.startsWith(IMAGE_HOST) ? image : null, buy: BUY_LINK.test(buy) ? buy : null, prix, prixKg, prixAncien: prix && ancien && ancien > prix ? ancien : null })
  }
  const rank = (i: FeedItem) => {
    const p = PRIORITY.findIndex((b) => i.brand.toLowerCase().includes(b))
    // Pâtées d'abord : le classement humide manque d'autres marques que les partenaires (décision du 2026-11-05)
    const wet = MAXI_ZOO_CATEGORIES[i.category]?.typeAliment === 'humide' || /Compléments/.test(i.category) ? 0 : 200
    return wet + (i.ean.startsWith('205') ? 100 : 0) + (p < 0 ? 50 : p)
  }
  return [...seen.values()].sort((a, b) => rank(a) - rank(b) || a.ean.localeCompare(b.ean))
}
