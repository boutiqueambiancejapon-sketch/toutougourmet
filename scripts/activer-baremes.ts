// Prépare les fiches pour les nouveaux barèmes, en une seule transaction : compléments, cendres Royal Canin,
// fusion des 2 doublons Ultra Premium Direct, type de Flamingo, rapport Elmut, puis recalcul de toutes les notes.
// Un écrit dans `extracted` sans recalcul rendrait fiche et note incohérentes : tout passe ensemble ou rien.
//   tsx scripts/activer-baremes.ts                : essai (annulé à la fin, rien ne reste en base)
//   tsx scripts/activer-baremes.ts --appliquer    : écrit, le jour de l'activation seulement
//   --sauvegardes=DOSSIER                         : défaut /srv/toutou/backups
// Refuse de tourner sans sauvegarde de moins de 36 h. --appliquer refuse si BAREMES_ACTIFS est faux.
import { readFileSync } from 'node:fs'
import pg from 'pg'
import { CENDRES_FAUSSES, corrigerFiche, refusSauvegarde, TYPE_FAUX, type Complement, type ExtractedBrut } from '../lib/scanner/baremes/activation'
import { BAREMES_ACTIFS, BAREMES_VERSION } from '../lib/scanner/baremes/config'
import { FUSIONS } from '../lib/scanner/baremes/fusions'
import { analyseBaremes } from '../lib/scanner/baremes/vers-score'
import { baseSlug } from '../lib/scanner/slug'
import { parseExtractedLabel } from '../lib/scanner/types'

interface Fiche {
  id: string
  slug: string
  ean: string | null
  extracted: ExtractedBrut
  score: number | null
}
interface Partenaire {
  brand: string
  product: string
  slug?: string
  rapportCaP?: { min: number; max: number }
}

const option = (nom: string) => process.argv.find((a) => a.startsWith(`--${nom}=`))?.split('=')[1]

async function fusionner(c: pg.PoolClient, ancien: string, garde: string): Promise<'fait' | 'deja' | 'garde-absente' | 'ean-occupe'> {
  const { rows } = await c.query<{ id: string; slug: string; ean: string | null; scan_count: number; image_url: string | null }>('SELECT id, slug, ean, scan_count, image_url FROM app.food_analysis WHERE slug = ANY($1)', [[ancien, garde]])
  const a = rows.find((r) => r.slug === ancien)
  const g = rows.find((r) => r.slug === garde)
  if (!a) return 'deja'
  if (!g) return 'garde-absente'
  if (g.ean && a.ean && g.ean !== a.ean) return 'ean-occupe'
  for (const table of ['app.scan_history', 'app.scan_report', 'analytics.scanner_events']) await c.query(`UPDATE ${table} SET food_analysis_id = $2 WHERE food_analysis_id = $1`, [a.id, g.id])
  const ean = g.ean ?? a.ean
  // Le code-barres est unique : il quitte l'ancienne fiche, supprimée, avant de rejoindre la fiche gardée.
  await c.query('DELETE FROM app.food_analysis WHERE id = $1', [a.id])
  await c.query(`UPDATE app.food_analysis SET ean = $2, scan_count = scan_count + $3, image_url = coalesce(image_url, $4), extracted = jsonb_set(extracted, '{ean}', to_jsonb($2::text)), updated_at = now() WHERE id = $1`, [g.id, ean, a.scan_count, a.image_url])
  return 'fait'
}

