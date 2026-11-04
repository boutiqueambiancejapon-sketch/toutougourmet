// Vérifie les calculs du CRM, sans base : npx tsx scripts/test-crm.ts
import assert from 'node:assert/strict'
import { contactLine, contactStatus, contactsOf, filterContacts, stepLabel, summarize } from '../lib/dashboard/crm'
import type { TrackingRow } from '../lib/dashboard/email-tracking'
import { nextStepFor, type AddressFacts } from '../lib/server/welcome-sequence'

const NOW = new Date('2026-11-04T12:00:00Z')
const r = (over: Partial<TrackingRow>): TrackingRow => ({ hash: 'h', email: 'a@x.fr', source: 'guide', listedAt: new Date('2026-11-01T10:00:00Z'), listStatus: 'actif', account: null, sentSteps: [], internal: false, optedOut: false, sends: [], ...over })
const acc = (over = {}) => ({ id: 'abcd1234', createdAt: new Date('2026-11-02T10:00:00Z'), verified: true, dogs: 1, dogNames: ['Pixel'], ...over })

const rows = [
  r({ hash: '1', email: 'lettre@x.fr' }),
  r({ hash: '2', email: 'compte@x.fr', listedAt: null, listStatus: null, source: null, account: acc() }),
  r({ hash: '3', email: 'nouveau@x.fr', listedAt: null, listStatus: null, source: null, account: acc({ verified: false, dogs: 0, dogNames: [] }) }),
  r({ hash: '4', email: 'sanschien@x.fr', listedAt: null, listStatus: null, source: null, account: acc({ dogs: 0, dogNames: [] }) }),
  r({ hash: '5', email: 'parti@x.fr', listStatus: 'desinscrit', listedAt: new Date('2026-10-01T10:00:00Z'), sends: [{ label: 'Guide PDF', subject: null, state: 'failed', at: new Date('2026-11-03T10:00:00Z') }] }),
  r({ hash: '6', email: 'test@x.fr', internal: true }),
  r({ hash: '7', email: null }),
]
const contacts = contactsOf(rows)
assert.equal(contacts.length, 5, 'ni test ni adresse perdue')
assert.deepEqual(filterContacts(contacts, 'comptes', '').map((c) => c.hash), ['2', '3', '4'])
assert.deepEqual(filterContacts(contacts, 'lettre', '').map((c) => c.hash), ['1'])
assert.deepEqual(filterContacts(contacts, 'confirmer', '').map((c) => c.hash), ['3'])
assert.deepEqual(filterContacts(contacts, 'sans-chien', '').map((c) => c.hash), ['4'])
assert.deepEqual(filterContacts(contacts, 'desinscrits', '').map((c) => c.hash), ['5'])
assert.deepEqual(filterContacts(contacts, 'tous', 'pixel').map((c) => c.hash), ['2'], 'recherche par chien')
assert.deepEqual(filterContacts(contacts, 'tous', 'PARTI').map((c) => c.hash), ['5'])

assert.equal(contactStatus(contacts[0]).label, 'Lettre')
assert.equal(contactStatus(contacts[1]).label, 'Compte')
assert.equal(contactStatus(contacts[2]).label, 'À confirmer')
assert.equal(contactStatus(contacts[3]).label, 'Sans chien')
assert.equal(contactStatus(contacts[4]).label, 'Désinscrit')

const s = summarize(rows, 1, new Date('2026-10-28T00:00:00Z'), NOW)
assert.equal(s.total, 5)
assert.equal(s.added, 4)
assert.deepEqual(s.funnel.map((f) => f.value), [5, 3, 2, 1, 1])
assert.deepEqual(s.watch.map((w) => w.value), [1, 1, 1, 1])

assert.equal(stepLabel('j2'), 'Suite, jour 2 : la ration')
assert.equal(stepLabel('chien-j1'), 'Rappel, jour 1 : ajouter son chien')
assert.match(contactLine(contacts[4], null, NOW), /Plus aucun/)
assert.match(contactLine(contacts[0], { step: 'j2', inDays: 1 }, NOW), /Prochain e-mail : Suite, jour 2.*demain/)
assert.match(contactLine(contacts[1], null, NOW), /Aucun e-mail/)

const opts = { today: '2026-11-04', start: '2026-11-01', reminders: true }
const f = (over: Partial<AddressFacts>): AddressFacts => ({ contact: { createdAt: '2026-11-03T10:00:00Z', blacklisted: false }, account: null, sent: new Set(), optedOut: false, ...over })
assert.deepEqual(nextStepFor(f({}), opts), { step: 'j2', inDays: 1 })
assert.deepEqual(nextStepFor(f({ sent: new Set(['j2']) }), opts), { step: 'compte-j4', inDays: 3 })
assert.deepEqual(nextStepFor(f({ sent: new Set(['j5']) }), opts), { step: 'j10', inDays: 9 }, 'jamais de retour en arrière')
assert.equal(nextStepFor(f({ sent: new Set(['j10']) }), opts), null)
assert.equal(nextStepFor(f({ optedOut: true }), opts), null)
assert.equal(nextStepFor(f({ contact: { createdAt: '2026-10-20T10:00:00Z', blacklisted: false } }), opts), null, 'inscrit avant le départ')
assert.deepEqual(nextStepFor(f({ sent: new Set(['j2']), account: { createdAt: '2026-11-03T10:00:00Z', verified: true, hasDog: false } }), opts), { step: 'chien-j1', inDays: 0 })
assert.deepEqual(nextStepFor(f({ sent: new Set(['j2']), account: { createdAt: '2026-11-03T10:00:00Z', verified: true, hasDog: true } }), opts), { step: 'j5', inDays: 6 }, 'pas d’invitation avec un compte')
assert.equal(nextStepFor(f({ contact: null, account: { createdAt: '2026-11-03T10:00:00Z', verified: false, hasDog: false } }), opts), null)
console.log('test-crm : tout passe')
