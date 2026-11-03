import { OPFF_FIELDS, type OpffProduct } from '@/lib/scanner/opff'
import { opffSpecies } from '@/lib/scanner/opff-import'
import { findLocalProduct } from './opff-store'

// @cdc lot 6 — fiche produit par code-barres (données sous licence ODbL), dans cet ordre :
// 1. notre copie hebdomadaire d'Open Pet Food Facts (app.opff_product, scripts/opff-import.ts) ;
// 2. l'API publique d'Open Pet Food Facts ;
// 3. l'API d'Open Food Facts (même format), pour les produits pour animaux rangés dans la base
//    « humaine » ; seule une fiche d'aliment pour animaux y est retenue.
// Seul le code-barres part : aucune donnée de compte, aucune image. User-Agent qui identifie le
// site (demandé par Open Food Facts), délai court, pas de cache Next (le cache, c'est food_analysis).

const API = process.env.OPFF_API_URL || 'https://world.openpetfoodfacts.org/api/v2/product'
const OFF_API = process.env.OFF_API_URL || 'https://world.openfoodfacts.org/api/v2/product'
export const USER_AGENT = 'ToutouGourmet/1.0 (https://www.toutou-gourmet.com/scanner; contact@toutou-gourmet.com)'
export const OPFF_TIMEOUT_MS = Number(process.env.OPFF_TIMEOUT_MS) || 4000

/** local : notre copie · openpetfoodfacts : API OPFF · openfoodfacts : API Open Food Facts */
export type OpffOrigin = 'local' | 'openpetfoodfacts' | 'openfoodfacts'

export type OpffLookup = { status: 'found'; product: OpffProduct; origin: OpffOrigin } | { status: 'absent' } | { status: 'error'; reason: string }

type ApiProduct = OpffProduct & { product_type?: string }

async function fetchApi(base: string, ean: string, fields: string): Promise<{ status: 'found'; product: ApiProduct } | { status: 'absent' } | { status: 'error'; reason: string }> {
  let res: Response
  try {
    res = await fetch(`${base}/${ean}.json?fields=${fields}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(OPFF_TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch (err) {
    return { status: 'error', reason: err instanceof Error ? err.name : 'fetch' }
  }
  if (res.status === 404) return { status: 'absent' }
  if (!res.ok) return { status: 'error', reason: `http ${res.status}` }
  const json = (await res.json().catch(() => null)) as { status?: number; product?: ApiProduct } | null
  // status 0 : produit absent, ou présent dans une autre base (aliment humain, cosmétique)
  if (!json || json.status !== 1 || !json.product) return { status: 'absent' }
  return { status: 'found', product: json.product }
}

/** Open Food Facts : seulement un aliment pour animaux (sinon un biscuit « humain » serait noté). */
async function fetchOff(ean: string): Promise<OpffLookup> {
  if (process.env.OFF_DISABLED === '1') return { status: 'absent' }
  const r = await fetchApi(OFF_API, ean, `${OPFF_FIELDS},product_type`)
  if (r.status !== 'found') return r
  const pet = r.product.product_type === 'petfood' || opffSpecies(r.product) !== 'autre'
  return pet ? { status: 'found', product: r.product, origin: 'openfoodfacts' } : { status: 'absent' }
}

export async function fetchOpffProduct(ean: string): Promise<OpffLookup> {
  const local = await findLocalProduct(ean).catch((err: unknown) => {
    // Table absente (migration 0005 pas encore appliquée) ou base injoignable : on passe à l'API
    console.warn('[scanner] copie Open Pet Food Facts illisible', err instanceof Error ? err.message : err)
    return null
  })
  if (local) return { status: 'found', product: local, origin: 'local' }
  if (process.env.OPFF_DISABLED === '1') return { status: 'absent' }
  const live = await fetchApi(API, ean, OPFF_FIELDS)
  if (live.status === 'found') return { status: 'found', product: live.product, origin: 'openpetfoodfacts' }
  const off = await fetchOff(ean)
  // Les deux en erreur : on le dit ; une seule en erreur et l'autre sans fiche : absent
  if (off.status === 'absent' && live.status === 'error') return live
  return off
}
