// Tests des gabarits d'e-mails de la lettre. Lancer : npx tsx scripts/test-emails.ts
import assert from 'node:assert/strict'
import { getAllArticles, type Article } from '../lib/mdx'
import { BREVO_UNSUBSCRIBE_TAG, OFFER_ROTATION, buildMonthlyNewsletter, offerForMonth, pickGuides } from '../lib/emails/monthly'
import { SEASONAL_TIPS } from '../lib/emails/seasonal'
import { isFirstTuesday, nextFirstTuesday, sendInstant } from '../lib/emails/schedule'
import { buildUnsubscribeUrl, unsubscribeToken, verifyUnsubscribeToken } from '../lib/emails/unsubscribe'
import { WELCOME_SUBJECT, welcomeEmail } from '../lib/emails/welcome'
import { getBrandBySlug } from '../data/brands'
import { CONFIRMED_DISCOUNTS } from '../data/partner-discounts'
import { WELCOME_STEPS, offerSlugFor, welcomeStepEmail, type WelcomeStep } from '../lib/emails/welcome-sequence'
import { afterStart, capOnePerDay, daysSince, dueStep, emailHash, sequenceStart, stepForAddress, type AddressFacts, type SequenceStep } from '../lib/server/welcome-sequence'
import { REMINDER_STEPS, reminderEmail } from '../lib/emails/account-reminders'
import { buildTrackingRows, filterTracking, UNKNOWN_ADDRESS } from '../lib/dashboard/email-tracking'
import { flushEmailLog } from '../lib/server/email-log'
import { sendTransactionalEmail } from '../lib/server/mailer'

let passed = 0
function test(name: string, fn: () => void) {
  fn()
  passed++
  console.log(`ok - ${name}`)
}

const SECRET = 'secret-de-test'
const SITE = 'https://www.toutou-gourmet.com'
const articles = getAllArticles()

test('lien de désinscription signé : valide, invalide, autre secret, casse', () => {
  const url = new URL(buildUnsubscribeUrl('Marie.Dupont@Example.com', SECRET))
  assert.equal(url.origin + url.pathname, `${SITE}/newsletter/desinscription`)
  const e = url.searchParams.get('e') ?? ''
  const t = url.searchParams.get('t') ?? ''
  assert.equal(e, 'marie.dupont@example.com')
  assert.ok(verifyUnsubscribeToken(e, t, SECRET))
  assert.ok(verifyUnsubscribeToken('MARIE.DUPONT@example.com', t, SECRET))
  assert.ok(!verifyUnsubscribeToken('autre@example.com', t, SECRET))
  assert.ok(!verifyUnsubscribeToken(e, t, 'autre-secret'))
  const tampered = `${t[0] === 'A' ? 'B' : 'A'}${t.slice(1)}`
  assert.ok(!verifyUnsubscribeToken(e, tampered, SECRET))
  assert.ok(!verifyUnsubscribeToken(e, 'court', SECRET))
  assert.ok(!verifyUnsubscribeToken(e, t, ''))
  assert.ok(!verifyUnsubscribeToken('', unsubscribeToken('', SECRET), SECRET))
})

