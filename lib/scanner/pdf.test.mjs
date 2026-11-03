// Tests de lib/scanner/pdf.ts : node --test lib/scanner/pdf.test.mjs
// pdf.ts n'a aucun import : on le transpile avec typescript (déjà installé) puis on l'importe.
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('./pdf.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const file = path.join(mkdtempSync(path.join(tmpdir(), 'pdf-test-')), 'pdf.mjs')
writeFileSync(file, outputText)
const { A4_POINTS, jpegToPdf } = await import(file)

const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x28, 0x29, 0x5c, 0x00, 0xff, 0xd9])
const latin1 = (bytes) => Buffer.from(bytes).toString('latin1')

test('une seule page A4, en-tête et fin de fichier', () => {
  const pdf = latin1(jpegToPdf({ jpeg: fakeJpeg, width: 1654, height: 2339 }))
  assert.ok(pdf.startsWith('%PDF-1.4\n'))
  assert.ok(pdf.endsWith('%%EOF\n'))
  assert.equal(pdf.match(/\/Type \/Page\b/g)?.length, 1)
  assert.match(pdf, /\/Count 1/)
  assert.match(pdf, new RegExp(`/MediaBox \\[0 0 ${A4_POINTS.width} ${A4_POINTS.height}\\]`))
  assert.match(pdf, /\/Width 1654 \/Height 2339 .*\/Filter \/DCTDecode \/Length 10 >>/)
})

test('le JPEG est copié octet pour octet dans le flux', () => {
  const bytes = jpegToPdf({ jpeg: fakeJpeg, width: 10, height: 10 })
  const pdf = latin1(bytes)
  const start = pdf.indexOf('stream\n') + 'stream\n'.length
  assert.deepEqual(bytes.slice(start, start + fakeJpeg.length), fakeJpeg)
})

test('chaque entrée xref pointe sur son objet et startxref sur la table', () => {
  const pdf = latin1(jpegToPdf({ jpeg: fakeJpeg, width: 10, height: 10, title: 'Fiche Pâtée (été)', links: [{ x: 0.8, y: 0.85, width: 0.1, height: 0.07, url: 'https://www.toutou-gourmet.com/croquettes/a-b' }] }))
  const startxref = Number(pdf.match(/startxref\n(\d+)\n%%EOF/)[1])
  assert.ok(pdf.startsWith('xref\n', startxref))
  const [, count] = pdf.slice(startxref).match(/^xref\n0 (\d+)\n/)
  const entries = pdf.slice(startxref).split('\n').slice(2, 2 + Number(count))
  assert.equal(entries.length, 8)
  assert.equal(entries[0], '0000000000 65535 f ')
  entries.slice(1).forEach((line, i) => {
    assert.equal(line.length + 1, 20)
    assert.ok(pdf.startsWith(`${i + 1} 0 obj\n`, Number(line.slice(0, 10))), `objet ${i + 1}`)
  })
  assert.match(pdf, /\/Size 8 \/Root 1 0 R/)
})

test('titre en UTF-16BE, lien converti en points (origine en bas)', () => {
  const pdf = latin1(jpegToPdf({ jpeg: fakeJpeg, width: 10, height: 10, title: 'Pâtée', links: [{ x: 0, y: 0, width: 0.5, height: 0.5, url: 'https://x.fr/a(b)' }] }))
  assert.match(pdf, /\/Title <FEFF005000E2007400E90065>/)
  assert.match(pdf, /\/Annots \[7 0 R\]/)
  assert.match(pdf, /\/Rect \[0 420\.95 297\.64 841\.89\]/)
  assert.match(pdf, /\/URI \(https:\/\/x\.fr\/a\\\(b\\\)\)/)
})
