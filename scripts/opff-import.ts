// Copie hebdomadaire d'Open Pet Food Facts (licence ODbL), dimanche 01 h 10, heure de Paris
// (deploy/toutou-opff-import.timer). Télécharge l'export JSONL compressé officiel, le lit ligne à
// ligne (jamais en entier en mémoire), garde les aliments pour chien dans app.opff_product et
// pré-note avec notre barème ceux dont la composition et les constituants suffisent, et les
// friandises dont la composition suffit (barème friandise) : fiches /croquettes/[slug], source openpetfoodfacts. Seules les fiches qui ont changé sont retraitées.
//
// Lancer depuis la racine du site, variables de /srv/toutou/shared/.env chargées :
//   node_modules/.bin/tsx scripts/opff-import.ts             (import complet)
//   … --dry               aucune écriture en base (lecture des empreintes seulement), compteurs affichés
//   … --limit=2000        s'arrête après 2 000 lignes lues
//   … --file=/chemin.jsonl.gz   lit un export déjà téléchargé (fichier gardé)
//   … --all               retraite aussi les fiches inchangées (après une évolution du barème)
//   … --force             lit l'export même s'il n'a pas changé depuis le dernier import réussi
// Variables : DATABASE_URL, OPFF_EXPORT_URL (par défaut l'export officiel ci-dessous).

import { createReadStream, createWriteStream } from 'node:fs'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'
import { createGunzip } from 'node:zlib'
import { desc, eq, isNotNull, sql } from 'drizzle-orm'
import { foodAnalysis, opffImportRun, opffProduct } from '../db/schema'
import {
  assessOpff,
  hashInput,
  normalizeOpffEan,
  opffSpecies,
  toOpffRecord,
  type OpffAssessment,
  type OpffDumpProduct,
  type OpffRecord,
} from '../lib/scanner/opff-import'
import { getDb, type Db } from '../lib/server/drizzle'
import { USER_AGENT } from '../lib/server/opff'
import { saveAnalysis } from '../lib/server/scanner'
import { updateAnalysis } from '../lib/server/scanner-review'
import { MARQUE_CORRIGEE } from '../lib/scanner/baremes/activation'

const EXPORT_URL = process.env.OPFF_EXPORT_URL || 'https://static.openpetfoodfacts.org/data/openpetfoodfacts-products.jsonl.gz'
const BATCH = 200

const args = process.argv.slice(2)
const arg = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
const dry = args.includes('--dry')
const all = args.includes('--all')
const force = args.includes('--force')
const limit = Number(arg('limit')) || Infinity
const localFile = arg('file')

type Counters = Record<string, number>
const counters: Counters = {}
const inc = (key: string, n = 1) => {
  counters[key] = (counters[key] ?? 0) + n
}

interface Pending {
  record: OpffRecord
  hash: string
  assessment: OpffAssessment
}

interface ExistingFiche {
  id: string
  source: string
  reviewed: boolean
}

const log = (msg: string) => console.log(`[opff] ${msg}`)
const mb = () => Math.round(process.memoryUsage().rss / 1024 / 1024)
/** Pic de mémoire du processus depuis son lancement (Mo) */
const peakMb = () => Math.round(process.resourceUsage().maxRSS / 1024)

async function download(dir: string, sinceModified: Date | null): Promise<{ file: string | null; modified: Date | null }> {
  const res = await fetch(EXPORT_URL, { headers: { 'User-Agent': USER_AGENT }, cache: 'no-store', signal: AbortSignal.timeout(15 * 60_000) })
  if (!res.ok || !res.body) throw new Error(`export Open Pet Food Facts : HTTP ${res.status}`)
  const header = res.headers.get('last-modified')
  const modified = header ? new Date(header) : null
  if (!force && sinceModified && modified && modified.getTime() <= sinceModified.getTime()) {
    await res.body.cancel()
    return { file: null, modified }
  }
  const file = join(dir, 'openpetfoodfacts-products.jsonl.gz')
  await pipeline(Readable.fromWeb(res.body as WebReadableStream<Uint8Array>), createWriteStream(file))
  log(`export téléchargé : ${Math.round((await stat(file)).size / 1024 / 1024)} Mo, modifié le ${modified?.toISOString() ?? '?'}`)
  return { file, modified }
}

