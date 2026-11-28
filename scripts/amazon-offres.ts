// Même produit chez Amazon pour chaque fiche notée au moins 55 (décision du propriétaire du 2026-11-28) : recherche par l'API
// Amazon Creators (marque + produit), choix de la bonne fiche (lib/scanner/amazon.ts), écriture dans app.food_amazon.
// Lancé chaque nuit (deploy/toutou-amazon.timer) : Amazon impose des prix affichés de moins de 24 heures.
//   tsx scripts/amazon-offres.ts [--limite=2000] [--essai]
// Clés : AMAZON_CREATORS_ID, AMAZON_CREATORS_SECRET, AMAZON_PARTNER_TAG (coffre du centre de contrôle, /srv/toutou/shared/.env).
import pg from 'pg'
import { choisir, type AmazonItem } from '../lib/scanner/amazon'
import { isTherapeutic } from '../lib/scanner/fiche-lists'

const TOKEN_URL = 'https://api.amazon.co.uk/auth/o2/token'
const SEARCH_URL = 'https://creatorsapi.amazon/catalog/v1/searchItems'
const PAUSE_MS = 2000 // une requête toutes les 2 secondes (le débit accordé par Amazon dépend des ventes)

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

type Listing = { price?: { money?: { amount?: number } }; availability?: { type?: string } }
type Item = { asin: string; itemInfo?: { title?: { displayValue?: string } }; offersV2?: { listings?: Listing[] } | null }

async function search(keywords: string): Promise<AmazonItem[]> {
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  for (const k of ['AMAZON_CREATORS_ID', 'AMAZON_CREATORS_SECRET', 'AMAZON_PARTNER_TAG', 'DATABASE_URL']) if (!process.env[k]) throw new Error(`${k} manquant`)
  const limit = Number(/--limite=(\d+)/.exec(process.argv.join(' '))?.[1] ?? 2000)
  const dry = process.argv.includes('--essai')
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const { rows } = await pool.query<{ id: string; brand: string; product: string; score: number; prix: string | null; prix_kg: string | null }>(
    `SELECT f.id, f.brand, f.product, f.score, p.prix, p.prix_kg
       FROM app.food_analysis f LEFT JOIN app.food_price p ON p.food_analysis_id = f.id
       LEFT JOIN app.food_amazon a ON a.food_analysis_id = f.id
      WHERE NOT f.discarded AND f.score >= 55 AND f.brand IS NOT NULL AND f.product IS NOT NULL
      ORDER BY a.maj_le NULLS FIRST, f.scan_count DESC
      LIMIT $1`,
    [limit],
  )
  let found = 0, none = 0, gone = 0
  for (const f of rows) {
    if (isTherapeutic(f)) continue
    const poidsMz = f.prix && f.prix_kg && Number(f.prix_kg) > 0 ? Number(f.prix) / Number(f.prix_kg) : null
    // Amazon limite le débit (429) : on attend et on réessaie (1, 2, 4, 8 minutes) ; arrêt seulement après 5 refus de suite.
    let items: AmazonItem[] | null = null
    for (let essai = 0; essai < 5 && items === null; essai++) {
      try {
        items = await search(`${f.brand} ${f.product}`.replace(/\s+/g, ' ').trim().slice(0, 120))
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!/quota/.test(msg)) { console.error(`erreur : ${msg}`); break }
        await sleep(60_000 * 2 ** essai)
      }
    }
    if (items === null) {
      console.error('arrêt : Amazon refuse encore après 5 essais (débit ou quota du jour)')
      break
    }
    const c = choisir(items, f.brand, f.product, poidsMz)
    if (c) {
      found++
      if (!dry)
        await pool.query(
          `INSERT INTO app.food_amazon (food_analysis_id, asin, titre, prix, prix_kg, poids_kg, dispo, maj_le) VALUES ($1,$2,$3,$4,$5,$6,true,now())
           ON CONFLICT (food_analysis_id) DO UPDATE SET asin = EXCLUDED.asin, titre = EXCLUDED.titre, prix = EXCLUDED.prix, prix_kg = EXCLUDED.prix_kg,
             poids_kg = EXCLUDED.poids_kg, dispo = true, maj_le = now()`,
          [f.id, c.asin, c.titre.slice(0, 300), c.prix, c.prixKg, c.poidsKg],
        )
      else console.log(`${f.brand} ${f.product} → ${c.asin} ${c.prix} € (${c.prixKg ?? '?'} €/kg) « ${c.titre.slice(0, 70)} »`)
    } else {
      none++
      // Plus de fiche valable aujourd'hui : on garde la ligne mais le bouton disparaît (dispo = false).
      if (!dry) {
        const u = await pool.query('UPDATE app.food_amazon SET dispo = false, maj_le = now() WHERE food_analysis_id = $1 AND dispo', [f.id])
        gone += u.rowCount ?? 0
      }
    }
    await sleep(PAUSE_MS)
  }
  console.log(`${rows.length} fiches lues, ${found} trouvées sur Amazon, ${none} sans fiche valable, ${gone} retirées`)
  await pool.end()
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
