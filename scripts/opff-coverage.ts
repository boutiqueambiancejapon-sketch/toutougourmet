// Couverture d'Open Pet Food Facts pour le scanner : part des croquettes chien vendues en France
// que notre barème peut noter sans photo. npx tsx scripts/opff-coverage.ts [pages]
import { OPFF_FIELDS, opffToLabel, type OpffProduct } from '../lib/scanner/opff'
import { analyseLabel } from '../lib/scanner/analyse'

const UA = 'ToutouGourmet/1.0 (https://www.toutou-gourmet.com/scanner; bonjour@toutou-gourmet.com)'

async function main() {
  const pages = Number(process.argv[2]) || 1
  const products: OpffProduct[] = []
  for (let page = 1; page <= pages; page++) {
    const url = `https://world.openpetfoodfacts.org/api/v2/search?categories_tags_en=dry-dog-food&countries_tags_en=france&fields=${OPFF_FIELDS}&page_size=100&page=${page}`
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) })
    const json = (await res.json()) as { products?: OpffProduct[] }
    products.push(...(json.products ?? []))
  }
  let complete = 0
  for (const p of products) {
    const v = opffToLabel(p, p.code ?? '')
    if (v.kind === 'complete') {
      complete++
      console.log(`${p.code}  ${analyseLabel(v.label).score}/100  ${v.label.marque} · ${v.label.produit}`)
    }
  }
  console.log(`\n${complete} notées sur ${products.length} croquettes chien (France) : ${Math.round((complete / Math.max(1, products.length)) * 100)} %`)
}

void main()