async function loadExisting(db: Db | null) {
  const hashes = new Map<string, string>()
  const fiches = new Map<string, ExistingFiche>()
  if (!db) return { hashes, fiches }
  for (const r of await db.select({ ean: opffProduct.ean, hash: opffProduct.contentHash }).from(opffProduct)) hashes.set(r.ean, r.hash)
  const rows = await db
    .select({ ean: foodAnalysis.ean, id: foodAnalysis.id, source: foodAnalysis.source, reviewed: foodAnalysis.reviewed, corrigee: sql<boolean>`${foodAnalysis.extracted} ? ${MARQUE_CORRIGEE}` })
    .from(foodAnalysis)
    .where(isNotNull(foodAnalysis.ean))
  for (const r of rows) if (r.ean) fiches.set(r.ean, { id: r.id, source: r.source, reviewed: r.reviewed || r.corrigee })
  return { hashes, fiches }
}

const EXCLUDED = ['name', 'name_fr', 'brand', 'ingredients_text', 'ingredients_text_fr', 'nutriments', 'categories', 'additives', 'countries', 'image_url', 'lang', 'kind', 'scorable', 'score', 'indexable', 'skip_reason', 'last_modified', 'content_hash']

async function flush(db: Db | null, batch: Pending[], fiches: Map<string, ExistingFiche>): Promise<void> {
  if (batch.length === 0) return
  if (dry || !db) {
    for (const p of batch) if (p.assessment.scorable) inc(fiches.has(p.record.ean) ? 'fiches_a_mettre_a_jour' : 'fiches_a_creer')
    return
  }
  await db
    .insert(opffProduct)
    .values(
      batch.map(({ record, hash, assessment: a }) => ({
        ...record,
        scorable: a.scorable,
        score: a.scorable ? a.score : null,
        indexable: a.scorable && a.indexable,
        skipReason: a.scorable ? null : a.reason,
        contentHash: hash,
      })),
    )
    .onConflictDoUpdate({
      target: opffProduct.ean,
      set: { ...Object.fromEntries(EXCLUDED.map((c) => [c, sql.raw(`excluded.${c}`)])), updatedAt: sql`now()` },
    })
  for (const { record, assessment: a } of batch) {
    if (!a.scorable) continue
    const existing = fiches.get(record.ean)
    if (!existing) {
      const row = await saveAnalysis(a.label, record.ean, 'openpetfoodfacts', 'openpetfoodfacts', { scanCount: 0 })
      fiches.set(record.ean, { id: row.id, source: row.source, reviewed: row.reviewed })
      inc(row.source === 'openpetfoodfacts' && row.scanCount === 0 ? 'fiches_creees' : 'fiches_deja_la')
    } else if (existing.source === 'openpetfoodfacts' && !existing.reviewed) {
      await updateAnalysis(existing.id, a.label)
      inc('fiches_mises_a_jour')
    } else inc(existing.reviewed ? 'fiches_relues_gardees' : 'fiches_photo_gardees')
  }
}

