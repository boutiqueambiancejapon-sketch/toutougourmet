import { OPFF_FIELDS, type OpffProduct } from '@/lib/scanner/opff'

// @cdc lot 6 — requête serveur à l'API publique Open Pet Food Facts (données sous licence ODbL).
// Seul le code-barres part : aucune donnée de compte, aucune image. User-Agent qui identifie le
// site (demandé par Open Food Facts), délai court, pas de cache Next (le cache, c'est food_analysis).

const API = process.env.OPFF_API_URL || 'https://world.openpetfoodfacts.org/api/v2/product'
const USER_AGENT = 'ToutouGourmet/1.0 (https://www.toutou-gourmet.com/scanner; contact@toutou-gourmet.com)'
export const OPFF_TIMEOUT_MS = Number(process.env.OPFF_TIMEOUT_MS) || 4000

export type OpffLookup = { status: 'found'; product: OpffProduct } | { status: 'absent' } | { status: 'error'; reason: string }

export async function fetchOpffProduct(ean: string): Promise<OpffLookup> {
  if (process.env.OPFF_DISABLED === '1') return { status: 'absent' }
  let res: Response
  try {
    res = await fetch(`${API}/${ean}.json?fields=${OPFF_FIELDS}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(OPFF_TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch (err) {
    return { status: 'error', reason: err instanceof Error ? err.name : 'fetch' }
  }
  if (res.status === 404) return { status: 'absent' }
  if (!res.ok) return { status: 'error', reason: `http ${res.status}` }
  const json = (await res.json().catch(() => null)) as { status?: number; product?: OpffProduct } | null
  // status 0 : produit absent, ou présent dans une autre base (aliment humain, cosmétique)
  if (!json || json.status !== 1 || !json.product) return { status: 'absent' }
  return { status: 'found', product: json.product }
}
