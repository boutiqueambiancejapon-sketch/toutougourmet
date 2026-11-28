// API Amazon Creators (Amazon.fr) partagée par scripts/amazon-offres.ts (recherche, la nuit) et scripts/amazon-prix.ts (prix, chaque heure).
// Débit du compte : 1 requête par seconde pour Toutou et QRT ensemble. Chaque script tourne sous le verrou commun
// /run/lock/amazon-api.lock (flock, unités systemd) et espace ses requêtes d'au moins 1,1 s.
import type { AmazonItem } from '../lib/scanner/amazon'

const TOKEN_URL = 'https://api.amazon.co.uk/auth/o2/token'
const SEARCH_URL = 'https://creatorsapi.amazon/catalog/v1/searchItems'
const GET_URL = 'https://creatorsapi.amazon/catalog/v1/getItems'
export const PAUSE_MS = 1100 // 1 requête par seconde au plus (limite de départ du compte)

let token = { value: '', until: 0 }
async function bearer(): Promise<string> {
  if (token.value && Date.now() < token.until) return token.value
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: process.env.AMAZON_CREATORS_ID, client_secret: process.env.AMAZON_CREATORS_SECRET, scope: 'creatorsapi::default' }),
  })
  const j = (await r.json()) as { access_token?: string; expires_in?: number }
  if (!j.access_token) throw new Error(`jeton Amazon refusé (${r.status})`)
  token = { value: j.access_token, until: Date.now() + ((j.expires_in ?? 3600) - 120) * 1000 }
  return token.value
}

export type Listing = { price?: { money?: { amount?: number } }; availability?: { type?: string } }
export type Item = { asin: string; itemInfo?: { title?: { displayValue?: string } }; offersV2?: { listings?: Listing[] } | null }

export async function search(keywords: string): Promise<AmazonItem[]> {
  const r = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${await bearer()}`, 'content-type': 'application/json', 'x-marketplace': 'www.amazon.fr' },
    body: JSON.stringify({ keywords, marketplace: 'www.amazon.fr', partnerTag: process.env.AMAZON_PARTNER_TAG, resources: ['itemInfo.title', 'offersV2.listings.price', 'offersV2.listings.availability'] }),
  })
  if (r.status === 429) throw new Error('quota Amazon atteint')
  const j = (await r.json().catch(() => ({}))) as { searchResult?: { items?: Item[] } }
  return (j.searchResult?.items ?? []).map((it) => {
    const l = it.offersV2?.listings?.[0]
    const type = l?.availability?.type ?? ''
    return { asin: it.asin, titre: it.itemInfo?.title?.displayValue ?? '', prix: l?.price?.money?.amount ?? null, dispo: type === 'IN_STOCK' || type === 'IN_STOCK_SCARCE' }
  })
}


/** Prix et disponibilité de 10 ASIN au plus (une requête). */
export async function getItems(asins: string[]): Promise<Map<string, { prix: number | null; dispo: boolean }>> {
  const r = await fetch(GET_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${await bearer()}`, 'content-type': 'application/json', 'x-marketplace': 'www.amazon.fr' },
    body: JSON.stringify({ itemIds: asins.slice(0, 10), itemIdType: 'ASIN', marketplace: 'www.amazon.fr', partnerTag: process.env.AMAZON_PARTNER_TAG, resources: ['offersV2.listings.price', 'offersV2.listings.availability'] }),
  })
  if (r.status === 429) throw new Error('quota Amazon atteint')
  const j = (await r.json().catch(() => ({}))) as { itemsResult?: { items?: Item[] } }
  const out = new Map<string, { prix: number | null; dispo: boolean }>()
  for (const it of j.itemsResult?.items ?? []) {
    const l = it.offersV2?.listings?.[0]
    const type = l?.availability?.type ?? ''
    out.set(it.asin, { prix: l?.price?.money?.amount ?? null, dispo: type === 'IN_STOCK' || type === 'IN_STOCK_SCARCE' })
  }
  return out
}
