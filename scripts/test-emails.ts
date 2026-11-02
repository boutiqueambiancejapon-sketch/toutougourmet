// Tests des gabarits d'e-mails de la lettre. Lancer : npx tsx scripts/test-emails.ts
import assert from 'node:assert/strict'
import { getAllArticles, type Article } from '../lib/mdx'
import { BREVO_UNSUBSCRIBE_TAG, OFFER_ROTATION, buildMonthlyNewsletter, offerForMonth, pickGuides } from '../lib/emails/monthly'
import { SEASONAL_TIPS } from '../lib/emails/seasonal'
import { isFirstTuesday, nextFirstTuesday, sendInstant } from '../lib/emails/schedule'
import { buildUnsubscribeUrl, unsubscribeToken, verifyUnsubscribeToken } from '../lib/emails/unsubscribe'
import { WELCOME_SUBJECT, welcomeEmail } from '../lib/emails/welcome'
import { getBrandBySlug } from '../data/brands'

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

console.log(`${passed} tests passés`)
