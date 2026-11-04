// Tests des listes publiques du scanner (fonctions pures, sans base).
// Lancer : npx tsx scripts/test-scanner-lists.ts
import { buyLink } from '../lib/scanner/buy-link'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { capPerBrand, ficheDateLabel, ficheMeta, isValidated, latestPool, LIST_ROBOTS, listStats, lowFiches, parseVue, seenInFrance, topFiches, type ListFiche } from '../lib/scanner/fiche-lists'

let passed = 0
function test(name: string, fn: () => void) {
  fn()
  passed++
  console.log(`ok - ${name}`)
}

const NOW = new Date('2026-11-04T17:00:00Z')

function fiche(slug: string, over: Partial<ListFiche> = {}): ListFiche {
  return {
    slug,
    brand: slug,
    product: `Produit ${slug}`,
    score: 60,
    kind: 'complete',
    noun: 'croquettes',
    reviewed: false,
    discarded: false,
    scanCount: 0,
    createdAt: new Date('2026-11-03T10:00:00Z'),
    lastScanAt: null,
    check: 'ok',
    countries: ['en:france'],
    complete: true,
    ...over,
  }
}

const slugs = (items: ListFiche[]) => items.map((f) => f.slug)

test('classements : contrôlée ok ou relue, jamais doute, rejet, écartée, incomplète ni non contrôlée', () => {
  const items = [
    fiche('ok'),
    fiche('relue', { reviewed: true, check: null }),
    fiche('doute', { check: 'doubt' }),
    fiche('rejet', { check: 'rejected' }),
    fiche('ecartee', { discarded: true }),
    fiche('incomplete', { complete: false }),
    fiche('non-controlee', { check: null }),
    fiche('vrai-scan-non-controle', { check: null, scanCount: 3, lastScanAt: NOW }),
    fiche('sans-note', { score: null }),
    fiche('friandise', { kind: 'treat' }),
  ]
  assert.deepEqual(new Set(slugs(topFiches(items, 'complete'))), new Set(['ok', 'relue']))
  assert.deepEqual(slugs(topFiches(items, 'treat')), ['friandise'])
})

test('relue puis rejetée par le contrôle : la décision humaine passe avant', () => {
  assert.equal(isValidated(fiche('a', { reviewed: true, check: 'rejected' })), true)
  assert.equal(isValidated(fiche('a', { reviewed: true, discarded: true })), false)
})

test('dernières fiches : validées, plus vrais scans non écartés, sans les rejets', () => {
  const items = [
    fiche('ok'),
    fiche('importee-non-controlee', { check: null }),
    fiche('importee-doute', { check: 'doubt' }),
    fiche('scan-non-controle', { check: null, scanCount: 1 }),
    fiche('scan-doute', { check: 'doubt', lastScanAt: NOW }),
    fiche('scan-rejete', { check: 'rejected', scanCount: 2 }),
    fiche('scan-ecarte', { check: null, scanCount: 2, discarded: true }),
    fiche('scan-sans-note', { check: null, scanCount: 1, score: null }),
    fiche('ok-sans-note', { score: null }),
  ]
  assert.deepEqual(new Set(slugs(latestPool(items))), new Set(['ok', 'scan-non-controle', 'scan-doute', 'scan-sans-note']))
})

test('dernières fiches : le vrai scan récent passe devant, tri stable', () => {
  const items = [fiche('vieux'), fiche('scan', { lastScanAt: NOW, createdAt: new Date('2026-10-01T00:00:00Z') }), fiche('recent', { createdAt: new Date('2026-11-04T10:00:00Z') })]
  assert.deepEqual(slugs(latestPool(items)), ['scan', 'recent', 'vieux'])
  assert.deepEqual(slugs(latestPool([fiche('t', { kind: 'treat' }), fiche('c')], 'treat')), ['t'])
})

