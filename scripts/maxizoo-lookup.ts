// Pour rédiger un avis : trouve un produit Maxi Zoo et lit sa page, sans rien écrire en base.
//   tsx scripts/maxizoo-lookup.ts royal canin mini adult   → produits dont le nom contient tous ces mots
//   tsx scripts/maxizoo-lookup.ts --lire=3182550402217     → composition, analyse, note et lien exact
// Fichier Awin hors du dépôt : MAXIZOO_FEED, sinon ~/tools/maxizoo-feed.csv.gz.
import { homedir } from 'node:os'
import { join } from 'node:path'
import { analyseLabel } from '../lib/scanner/analyse'
import { maxiZooLabel, pageText, parseMaxiZooPage } from '../lib/scanner/maxizoo'
import { loadFeedItems, type FeedItem } from '../lib/scanner/maxizoo-feed'

const FEED = process.env.MAXIZOO_FEED || join(homedir(), 'tools/maxizoo-feed.csv.gz')
const USER_AGENT = 'Mozilla/5.0 (compatible; ToutouGourmet/1.0; +https://www.toutou-gourmet.com)'

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

function search(items: FeedItem[], words: string[]): void {
  const wanted = words.map(fold)
  const found = items.filter((i) => wanted.every((w) => fold(`${i.brand} ${i.name}`).includes(w)))
  for (const i of found.slice(0, 30)) console.log(`${i.ean}  ${i.name}`)
  console.log(`${found.length} produit(s)`)
}

async function read(item: FeedItem): Promise<void> {
  console.log(`Nom : ${item.name}\nLien : ${item.buy ?? 'aucun lien exact : ne pas citer'}\nImage : ${item.image ?? 'aucune'}\nPage : ${item.url}`)
  const res = await fetch(item.url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(25_000) })
  if (!res.ok) throw new Error(`page illisible (${res.status}) : ne rien affirmer sur sa composition`)
  const page = parseMaxiZooPage(pageText(await res.text()))
  if (!page.ok) throw new Error(`composition illisible (${page.reason}) : ne rien affirmer sur sa composition`)
  console.log(`Composition : ${page.composition}\nAnalyse : ${JSON.stringify(page.constituants)}\nkcal/100 g : ${page.kcal100g ?? 'non indiqué'}`)
  const label = maxiZooLabel(item, page)
  console.log(`Note du scanner : ${label ? `${analyseLabel(label).score ?? 'aucune'}/100` : 'aucune'}`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const items = loadFeedItems(FEED)
  const ean = args.find((a) => a.startsWith('--lire='))?.slice('--lire='.length)
  if (!ean) return search(items, args)
  const item = items.find((i) => i.ean === ean)
  if (!item) throw new Error(`code-barres absent du fichier : ${ean}`)
  await read(item)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
})