test('bienvenue : objet, liens des outils, désinscription, contact, version texte', () => {
  const unsub = buildUnsubscribeUrl('lecteur@example.com', SECRET)
  const mail = welcomeEmail(unsub)
  assert.equal(mail.subject, WELCOME_SUBJECT)
  assert.equal(mail.subject, 'Bienvenue chez Toutou Gourmet : 3 choses à garder sous la main')
  for (const path of ['/outils/ration', '/fiche-aliments-dangereux', '/scanner', '/outils', '/contact']) {
    assert.ok(mail.html.includes(`href="${SITE}${path}"`), `lien ${path} (html)`)
    assert.ok(mail.text.includes(`${SITE}${path}`), `lien ${path} (texte)`)
  }
  assert.ok(mail.html.includes(unsub.replace(/&/g, '&amp;')), 'désinscription signée (html)')
  assert.ok(mail.text.includes(unsub), 'désinscription signée (texte)')
  assert.ok(mail.html.includes("Merci de t&#39;être inscrit") || mail.html.includes("Merci de t'être inscrit"))
  assert.ok(mail.html.includes('Pour nous écrire, passe par le formulaire de contact du site'))
  assert.ok(mail.text.includes("L'équipe Toutou Gourmet"))
  assert.ok(!/<img/i.test(mail.html) || /src="https:\/\//.test(mail.html), 'images en URL absolues')
  assert.ok(mail.html.includes('max-width:600px'))
})

test("calendrier : premier mardi et 18 h à Paris (heure d'hiver et d'été)", () => {
  assert.ok(isFirstTuesday('2026-11-03'))
  assert.ok(!isFirstTuesday('2026-11-10'))
  assert.equal(nextFirstTuesday('2026-11-04'), '2026-12-01')
  assert.equal(sendInstant('2026-12-01').iso, '2026-12-01T18:00:00+01:00')
  assert.equal(sendInstant('2026-12-01').date.toISOString(), '2026-12-01T17:00:00.000Z')
  assert.equal(sendInstant('2027-06-01').iso, '2027-06-01T18:00:00+02:00')
})

test('rotation des offres : 5 offres confirmées sur 5 mois, jamais Fidelis', () => {
  const seen = new Set<string>()
  for (let m = 0; m < 5; m++) seen.add(offerForMonth(new Date(Date.UTC(2027, m, 5))))
  assert.equal(seen.size, 5)
  assert.ok(!OFFER_ROTATION.includes('fidelis' as never))
  for (const slug of OFFER_ROTATION) assert.ok(getBrandBySlug(slug), slug)
})

test('conseils de saison : 12 mois, chaque guide existe, deux phrases', () => {
  for (let m = 1; m <= 12; m++) {
    const tip = SEASONAL_TIPS[m]
    assert.ok(articles.some((a) => a.slug === tip.slug), `mois ${m} : ${tip.slug}`)
    assert.equal(tip.text.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length, 2, `mois ${m} : deux phrases`)
  }
})

test('lettre mensuelle : objet, blocs, liens, balise Brevo, croquette masquée sans fiche relue', () => {
  const date = sendInstant('2026-11-03').date
  const mail = buildMonthlyNewsletter(date, { articles, topFood: null })
  const featured = articles.find((a) => a.slug === mail.featuredSlug) as Article
  assert.equal(mail.subject, featured.frontmatter.title)
  assert.ok(mail.guideSlugs.length >= 4 && mail.guideSlugs.length <= 6)
  assert.ok(!mail.guideSlugs.includes(mail.featuredSlug))
  assert.ok(mail.html.includes(`href="${BREVO_UNSUBSCRIBE_TAG}"`))
  assert.ok(mail.html.includes('lien partenaire') || mail.html.includes('Lien partenaire'))
  assert.ok(mail.html.includes(getBrandBySlug(mail.offerSlug)?.affiliateUrl ?? '?'))
  assert.ok(mail.html.includes('rel="sponsored nofollow"'))
  assert.ok(!mail.html.includes('meilleure note du mois'))
  assert.ok(/<img src="https:\/\/www\.toutou-gourmet\.com\/images\//.test(mail.html), 'couverture absolue')
  assert.ok(mail.html.includes('Le conseil de saison'))
  assert.equal(mail.seasonalSlug, 'chataignes-marrons-inde-chien-difference-danger')
  const withFood = buildMonthlyNewsletter(date, { articles, topFood: { slug: 'marque-produit', brand: 'Marque', product: 'Produit', score: 82 }, unsubscribeUrl: 'https://x.test/u' })
  assert.ok(withFood.html.includes('meilleure note du mois'))
  assert.ok(withFood.html.includes(`${SITE}/croquettes/marque-produit`))
  assert.ok(withFood.html.includes('82/100'))
  assert.ok(withFood.html.includes('href="https://x.test/u"'))
  assert.ok(!withFood.html.includes(BREVO_UNSUBSCRIBE_TAG))
  // Aucune autre accolade double que la balise Brevo (le langage de modèles de Brevo les interprète).
  assert.equal((mail.html.match(/\{\{/g) ?? []).length, 1)
})

test("choix des guides : 30 derniers jours, pas d'article futur", () => {
  const date = new Date('2026-11-03T17:00:00Z')
  const { featured, guides } = pickGuides(articles, date)
  const t = (a: Article) => new Date(a.frontmatter.date).getTime()
  assert.ok(t(featured) <= date.getTime())
  assert.ok(guides.every((g) => t(g) <= date.getTime()))
  assert.ok(guides.every((g) => t(g) <= t(featured)))
})

test('suite de bienvenue : étape due, délai de grâce, jamais de retour en arrière', () => {
  const none = new Set<WelcomeStep>()
  assert.equal(dueStep(0, none), null)
  assert.equal(dueStep(1, none), null)
  assert.equal(dueStep(2, none), 'j2')
  assert.equal(dueStep(5, none), 'j2') // J7 pas encore atteint, J2 encore dans son délai de grâce
  assert.equal(dueStep(6, none), null)
  assert.equal(dueStep(7, none), 'j5')
  assert.equal(dueStep(5, new Set<WelcomeStep>(['j2'])), null)
  assert.equal(dueStep(7, new Set<WelcomeStep>(['j2'])), 'j5')
  assert.equal(dueStep(10, new Set<WelcomeStep>(['j2', 'j5'])), 'j10')
  assert.equal(dueStep(13, none), 'j10')
  assert.equal(dueStep(14, none), null)
  assert.equal(dueStep(6, new Set<WelcomeStep>(['j5'])), null)
  // Ligne j5 écrite avant le passage à J7 (envoyée au jour 5) : jamais de second envoi.
  assert.equal(dueStep(7, new Set<WelcomeStep>(['j2', 'j5'])), null)
  assert.equal(dueStep(9, new Set<WelcomeStep>(['j5'])), null)
  assert.equal(dueStep(10, new Set<WelcomeStep>(['j10'])), null)
})

test('suite de bienvenue : jours civils à Paris, date de départ, empreinte', () => {
  assert.equal(daysSince('2026-11-01T23:30:00Z', '2026-11-03'), 1) // 00 h 30 le 2 à Paris
  assert.equal(daysSince('2026-11-01T10:00:00Z', '2026-11-03'), 2)
  assert.ok(afterStart('2026-11-10T08:00:00Z', '2026-11-10'))
  assert.ok(!afterStart('2026-11-09T22:00:00Z', '2026-11-11'))
  assert.equal(sequenceStart(''), null)
  assert.equal(sequenceStart(undefined), null)
  assert.equal(sequenceStart('10/11/2026'), null)
  assert.equal(sequenceStart('2026-11-10'), '2026-11-10')
  assert.equal(emailHash(' Marie@Example.com ', SECRET), emailHash('marie@example.com', SECRET))
  assert.ok(!emailHash('marie@example.com', SECRET).includes('marie'))
})

test('suite de bienvenue : désinscription, remise exacte à J7 (code j5), pas de « undefined »', () => {
  const unsub = buildUnsubscribeUrl('marie@example.com', SECRET)
  const date = new Date('2026-11-20T12:00:00Z')
  for (const step of WELCOME_STEPS) {
    const mail = welcomeStepEmail(step, unsub, date)
    assert.ok(mail.html.includes('Se désinscrire'), step)
    assert.ok(mail.text.includes(unsub), step)
    assert.ok(!/undefined|null/.test(mail.html + mail.text), step)
  }
  const slug = offerSlugFor(date)
  const j5 = welcomeStepEmail('j5', unsub, date)
  const discount = CONFIRMED_DISCOUNTS[slug] ?? ''
  assert.ok(discount && j5.text.includes(discount))
  assert.ok(j5.html.includes('rel="sponsored nofollow"'))
  assert.ok(j5.text.includes(`/codes-promo/${slug}`))
})

test('suite de bienvenue : le J7 ne répète pas l\'offre de la lettre du mois', () => {
  for (let m = 0; m < 12; m++) {
    const date = new Date(Date.UTC(2026, m, 28))
    assert.notEqual(offerSlugFor(date), offerForMonth(date))
  }
})

// Calendrier par adresse : inscription le 1er novembre, jour N = 2026-11-(1+N).
const START = '2026-11-01'
const SIGNUP = '2026-11-01T09:30:00+01:00'
const onDay = (n: number) => `2026-11-${String(1 + n).padStart(2, '0')}`
const contact = { createdAt: SIGNUP, blacklisted: false }
const facts = (over: Partial<AddressFacts>): AddressFacts => ({ contact: null, account: null, sent: new Set<SequenceStep>(), optedOut: false, ...over })
const on = (day: number, f: AddressFacts, reminders = true) => stepForAddress(f, { today: onDay(day), start: START, reminders })

test('calendrier sans compte : J2, J4 créer un compte, J7, J10', () => {
  const sent = (...s: SequenceStep[]) => new Set<SequenceStep>(s)
  assert.equal(on(1, facts({ contact })), null)
  assert.equal(on(2, facts({ contact })), 'j2')
  assert.equal(on(3, facts({ contact, sent: sent('j2') })), null)
  assert.equal(on(4, facts({ contact, sent: sent('j2') })), 'compte-j4')
  assert.equal(on(7, facts({ contact, sent: sent('j2', 'compte-j4') })), 'j5')
  assert.equal(on(10, facts({ contact, sent: sent('j2', 'compte-j4', 'j5') })), 'j10')
})

test('rappels coupés sans la variable : J4 absent, le J7 part quand même', () => {
  assert.equal(on(4, facts({ contact, sent: new Set<SequenceStep>(['j2']) }), false), null)
  assert.equal(on(7, facts({ contact, sent: new Set<SequenceStep>(['j2']) }), false), 'j5')
  const account = { createdAt: SIGNUP, verified: true, hasDog: false }
  assert.equal(on(1, facts({ account }), false), null)
  assert.equal(on(4, facts({ account }), false), null)
})

test('relance sautée : J4 si compte, chien dès qu\'il est ajouté, suite gardée pour un inscrit à la liste', () => {
  const j2 = new Set<SequenceStep>(['j2'])
  const pending = { createdAt: SIGNUP, verified: false, hasDog: false }
  assert.equal(on(4, facts({ contact, sent: j2, account: pending })), null)
  assert.equal(on(7, facts({ contact, sent: j2, account: pending })), 'j5')
  const withDog = { createdAt: SIGNUP, verified: true, hasDog: true }
  // Inscrit à la liste puis compte ouvert : il garde la suite, sans l'invitation à créer un compte.
  assert.equal(on(2, facts({ contact, account: withDog })), 'j2')
  assert.equal(on(4, facts({ contact, sent: j2, account: withDog })), null)
  assert.equal(on(7, facts({ contact, sent: j2, account: withDog })), 'j5')
  assert.equal(on(10, facts({ contact, sent: new Set<SequenceStep>(['j2', 'j5']), account: withDog })), 'j10')
  // Compte sans inscription à la liste : aucune étape de la suite.
  for (const day of [2, 7, 10]) assert.equal(on(day, facts({ account: withDog })), null, `jour ${day}`)
})

test('compte sans chien : J1 et J4, adresse confirmée, puis plus rien', () => {
  const account = { createdAt: SIGNUP, verified: true, hasDog: false }
  assert.equal(on(0, facts({ account })), null)
  assert.equal(on(1, facts({ account })), 'chien-j1')
  assert.equal(on(2, facts({ account, sent: new Set<SequenceStep>(['chien-j1']) })), null)
  assert.equal(on(4, facts({ account, sent: new Set<SequenceStep>(['chien-j1']) })), 'chien-j4')
  for (const day of [5, 8, 30]) assert.equal(on(day, facts({ account, sent: new Set<SequenceStep>(['chien-j1', 'chien-j4']) })), null)
  assert.equal(on(8, facts({ account })), null)
  assert.equal(on(1, facts({ account: { ...account, verified: false } })), null)
  assert.equal(on(1, facts({ account: { ...account, createdAt: '2026-10-20T10:00:00Z' } })), null)
})

test('désinscrit exclu : notre lien, liste Brevo, même pour un compte hors liste', () => {
  const account = { createdAt: SIGNUP, verified: true, hasDog: false }
  assert.equal(on(2, facts({ contact, optedOut: true })), null)
  assert.equal(on(1, facts({ account, optedOut: true })), null)
  assert.equal(on(2, facts({ contact: { ...contact, blacklisted: true } })), null)
  assert.equal(on(1, facts({ contact: { ...contact, blacklisted: true }, account })), null)
})

test("plafond d'un e-mail par jour : adresse déjà servie reportée, les autres partent", () => {
  const plan = [{ hash: 'a', step: 'j2' }, { hash: 'b', step: 'chien-j1' }]
  const { kept, postponed } = capOnePerDay(plan, new Set(['a']))
  assert.deepEqual(kept.map((p) => p.hash), ['b'])
  assert.equal(postponed, 1)
  assert.equal(capOnePerDay(plan, new Set()).kept.length, 2)
})

test('rappels de compte : désinscription, version texte, aucun lien partenaire', () => {
  const unsub = buildUnsubscribeUrl('marie@example.com', SECRET)
  for (const step of REMINDER_STEPS) {
    const mail = reminderEmail(step, unsub)
    assert.ok(mail.html.includes('Se désinscrire'), step)
    assert.ok(mail.text.includes(unsub), step)
    assert.ok(!/undefined|null/.test(mail.html + mail.text), step)
    assert.ok(!mail.html.includes('rel="sponsored'), step)
  }
  assert.ok(reminderEmail('compte-j4', unsub).html.includes('source=email-j4'))
  assert.ok(reminderEmail('chien-j1', unsub).html.includes(`${SITE}/compte/chien/nouveau`))
})

test('suivi : historique du guide résolu, journal prioritaire, empreinte inconnue, recherche', () => {
  const hash = (email: string) => emailHash(email, SECRET)
  const at = new Date('2026-11-03T10:00:00Z')
  const base = {
    subscribers: [{ email: 'Marie@Example.com', createdAt: '2026-11-03T09:00:00Z', source: 'guide', status: 'actif' as const, welcomeSent: true }],
    accounts: [{ email: 'paul@example.com', createdAt: at, verified: true, dogs: 0 }],
    internal: [],
    welcomeSends: [{ email_hash: hash('marie@example.com'), step: 'j5', sent_at: at }],
    optOuts: new Set([hash('parti@example.com')]),
    hash,
    listComplete: true,
  }
  const rows = buildTrackingRows({
    ...base,
    logs: [{ email_hash: hash('paul@example.com'), kind: 'confirmation', subject: 'Confirme', state: 'failed', sent_at: at }],
    guideSends: [
      { email_hash: hash('marie@example.com'), sent_at: at },
      { email_hash: hash('parti@example.com'), sent_at: at },
    ],
  })
  assert.equal(rows.length, 3)
  const marie = rows.find((r) => r.email === 'marie@example.com')
  assert.deepEqual(marie?.sends.map((s) => s.label).sort(), ['Bienvenue', 'Guide PDF', "Suite, jour 7 : l'offre du moment"])
  const unknown = rows.find((r) => r.email === null)
  assert.equal(unknown?.optedOut, true)
  assert.equal(unknown?.sends.length, 1)
  assert.ok(UNKNOWN_ADDRESS.includes('inconnue'))
  assert.equal(rows.find((r) => r.email === 'paul@example.com')?.sends[0].state, 'failed')
  assert.deepEqual(filterTracking(rows, 'PAUL').map((r) => r.email), ['paul@example.com'])
  // Pas de doublon : la ligne du journal remplace celle de guide_sends.
  const deduped = buildTrackingRows({
    ...base,
    logs: [{ email_hash: hash('marie@example.com'), kind: 'guide', subject: 'Ton guide', state: 'sent', sent_at: at }],
    guideSends: [{ email_hash: hash('marie@example.com'), sent_at: at }],
  })
  assert.equal(deduped.find((r) => r.email === 'marie@example.com')?.sends.filter((s) => s.label === 'Guide PDF').length, 1)
  // Liste Brevo illisible : une empreinte sans adresse ne doit pas passer pour supprimée.
  const partial = buildTrackingRows({ ...base, listComplete: false, logs: [], guideSends: [{ email_hash: hash('inconnu@example.com'), sent_at: at }] })
  assert.ok(partial.every((r) => r.email !== null))
})

async function journalTests(): Promise<void> {
  process.env.MAIL_LOG_ONLY = '1'
  const mail = { to: 'lecteur@example.invalid', subject: 'Objet', text: 't', html: '<p>h</p>', kind: 'guide' as const, tags: ['guide'] }
  const realError = console.error
  const realInfo = console.info
  const errors: string[] = []
  console.info = () => undefined
  console.error = (...args: unknown[]) => errors.push(args.map(String).join(' '))
  const store = globalThis as unknown as { tgPool?: unknown }
  const previous = store.tgPool
  const withPool = async (pool: unknown): Promise<number> => {
    store.tgPool = pool
    const started = Date.now()
    await sendTransactionalEmail(mail)
    return Date.now() - started
  }
  try {
    const missing = Object.assign(new Error('relation absente'), { code: '42P01' })
    await withPool({ query: () => Promise.reject(missing) })
    await flushEmailLog(200)
    assert.ok(errors.some((e) => e.includes('42P01')), 'erreur journalisée')
    assert.ok(!errors.join(' ').includes('lecteur@'), 'journal sans adresse')
    // Base qui ne répond plus : l'envoi rend la main tout de suite, l'attente reste bornée.
    assert.ok((await withPool({ query: () => new Promise(() => undefined) })) < 100, 'pas de retard')
    const flushStart = Date.now()
    await flushEmailLog(50)
    assert.ok(Date.now() - flushStart < 500, 'attente bornée')
    await withPool({ query: () => { throw new Error('pool cassé') } })
    await withPool(null)
    // Écriture réussie : empreinte seule, jamais l'adresse.
    const seen: unknown[][] = []
    await withPool({ query: (_sql: string, params: unknown[]) => { seen.push(params); return Promise.resolve({ rowCount: 1 }) } })
    assert.ok(!JSON.stringify(seen).includes('lecteur@'))
    assert.equal(seen[0][1], 'guide')
    assert.equal(seen[0][3], 'simulated')
  } finally {
    store.tgPool = previous
    console.error = realError
    console.info = realInfo
  }
  passed++
  console.log('ok - journal qui échoue : envoi ni bloqué ni retardé, erreur sans adresse')
}

journalTests().then(() => console.log(`${passed} tests passés`)).catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