test('3 fiches par marque au plus, variantes du nom de marque comprises', () => {
  const brand = (slug: string, name: string, score: number) => fiche(slug, { brand: name, score })
  const items = [brand('a', 'Josera', 90), brand('b', 'JOSERA', 89), brand('c', 'josera ', 88), brand('d', 'Joséra', 87), brand('e', 'Autre', 50)]
  assert.equal(capPerBrand(items).length, 4)
  const top = topFiches(items, 'complete')
  assert.deepEqual(slugs(top), ['a', 'b', 'c', 'e'])
})

test('top 10 au plus, trié par note, moins bien notées croissantes et sous 55', () => {
  const many = Array.from({ length: 14 }, (_, i) => fiche(`m${i}`, { score: 30 + i * 5 }))
  const top = topFiches(many, 'complete')
  assert.equal(top.length, 10)
  assert.deepEqual(top.map((f) => f.score), [95, 90, 85, 80, 75, 70, 65, 60, 55, 50])
  const low = lowFiches(many, 'complete')
  assert.deepEqual(low.map((f) => f.score), [30, 35, 40, 45, 50])
  assert.equal(lowFiches([fiche('haute', { score: 72 })], 'complete').length, 0)
  assert.equal(lowFiches([fiche('foie', { score: 30, brand: 'Royal Canin', product: 'Hepatic HF 16' })], 'complete').length, 0)
})

test('marques vues en France d’abord, sans inventer : pays inconnu après, pas exclu', () => {
  const foreign = Array.from({ length: 10 }, (_, i) => fiche(`us${i}`, { score: 90 - i, countries: ['en:united-states'] }))
  const french = [fiche('fr-basse', { score: 40 })]
  const unknown = [fiche('inconnue', { score: 99, countries: null })]
  const top = topFiches([...foreign, ...french, ...unknown], 'complete')
  assert.ok(slugs(top).includes('fr-basse'), 'la marque française entre malgré sa note')
  assert.equal(top.at(-1)?.slug, 'fr-basse', 'affichage par note')
  assert.ok(!slugs(top).includes('us9'))
  assert.equal(seenInFrance(['en:france']), true)
  assert.equal(seenInFrance(['en:germany']), false)
  assert.equal(seenInFrance(null), false)
  // Une seule fiche vue en France suffit pour sa marque
  const sameBrand = [fiche('x1', { brand: 'Marque X', score: 40, countries: ['en:france'] }), fiche('x2', { brand: 'Marque X', score: 50, countries: null })]
  const others = Array.from({ length: 10 }, (_, i) => fiche(`o${i}`, { score: 95 - i, countries: [] }))
  assert.ok(slugs(topFiches([...sameBrand, ...others], 'complete')).includes('x2'))
})

test('libellé de date : « Scanné » seulement pour un vrai scan', () => {
  const created = new Date('2026-11-03T10:00:00Z')
  assert.equal(ficheDateLabel({ lastScanAt: new Date('2026-11-04T15:00:00Z'), createdAt: created }, NOW).replaceAll(' ', ' '), 'Scanné il y a 2 h')
  assert.equal(ficheDateLabel({ lastScanAt: null, createdAt: created }, NOW), 'Analysée le 03/11')
  assert.equal(ficheDateLabel({ lastScanAt: null, createdAt: new Date('2025-02-09T10:00:00Z') }, NOW), 'Analysée le 09/02/2025')
  // Fuseau de Paris : 23 h 30 UTC le 3 novembre tombe le 4 à Paris
  assert.equal(ficheDateLabel({ lastScanAt: null, createdAt: new Date('2026-11-03T23:30:00Z') }, NOW), 'Analysée le 04/11')
  // Une fiche importée jamais scannée ne dit jamais « Scanné »
  assert.doesNotMatch(ficheMeta(fiche('importee'), { now: NOW }), /scann/i)
})