async function readExport(file: string, db: Db | null): Promise<void> {
  const { hashes, fiches } = await loadExisting(db)
  log(`${hashes.size} fiches déjà copiées, ${fiches.size} analyses avec code-barres`)
  const seen = new Set<string>()
  let batch: Pending[] = []
  const rl = createInterface({ input: createReadStream(file).pipe(createGunzip()), crlfDelay: Infinity })
  for await (const line of rl) {
    if ((counters.lus ?? 0) >= limit) break
    inc('lus')
    if (counters.lus % 5000 === 0) log(`${counters.lus} lignes lues, mémoire ${mb()} Mo`)
    let p: OpffDumpProduct
    try {
      p = JSON.parse(line) as OpffDumpProduct
    } catch {
      inc('ignores:json-illisible')
      continue
    }
    const species = opffSpecies(p)
    if (species !== 'chien') {
      inc(`ignores:${species === 'chat' ? 'chat' : 'autre-animal-ou-inconnu'}`)
      continue
    }
    const ean = normalizeOpffEan(p.code)
    if (!ean) {
      inc('ignores:code-barres-invalide')
      continue
    }
    if (seen.has(ean)) {
      inc('ignores:doublon')
      continue
    }
    seen.add(ean)
    inc('chien')
    const record = toOpffRecord(ean, p)
    if (record.kind === 'treat') inc('chien_friandises')
    const hash = createHash('sha256').update(hashInput(record)).digest('hex')
    const previous = hashes.get(ean)
    if (previous === hash && !all) {
      inc('inchanges')
      continue
    }
    inc(previous ? 'modifies' : 'nouveaux')
    const assessment = assessOpff(record)
    if (assessment.scorable) {
      inc('notes')
      inc(record.kind === 'treat' ? 'notes_friandises' : 'notes_aliments_complets')
      if (assessment.indexable) inc('indexables_selon_regle')
    } else inc(`non_notes:${assessment.reason}`)
    batch.push({ record, hash, assessment })
    if (batch.length >= BATCH) {
      await flush(db, batch, fiches)
      batch = []
    }
  }
  await flush(db, batch, fiches)
  if (limit === Infinity) inc('absents_de_l_export', [...hashes.keys()].filter((e) => !seen.has(e)).length)
}

async function main(): Promise<void> {
  const started = Date.now()
  const db = getDb()
  if (!db && !dry) throw new Error('DATABASE_URL absent')
  let runId: number | null = null
  let lastOkDump: Date | null = null
  if (db && !dry) {
    const [lastOk] = await db
      .select({ dump: opffImportRun.dumpModified })
      .from(opffImportRun)
      .where(eq(opffImportRun.status, 'ok'))
      .orderBy(desc(opffImportRun.startedAt))
      .limit(1)
    lastOkDump = lastOk?.dump ?? null
    const [run] = await db.insert(opffImportRun).values({}).returning({ id: opffImportRun.id })
    runId = run.id
  }
  const dir = localFile ? null : await mkdtemp(join(tmpdir(), 'opff-'))
  let dumpModified: Date | null = null
  try {
    let file = localFile ?? null
    if (dir) {
      const d = await download(dir, all ? null : lastOkDump)
      file = d.file
      dumpModified = d.modified
    }
    if (!file) {
      log(`export inchangé depuis le dernier import (${dumpModified?.toISOString()}) : rien à lire.`)
      inc('export_inchange')
    } else await readExport(file, db)
    const seconds = Math.round((Date.now() - started) / 1000)
    inc('duree_s', seconds)
    inc('memoire_max_mo', peakMb())
    if (db && runId !== null)
      await db.update(opffImportRun).set({ status: 'ok', finishedAt: new Date(), counters, dumpModified }).where(eq(opffImportRun.id, runId))
    log(`${dry ? '--dry : rien écrit. ' : ''}terminé en ${seconds} s`)
    for (const [k, v] of Object.entries(counters).sort()) log(`  ${k.padEnd(40)} ${v}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (db && runId !== null)
      await db
        .update(opffImportRun)
        .set({ status: 'error', finishedAt: new Date(), counters, dumpModified, error: message.slice(0, 500) })
        .where(eq(opffImportRun.id, runId))
        .catch(() => undefined)
    throw err
  } finally {
    // Le fichier téléchargé ne reste jamais sur le disque (un --file fourni est gardé)
    if (dir) await rm(dir, { recursive: true, force: true })
  }
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('[opff] échec :', err instanceof Error ? err.message : String(err))
    process.exit(1)
  })