async function main(): Promise<void> {
  const appliquer = process.argv.includes('--appliquer')
  const refus = refusSauvegarde(option('sauvegardes') ?? '/srv/toutou/backups')
  if (refus) throw new Error(`Refus : ${refus}`)
  if (appliquer && !BAREMES_ACTIFS) throw new Error('Refus : --appliquer demande BAREMES_ACTIFS à true. Avec l\'interrupteur éteint, le site recalculerait les fiches avec l\'ancien barème.')
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquant')

  const complements = JSON.parse(readFileSync('data/baremes-complements.json', 'utf8')) as Complement[]
  const partenaires = JSON.parse(readFileSync('data/partner-fiches.json', 'utf8')) as Partenaire[]
  const rapports = new Map(partenaires.filter((p) => p.rapportCaP).map((p) => [p.slug ?? baseSlug(p.brand, p.product, null), p.rapportCaP]))

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const c = await pool.connect()
  const bilan = { fiches: 0, fichesCompletees: 0, valeursAjoutees: 0, valeursDejaLa: 0, slugsInconnus: 0, cendres: 0, types: 0, rapports: 0, fusions: {} as Record<string, string>, recalculees: 0, notesChangees: 0, sansNote: 0, controlesPerimes: 0 }
  try {
    await c.query('BEGIN')
    // Personne n'écrit de fiche pendant ce temps, y compris un import de nuit : il attendra la fin.
    await c.query('LOCK TABLE app.food_analysis IN SHARE ROW EXCLUSIVE MODE')
    for (const f of FUSIONS) bilan.fusions[f.ancien] = await fusionner(c, f.ancien, f.garde)
    const pasFaite = Object.entries(bilan.fusions).filter(([, v]) => v !== 'fait' && v !== 'deja')
    if (pasFaite.length) throw new Error(`Fusion impossible : ${JSON.stringify(pasFaite)}`)

    const { rows } = await c.query<Fiche>('SELECT id, slug, ean, extracted, score FROM app.food_analysis')
    bilan.fiches = rows.length
    const connus = new Set(rows.map((r) => r.slug))
    bilan.slugsInconnus = new Set(complements.filter((x) => !connus.has(x.slug)).map((x) => x.slug)).size
    for (const r of rows) {
      const cendre = CENDRES_FAUSSES.find((x) => x.slug === r.slug)
      const type = TYPE_FAUX.find((x) => x.slug === r.slug)
      const res = corrigerFiche(r.extracted, {
        complements: complements.filter((x) => x.slug === r.slug),
        cendres: cendre,
        type: type ? { typeImage: type.typeImage, typeProduit: type.typeProduit } : undefined,
        rapportCaP: rapports.get(r.slug),
      })
      if (res.ajoutes.length) bilan.fichesCompletees += 1
      bilan.valeursAjoutees += res.ajoutes.length
      bilan.valeursDejaLa += res.ignores.length
      if (res.cendres) bilan.cendres += 1
      if (res.type) bilan.types += 1
      if (res.rapport) bilan.rapports += 1
      const ecrit = res.ajoutes.length > 0 || res.cendres || res.type || res.rapport
      const details = analyseBaremes(parseExtractedLabel(res.extracted))
      if (details.score !== r.score) bilan.notesChangees += 1
      if (details.score === null) bilan.sansNote += 1
      bilan.recalculees += 1
      await c.query(`UPDATE app.food_analysis SET extracted = $2, details = $3, score = $4, algorithm_version = $5${ecrit ? ', updated_at = now()' : ''} WHERE id = $1`, [r.id, JSON.stringify(res.extracted), JSON.stringify(details), details.score, BAREMES_VERSION])
    }
    // Contrôles avant de valider : la moindre incohérence annule tout.
    const { rows: [k] } = await c.query<{ total: string; autres: string; ecart: string; sans_bareme: string; doublons: string }>(
      `SELECT count(*) AS total, count(*) FILTER (WHERE algorithm_version <> $1) AS autres,
              count(*) FILTER (WHERE (details->>'score')::int IS DISTINCT FROM score) AS ecart,
              count(*) FILTER (WHERE NOT details ? 'bareme') AS sans_bareme,
              count(*) FILTER (WHERE slug = ANY($2)) AS doublons FROM app.food_analysis`,
      [BAREMES_VERSION, FUSIONS.map((f) => f.ancien)],
    )
    if (Number(k.autres) || Number(k.ecart) || Number(k.sans_bareme) || Number(k.doublons) || Number(k.total) !== bilan.fiches) throw new Error(`Contrôle raté : ${JSON.stringify(k)}`)
    // Le contrôle IA porte sur le contenu de la fiche : une fiche complétée perd son statut jusqu'au prochain contrôle.
    const { rows: [p] } = await c.query<{ n: string }>(`SELECT count(*) AS n FROM app.food_check f JOIN app.food_analysis a ON a.id = f.food_analysis_id WHERE f.status = 'ok' AND f.content_hash <> md5(a.extracted::text)`)
    bilan.controlesPerimes = Number(p.n)
    await c.query(appliquer ? 'COMMIT' : 'ROLLBACK')
    console.log(JSON.stringify(bilan, null, 1))
    console.log(appliquer ? 'Écrit.' : 'Essai : tout est annulé, rien ne reste en base.')
  } catch (err) {
    await c.query('ROLLBACK').catch(() => undefined)
    throw err
  } finally {
    c.release()
    await pool.end()
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
