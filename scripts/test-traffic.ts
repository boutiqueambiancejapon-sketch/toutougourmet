// Vérifie les calculs du trafic, sans base : npx tsx scripts/test-traffic.ts
import assert from 'node:assert/strict'
import { channelOf, channelsOf, durationLabel, entriesOf, funnelOf, isBounce, overviewOf, sitesOf, typesOf, type SessionRow } from '../lib/dashboard/traffic'

const s = (over: Partial<SessionRow>): SessionRow => ({ current: true, visitor: 'a', seconds: 0, views: 1, landing: '/chien/race/x', ref: null, device: 'mobile', names: ['Pageview'], ...over })

const hosts: [string | null, string][] = [
  [null, 'direct'], ['toutou-gourmet.com', 'direct'], ['dashboard.toutou-gourmet.com', 'direct'],
  ['google.com', 'google'], ['google.co.uk', 'google'], ['search.google.com', 'google'], ['gemini.google.com', 'ai'],
  ['chatgpt.com', 'ai'], ['www.perplexity.ai', 'ai'], ['com.google.android.gm', 'email'], ['mail.google.com', 'email'], ['webmail.free.fr', 'email'],
  ['bing.com', 'search'], ['fr.search.yahoo.com', 'search'], ['search.brave.com', 'search'], ['search.lilo.org', 'search'],
  ['facebook.com', 'social'], ['t.co', 'social'], ['notgoogle.com', 'other'], ['exemple.fr', 'other'],
]
for (const [host, expected] of hosts) assert.equal(channelOf(host), expected, String(host))

assert.equal(isBounce(s({})), true)
assert.equal(isBounce(s({ names: ['Pageview', 'Guide Popup View'] })), true, 'une fenêtre affichée seule reste un rebond')
assert.equal(isBounce(s({ names: ['Pageview', 'Affiliate Click'] })), false)
assert.equal(isBounce(s({ views: 2 })), false)

const rows = [
  s({ visitor: 'a', seconds: 100, views: 3, ref: 'google.com', names: ['Pageview', 'Affiliate Click', 'Tool Result'] }),
  s({ visitor: 'a', seconds: 0, ref: 'google.com' }),
  s({ visitor: 'b', seconds: 20, views: 2, landing: '/outils/ration', ref: 'chatgpt.com', names: ['Pageview', 'Guide Signup'] }),
  s({ current: false, visitor: 'c' }),
  s({ current: false, visitor: 'd', views: 2 }),
]
const o = overviewOf(rows)
assert.deepEqual(o.visitors, { current: 2, previous: 2 })
assert.deepEqual(o.sessions, { current: 3, previous: 2 })
assert.equal(o.bounce.current, 1 / 3)
assert.equal(o.bounce.previous, 1 / 2)
assert.equal(o.seconds, 40)
assert.equal(o.rates.clicks, 1 / 3)
assert.equal(o.rates.emails, 1 / 3)
assert.equal(o.rates.scans, 0)

const none = overviewOf([])
assert.equal(none.bounce.current, null)
assert.equal(none.seconds, null)
assert.equal(none.rates.clicks, 0)

const channels = channelsOf(rows)
assert.equal(channels[0].channel, 'google')
assert.equal(channels[0].sessions, 2)
assert.equal(channels[0].clickRate, 1 / 2)
assert.equal(channels.length, 2, 'la période d’avant ne compte pas')

assert.deepEqual(sitesOf([...rows, s({ ref: 'toutou-gourmet.com' })]), [{ label: 'google.com', value: 2 }, { label: 'chatgpt.com', value: 1 }])
assert.deepEqual(entriesOf(rows)[0], { page: '/chien/race/x', sessions: 2, bounce: 0.5 })
assert.deepEqual(funnelOf(rows).map((f) => f.value), [2, 1, 1, 1])

const types = typesOf([{ page: '/chien/race/x', views: 5, clicks: 1, emails: 0 }, { page: '/chien/race/y', views: 2, clicks: 0, emails: 1 }, { page: '/outils/ration', views: 9, clicks: 0, emails: 0 }])
assert.equal(types[0].views, 9)
assert.deepEqual([types[1].views, types[1].clicks, types[1].emails], [7, 1, 1])

assert.equal(durationLabel(42), '42 s')
assert.equal(durationLabel(60), '1 min')
assert.equal(durationLabel(100), '1 min 40')
console.log('test-traffic : tout passe')
