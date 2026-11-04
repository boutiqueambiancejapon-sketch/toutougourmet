// Tests du journal du scanner : l'écriture ne bloque jamais, table absente ou base en panne.
// Lancer : npx tsx scripts/test-scanner-events.ts
// Avec TEST_DATABASE_URL (base jetable, jamais la production) : table absente réelle, puis purge.
import assert from 'node:assert/strict'
import type { Pool } from 'pg'
import pg from 'pg'
import { accountHref, accountStatus, dogNamesLine, isAccountId } from '../lib/dashboard/account-status'
import { ALL_RESULTS, FAILURE_RESULTS, SCANNER_RESULTS, scanOriginLabel, summarizeEvents } from '../lib/scanner/scanner-events'
import { letterStatusOf } from '../lib/server/dashboard-subscribers'
import { flushScannerEvents, recordScannerEvent } from '../lib/server/scanner-events'
import { purgeScannerEvents } from './lib/purge-unverified.mjs'

const holder = globalThis as unknown as { tgPool?: Pool | null }
const fakePool = (query: () => Promise<unknown>) => ({ query }) as unknown as Pool
const EVENT = { type: 'code', result: 'found', userId: 'compte-secret-123' } as const

function captureErrors(): { lines: string[]; restore: () => void } {
  const lines: string[] = []
  const original = console.error
  console.error = (...args: unknown[]) => lines.push(args.join(' '))
  return { lines, restore: () => (console.error = original) }
}

let passed = 0
async function test(name: string, fn: () => void | Promise<void>) {
  await fn()
  passed++
  console.log(`ok - ${name}`)
}

function returnsAtOnce(fn: () => void): void {
  const start = performance.now()
  fn()
  assert.ok(performance.now() - start < 20, 'doit rendre la main tout de suite')
}