test('mentions : analyse automatique, fiche relue, réserve sur les notes basses', () => {
  assert.equal(ficheMeta(fiche('a'), { now: NOW }), 'Analysée le 03/11 · analyse automatique')
  assert.equal(ficheMeta(fiche('a', { reviewed: true }), { now: NOW }), 'Analysée le 03/11 · fiche relue')
  assert.equal(ficheMeta(fiche('a', { score: 54 }), { now: NOW }), 'Analysée le 03/11 · analyse automatique · selon la composition affichée')
  assert.equal(ficheMeta(fiche('a', { score: 55 }), { now: NOW }), 'Analysée le 03/11 · analyse automatique')
  assert.equal(ficheMeta(fiche('a', { noun: 'patee', score: 70 }), { now: NOW, showNoun: true }), 'pâtée · Analysée le 03/11 · analyse automatique')
})

test('statistiques : vrais comptes, fiches sans note hors moyenne', () => {
  assert.deepEqual(listStats([fiche('a', { score: 50 }), fiche('b', { score: 71 }), fiche('c', { score: null })]), { count: 2, average: 61 })
  assert.deepEqual(listStats([]), { count: 0, average: null })
})

test('onglets par adresse : valeur inconnue = Dernières fiches', () => {
  assert.equal(parseVue('top'), 'top')
  assert.equal(parseVue('moins'), 'moins')
  assert.equal(parseVue(['top', 'x']), 'top')
  assert.equal(parseVue('nimporte'), 'dernieres')
  assert.equal(parseVue(undefined), 'dernieres')
})

test('noindex, follow sur les deux pages, sans bouton de scan', () => {
  assert.deepEqual(LIST_ROBOTS, { index: false, follow: true })
  for (const page of ['app/(fr)/scanner/croquette/page.tsx', 'app/(fr)/scanner/friandise/page.tsx']) {
    const source = readFileSync(page, 'utf8')
    assert.match(source, /robots: LIST_ROBOTS/)
    assert.doesNotMatch(source, /use client/)
    assert.doesNotMatch(source, /ScannerTool|ScanStart/)
  }
  assert.doesNotMatch(readFileSync('components/scanner/lists/CategoryView.tsx', 'utf8'), /ScannerTool|ScanStart/)
  // Le sitemap ne connaît pas ces adresses
  assert.doesNotMatch(readFileSync('lib/sitemaps/entries.ts', 'utf8'), /scanner\/(croquette|friandise)/)
})

test('la publication ne dépend pas du contrôle IA', () => {
  const published = readFileSync('lib/server/scanner-published.ts', 'utf8')
  assert.doesNotMatch(published, /foodCheck|food_check/)
  assert.doesNotMatch(readFileSync('lib/server/scanner-catalog.ts', 'utf8'), /foodCheck|food_check/)
})

test('où acheter : partenaire, Maxi Zoo, Amazon sinon, jamais sous 55 ni pour un aliment thérapeutique', () => {
  assert.equal(buyLink({ brand: 'Ultra premium direct', product: 'Pâtée agneau', score: 96 })?.store, 'Ultra Premium Direct')
  assert.ok(buyLink({ brand: 'Ultra premium direct', product: 'Pâtée agneau', score: 96 })?.href.includes('ae=1346'))
  assert.equal(buyLink({ brand: 'Pedigree', product: 'Rodeo', score: 60 })?.store, 'Maxi Zoo')
  assert.ok(buyLink({ brand: 'Pedigree', product: 'Rodeo', score: 60 })?.href.includes('awinaffid=1112904'))
  const other = buyLink({ brand: 'Josera', product: 'SensiAdult', score: 56 })
  assert.equal(other?.store, 'Amazon')
  assert.ok(other?.amazon && other.href.includes('tag=ambiancejap0a-21') && other.href.includes('Josera'))
  assert.equal(buyLink({ brand: 'Pedigree', product: 'Rodeo', score: 41 }), null)
  assert.equal(buyLink({ brand: 'Royal Canin', product: 'Hepatic HF 16', score: 70 }), null)
  assert.equal(buyLink({ brand: null, product: 'X', score: 80 }), null)
})

console.log(`${passed} tests réussis`)