async function main() {
  await test('sans base : rien à faire, pas d’erreur', () => {
    holder.tgPool = null
    returnsAtOnce(() => recordScannerEvent(EVENT))
  })

  await test('base bloquée : la réponse n’attend pas, et les écritures en attente sont bornées', async () => {
    const release: (() => void)[] = []
    holder.tgPool = fakePool(() => new Promise<void>((resolve) => release.push(resolve)))
    returnsAtOnce(() => {
      for (let i = 0; i < 500; i++) recordScannerEvent(EVENT)
    })
    assert.equal(release.length, 200)
    await flushScannerEvents(10)
    for (const go of release) go()
    await flushScannerEvents()
  })

  await test('requête qui échoue (table absente) : pas d’exception, journal sans identifiant', async () => {
    const log = captureErrors()
    holder.tgPool = fakePool(() => Promise.reject(Object.assign(new Error('relation "analytics.scanner_events" n’existe pas, compte-secret-123'), { code: '42P01' })))
    try {
      returnsAtOnce(() => recordScannerEvent(EVENT))
      await new Promise((r) => setTimeout(r, 5))
    } finally {
      log.restore()
    }
    assert.ok(log.lines.some((l) => l.includes('42P01')))
    assert.ok(!log.lines.some((l) => l.includes('compte-secret-123')))
  })

  await test('exception levée par le client : avalée', () => {
    const log = captureErrors()
    holder.tgPool = fakePool(() => {
      throw new Error('panne')
    })
    try {
      returnsAtOnce(() => recordScannerEvent(EVENT))
    } finally {
      log.restore()
    }
    assert.equal(log.lines.length, 1)
  })

  await test('résultats : chaque valeur a un libellé, liste identique à la contrainte SQL', async () => {
    const { readFileSync } = await import('node:fs')
    const sql = readFileSync('db/analytics.sql', 'utf8')
    const inCheck = /scanner_events_result_check CHECK \(result IN \(([\s\S]*?)\)\);/.exec(sql)?.[1] ?? ''
    const values = [...inCheck.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort()
    assert.deepEqual(values, [...ALL_RESULTS].sort())
    for (const r of ALL_RESULTS) assert.ok(SCANNER_RESULTS[r].label)
    for (const r of ['blurry', 'provider_error', 'quota_reached', 'daily_cap', 'lookup_error'] as const) assert.ok(FAILURE_RESULTS.includes(r))
    for (const r of ['found', 'incomplete', 'not_found', 'not_scorable'] as const) assert.ok(!FAILURE_RESULTS.includes(r))
  })

  await test('chiffres : par type, échecs et introuvables séparés', () => {
    const counts = summarizeEvents([
      { scan_type: 'code', result: 'found', today: 2, week: 5 },
      { scan_type: 'code', result: 'not_found', today: 1, week: 3 },
      { scan_type: 'photo', result: 'blurry', today: 1, week: 2 },
      { scan_type: 'photo', result: 'incomplete', today: 0, week: 1 },
      { scan_type: 'photo', result: 'inconnu-futur', today: 1, week: 1 },
    ])
    assert.deepEqual(counts.today, { code: 3, photo: 2, failures: 1, missing: 1 })
    assert.deepEqual(counts.week, { code: 8, photo: 4, failures: 2, missing: 3 })
  })

  await test('origine d’un scan : déduite seulement quand c’est possible', () => {
    assert.equal(scanOriginLabel({ fromCache: false, source: 'photo', eventType: null }), 'photo')
    assert.equal(scanOriginLabel({ fromCache: false, source: 'openpetfoodfacts', eventType: null }), 'code-barres')
    assert.equal(scanOriginLabel({ fromCache: true, source: 'photo', eventType: null }), 'fiche déjà connue')
    assert.equal(scanOriginLabel({ fromCache: true, source: 'openpetfoodfacts', eventType: 'code' }), 'code-barres, fiche déjà connue')
    assert.equal(scanOriginLabel({ fromCache: true, source: 'openpetfoodfacts', eventType: 'photo' }), 'photo, fiche déjà connue')
  })

  await test('pastille et adresse de la fiche : jamais l’e-mail dans l’URL', () => {
    assert.equal(accountStatus({ verified: false, dogs: 2 }).label, 'À confirmer')
    assert.equal(accountStatus({ verified: true, dogs: 0 }).label, 'Sans chien')
    assert.equal(accountStatus({ verified: true, dogs: 1 }).label, 'Confirmé')
    assert.equal(dogNamesLine([]), 'Aucun chien')
    assert.equal(dogNamesLine(['Rex', 'Lila']), 'Rex, Lila')
    assert.ok(!isAccountId('marie@exemple.fr'))
    assert.ok(!isAccountId('../../etc'))
    assert.ok(isAccountId('aB3dE6gH9jK2mN5pQ8sT1vW4yZ7cF0hL'))
    assert.equal(accountHref('abc12345'), '/tableau-de-bord/conversions/comptes/abc12345')
  })

  await test('lettre : Brevo en panne ou absent donne « unknown », jamais une exception', async () => {
    const realFetch = globalThis.fetch
    const log = captureErrors()
    process.env.BREVO_API_KEY = 'cle-factice'
    process.env.BREVO_LIST_ID = '5'
    const answer = (status: number, body: unknown) => (async () => new Response(JSON.stringify(body), { status })) as typeof fetch
    try {
      globalThis.fetch = answer(404, {})
      assert.equal((await letterStatusOf('a@exemple.fr')).state, 'absent')
      globalThis.fetch = answer(200, { listIds: [5] })
      assert.equal((await letterStatusOf('a@exemple.fr')).state, 'subscribed')
      globalThis.fetch = answer(200, { listIds: [5], listUnsubscribed: [5] })
      assert.equal((await letterStatusOf('a@exemple.fr')).state, 'unsubscribed')
      globalThis.fetch = answer(200, { listIds: [9] })
      assert.equal((await letterStatusOf('a@exemple.fr')).state, 'absent')
      globalThis.fetch = answer(500, {})
      assert.equal((await letterStatusOf('secret@exemple.fr')).state, 'unknown')
      globalThis.fetch = (async () => {
        throw new TypeError('secret@exemple.fr réseau')
      }) as typeof fetch
      assert.equal((await letterStatusOf('secret@exemple.fr')).state, 'unknown')
      delete process.env.BREVO_API_KEY
      assert.equal((await letterStatusOf('secret@exemple.fr')).state, 'unknown')
    } finally {
      globalThis.fetch = realFetch
      log.restore()
      delete process.env.BREVO_LIST_ID
    }
    assert.ok(!log.lines.some((l) => l.includes('secret@exemple.fr')))
  })

  const url = process.env.TEST_DATABASE_URL
  if (url) {
    const pool = new pg.Pool({ connectionString: url, max: 2 })
    try {
      await test('base réelle : purge à 90 jours, dry sans effet, récent gardé', async () => {
        await pool.query(`DELETE FROM analytics.scanner_events WHERE result = 'bad_type'`)
        await pool.query(`INSERT INTO analytics.scanner_events (created_at, scan_type, result) VALUES (now() - interval '91 days', 'photo', 'bad_type'), (now() - interval '89 days', 'photo', 'bad_type')`)
        assert.equal(await purgeScannerEvents(pool, { dry: true }), 1)
        assert.equal(await purgeScannerEvents(pool), 1)
        const { rows } = await pool.query<{ n: number }>(`SELECT count(*)::int AS n FROM analytics.scanner_events WHERE result = 'bad_type'`)
        assert.equal(rows[0].n, 1)
        await pool.query(`DELETE FROM analytics.scanner_events WHERE result = 'bad_type'`)
      })
      await test('base réelle : un texte libre est refusé par la contrainte', async () => {
        await assert.rejects(pool.query(`INSERT INTO analytics.scanner_events (scan_type, result) VALUES ('code', 'Error: marie@exemple.fr')`))
      })
      await test('base réelle : écriture de bout en bout', async () => {
        holder.tgPool = pool
        recordScannerEvent({ type: 'photo', result: 'too_large' })
        await flushScannerEvents()
        const { rows } = await pool.query<{ n: number }>(`DELETE FROM analytics.scanner_events WHERE result = 'too_large' RETURNING 1 AS n`)
        assert.equal(rows.length, 1)
      })
    } finally {
      holder.tgPool = null
      await pool.end()
    }
  } else {
    console.log('(TEST_DATABASE_URL absent : tests sur base réelle sautés)')
  }

  console.log(`${passed} tests passés`)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
