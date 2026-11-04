// Parcours complet de la connexion du tableau de bord, navigateur et authentificateur virtuel.
// Base jetable et serveur local seulement : jamais la production.
//   BASE=http://localhost:3070 DATABASE_URL=… PW=/home/administrator/tools/pw/node_modules/playwright/index.mjs \
//   node scripts/e2e-dashboard-login.mjs
// Le serveur tourne avec DASHBOARD_USER=e2e-owner, DASHBOARD_PASSWORD=e2e-password,
// DASHBOARD_LOGIN_ENABLED=1, DASHBOARD_WEBAUTHN_RP_ID=localhost, NTFY_SERVER=http://127.0.0.1:3071, NTFY_TOPIC=e2e.
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import assert from 'node:assert/strict'
import { TOTP } from 'otpauth'
import pg from 'pg'

const BASE = process.env.BASE ?? 'http://localhost:3070'
const SHOTS = process.env.SHOTS ?? '/var/www/toutou-maquettes/connexion'
const { chromium } = await import(process.env.PW ?? '/home/administrator/tools/pw/node_modules/playwright/index.mjs')
const good = { username: 'e2e-owner', password: 'e2e-password' }
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL })
mkdirSync(SHOTS, { recursive: true })

const alerts = []
const stub = createServer((req, res) => {
  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    alerts.push(JSON.parse(body))
    res.end('{}')
  })
}).listen(3071, '127.0.0.1')

let passed = 0
const check = async (name, fn) => {
  await fn()
  passed++
  console.log(`ok - ${name}`)
}

const PAGES = ['', '/trafic', '/trafic/direct', '/trafic/acquisition', '/trafic/pages', '/visiteurs', '/conversions', '/robots', '/contenu', '/emails', '/serveur', '/scanner', '/securite', '/emails/lettre', '/emails/hebdo', '/emails/bienvenue', '/emails/suite/j2', '/emails/relances/compte-j4', '/conversions/inscrits', '/conversions/comptes/inconnu', '/fiches/1'].map((p) => `/tableau-de-bord${p}`)
const DATA = ['/tableau-de-bord/direct', '/tableau-de-bord/conversions/inscrits/export', '/tableau-de-bord/conversions/inscrits/export?liste=comptes', '/tableau-de-bord/conversions/inscrits/export?liste=envois']

const raw = (path, cookie, init = {}) => fetch(BASE + path, { redirect: 'manual', ...init, headers: { ...(cookie ? { cookie } : {}), ...init.headers } })

async function assertClosed(cookie, expectedPrefix) {
  for (const path of PAGES) {
    const res = await raw(path, cookie)
    assert.equal(res.status, 307, path)
    assert.ok(new URL(res.headers.get('location'), BASE).pathname.startsWith(expectedPrefix), `${path} -> ${res.headers.get('location')}`)
    // Next ne met dans le corps d'une redirection que l'adresse cible.
    assert.ok((await res.text()).length < 200 && expectedPrefix, path)
  }
  for (const path of DATA) {
    const res = await raw(path, cookie)
    assert.equal(res.status, 401, path)
    assert.equal(await res.text(), '', path)
  }
  const action = await raw('/tableau-de-bord/emails/bienvenue', cookie, { method: 'POST', headers: { 'next-action': 'x', origin: BASE } })
  assert.equal(action.status, 401, 'action serveur')
}

const post = (action, body, cookie, origin = BASE) => raw(`/tableau-de-bord/connexion/api/${action}`, cookie, { method: 'POST', headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) }, body: JSON.stringify(body) })
const clearFailures = () => db.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome IN ('failure', 'blocked')`)
const cookieHeader = (res) => res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ')
const reset = (...args) => execFileSync('node', ['scripts/dashboard-2fa-reset.mjs', ...args], { env: process.env, encoding: 'utf8' })

async function fits(page, label) {
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 844 })
    const { scroll, inner, broken } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      inner: window.innerWidth,
      // Une ligne : un bouton garde la hauteur de son contenu sur une seule ligne de texte.
      broken: [...document.querySelectorAll('button, a.rounded-pill')].filter((b) => b.offsetParent && b.getClientRects().length > 1).length + [...document.querySelectorAll('button')].filter((b) => b.offsetParent && getComputedStyle(b).whiteSpace !== 'nowrap' && !b.closest('[data-allow-wrap]')).map((b) => b.textContent).length,
    }))
    assert.ok(scroll <= inner, `${label} déborde à ${width} px : ${scroll}`)
    assert.equal(broken, 0, `${label} : bouton sur plusieurs lignes à ${width} px`)
  }
}

async function shot(page, name, label = name) {
  await fits(page, label)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true })
}

async function signIn(page, password = good.password) {
  await page.goto(`${BASE}/tableau-de-bord/connexion`)
  await page.getByLabel('Identifiant').fill(good.username)
  await page.getByLabel('Mot de passe').fill(password)
  await page.getByRole('button', { name: 'Continuer', exact: true }).click()
}

async function logout(page) {
  // Le rechargement de la page précédente peut encore être en cours.
  await page.goto(`${BASE}/tableau-de-bord/securite`).catch(() => page.goto(`${BASE}/tableau-de-bord/securite`))
  await page.getByRole('button', { name: 'Se déconnecter' }).click()
  await page.waitForURL('**/tableau-de-bord/connexion')
}

for (const t of ['session', 'passkey', 'totp', 'backup_code', 'device', 'login_event']) await db.query(`DELETE FROM app.dashboard_${t}`)

await check('sans cookie : toutes les pages renvoient vers la connexion, données et actions en 401', () => assertClosed(null, '/tableau-de-bord/connexion'))
await check('cookie falsifié : pareil', () => assertClosed('__Host-tg_dashboard=falsifie0123456789', '/tableau-de-bord/connexion'))
await check('API : origine absente ou étrangère refusée, action inconnue 404', async () => {
  assert.equal((await post('mot-de-passe', good, null, null)).status, 403)
  assert.equal((await post('mot-de-passe', good, null, 'https://evil.test')).status, 403)
  assert.equal((await post('rien', {}, null)).status, 404)
  assert.equal((await post('codes-renouveler', {}, null)).status, 401)
  assert.equal((await post('deconnexion-partout', {}, null)).status, 401)
})
await check('mot de passe seul, aucun facteur : enrôlement et rien d’autre', async () => {
  const res = await post('mot-de-passe', good, null)
  assert.equal(res.status, 200)
  const setCookie = res.headers.getSetCookie().join('\n')
  assert.match(setCookie, /__Host-tg_dashboard=/)
  assert.match(setCookie, /HttpOnly/i)
  assert.match(setCookie, /Secure/i)
  assert.match(setCookie, /SameSite=Strict/i)
  assert.match(setCookie, /Path=\//)
  assert.doesNotMatch(setCookie, /Domain=/i)
  await assertClosed(cookieHeader(res), '/tableau-de-bord/connexion/enrolement')
  await db.query('DELETE FROM app.dashboard_session')
})

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' })
const page = await context.newPage()
const cdp = await context.newCDPSession(page)
await cdp.send('WebAuthn.enable')
const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
  options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true },
})
const csp = []
page.on('console', (m) => {
  if (m.type() === 'error' && /Content Security Policy/i.test(m.text())) csp.push(m.text())
})

await check('écran de connexion, erreur neutre', async () => {
  await page.goto(`${BASE}/tableau-de-bord/emails`)
  await page.waitForURL('**/tableau-de-bord/connexion?suivant=*')
  await shot(page, '01-connexion')
  await signIn(page, 'mauvais')
  await page.getByText('Connexion impossible').waitFor()
  await shot(page, '02-erreur')
})

let codes = []
await check('enrôlement : mot de passe, Face ID virtuel, codes de secours, tableau de bord', async () => {
  await clearFailures()
  await signIn(page)
  await page.waitForURL('**/connexion/enrolement')
  await shot(page, '03-enrolement')
  await page.goto(`${BASE}/tableau-de-bord/serveur`)
  await page.waitForURL('**/connexion/enrolement')
  await page.getByRole('button', { name: 'Créer une clé Face ID' }).click()
  await page.getByRole('list', { name: 'Codes de secours' }).waitFor()
  codes = await page.locator('ol li').allTextContents()
  assert.equal(codes.length, 10)
  await shot(page, '04-codes-secours')
  await page.getByRole('button', { name: 'J’ai noté mes codes' }).click()
  await page.waitForURL(/\/tableau-de-bord(\?|$)/)
  await page.getByRole('heading', { level: 1, name: 'Tableau de bord' }).waitFor()
  const cookies = await context.cookies()
  const session = cookies.find((c) => c.name === '__Host-tg_dashboard')
  assert.ok(session && session.httpOnly && session.secure && session.sameSite === 'Strict' && session.path === '/')
  assert.ok(cookies.find((c) => c.name === 'tg_owner' && c.httpOnly), 'tg_owner posé à la connexion')
  assert.ok(alerts.some((a) => /nouvel appareil/.test(a.message)), 'alerte nouvel appareil')
  assert.ok(!(await db.query(`SELECT public_key FROM app.dashboard_passkey`)).rows[0].public_key.includes(' '))
  const stored = await db.query('SELECT token_hash FROM app.dashboard_session')
  assert.ok(!stored.rows.some((r) => r.token_hash === session.value), 'jeton haché en base')
})

let secret = ''
await check('écran Sécurité : ajoute une application de codes', async () => {
  await page.goto(`${BASE}/tableau-de-bord/securite`)
  await shot(page, '05-securite')
  await page.getByRole('button', { name: 'Ajouter une application' }).click()
  await page.getByText('Clé à saisir à la main').waitFor()
  await shot(page, '06-application-codes')
  secret = (await page.locator('p.break-all').textContent()).trim()
  const code = new TOTP({ secret, algorithm: 'SHA1', digits: 6, period: 30 }).generate()
  await page.getByLabel('Code affiché par l’application').fill(code)
  await page.getByRole('button', { name: 'Valider le code' }).click()
  await page.getByText('Enregistrée.').waitFor()
})

await check('déconnexion : l’ancienne session ne rouvre rien', async () => {
  const before = (await context.cookies()).find((c) => c.name === '__Host-tg_dashboard').value
  await logout(page)
  await assertClosed(`__Host-tg_dashboard=${before}`, '/tableau-de-bord/connexion')
})

await check('connexion : mot de passe seul insuffisant, puis Face ID virtuel', async () => {
  await signIn(page)
  await page.waitForURL('**/connexion/verification')
  await shot(page, '07-verification')
  const pending = (await context.cookies()).find((c) => c.name === '__Host-tg_dashboard').value
  await assertClosed(`__Host-tg_dashboard=${pending}`, '/tableau-de-bord/connexion/verification')
  await page.getByRole('button', { name: 'Continuer avec Face ID' }).click()
  await page.getByRole('heading', { level: 1, name: 'Tableau de bord' }).waitFor()
  const full = (await context.cookies()).find((c) => c.name === '__Host-tg_dashboard').value
  assert.notEqual(full, pending, 'cookie renouvelé au second facteur')
  for (const path of ['/tableau-de-bord/direct', '/tableau-de-bord/conversions/inscrits/export']) assert.notEqual((await raw(path, `__Host-tg_dashboard=${full}`)).status, 401, path)
  await logout(page)
})

await check('clé indisponible sur cet appareil : repli sur le code', async () => {
  await signIn(page)
  await page.waitForURL('**/connexion/verification')
  await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
  await page.getByRole('button', { name: 'Continuer avec Face ID' }).click({ noWaitAfter: true })
  // Sans authentificateur, le navigateur laisse la demande ouvert ou la refuse : on passe au code.
  await page.getByRole('button', { name: 'Code à 6 chiffres' }).click()
})

await check('code TOTP : refus puis succès', async () => {
  await page.getByLabel('Code à 6 chiffres').fill('000000')
  await page.getByRole('button', { name: 'Valider le code' }).click()
  await page.getByText('Connexion impossible').waitFor()
  await shot(page, '08-code')
  const code = new TOTP({ secret, algorithm: 'SHA1', digits: 6, period: 30 }).generate({ timestamp: Date.now() + 30_000 })
  await page.getByLabel('Code à 6 chiffres').fill(code)
  await page.getByRole('button', { name: 'Valider le code' }).click()
  await page.getByRole('heading', { level: 1, name: 'Tableau de bord' }).waitFor()
  await logout(page)
})

await check('code de secours : marche une fois, pas deux', async () => {
  await clearFailures()
  for (const round of [1, 2]) {
    await signIn(page)
    await page.waitForURL('**/connexion/verification')
    await page.getByRole('button', { name: 'Code de secours' }).click()
    await page.getByLabel('Code de secours').fill(codes[0])
    await page.getByRole('button', { name: 'Valider le code' }).click()
    if (round === 1) {
      await page.getByRole('heading', { level: 1, name: 'Tableau de bord' }).waitFor()
      assert.ok(alerts.some((a) => /code de secours/.test(a.message)), 'alerte code de secours')
      await logout(page)
    } else {
      await page.getByText('Connexion impossible').waitFor()
    }
  }
  await db.query('DELETE FROM app.dashboard_session')
})

const openWithBackup = async () => {
  await clearFailures()
  await signIn(page)
  await page.waitForURL('**/connexion/verification')
  await page.getByRole('button', { name: 'Code de secours' }).click()
  await page.getByLabel('Code de secours').fill(codes.pop())
  await page.getByRole('button', { name: 'Valider le code' }).click()
  await page.getByRole('heading', { level: 1, name: 'Tableau de bord' }).waitFor()
}

await check('e-mails : aperçu visible, bouton de test passe par l’action protégée', async () => {
  await openWithBackup()
  await page.goto(`${BASE}/tableau-de-bord/emails/bienvenue`)
  const button = page.getByRole('button', { name: /test/i }).first()
  await button.click()
  await page.waitForURL(/test=/)
  assert.doesNotMatch(page.url(), /erreur=non/)
})

await check('lien venu d’un autre site (ntfy, e-mail) : SameSite=Strict, la sonde rattrape', async () => {
  await page.route('http://127.0.0.1:3070/ailleurs', (route) => route.fulfill({ contentType: 'text/html', body: `<a id="l" href="${BASE}/tableau-de-bord/robots">ouvrir</a>` }))
  await page.goto('http://127.0.0.1:3070/ailleurs')
  await page.click('#l')
  await page.waitForURL('**/tableau-de-bord/robots')
  await page.getByRole('heading', { level: 1, name: 'Robots IA' }).waitFor()
})

await check('changement de facteur refusé si le second facteur date de plus de 15 minutes', async () => {
  await db.query(`UPDATE app.dashboard_session SET factor_at = now() - interval '16 minutes'`)
  await page.goto(`${BASE}/tableau-de-bord/securite`)
  await page.getByRole('button', { name: 'Renouveler les codes' }).click()
  await page.getByText('Par sécurité, reconnecte-toi').waitFor()
  await db.query(`UPDATE app.dashboard_session SET factor_at = now()`)
})

await check('session expirée : par la date, puis par l’inactivité', async () => {
  await db.query(`UPDATE app.dashboard_session SET expires_at = now() - interval '1 second'`)
  await page.goto(`${BASE}/tableau-de-bord/robots`)
  await page.waitForURL('**/tableau-de-bord/connexion?suivant=*')
  await openWithBackup()
  await db.query(`UPDATE app.dashboard_session SET last_seen_at = now() - interval '2 hours 1 minute'`)
  await page.goto(`${BASE}/tableau-de-bord/robots`)
  await page.waitForURL('**/tableau-de-bord/connexion?suivant=*')
})

await check('déconnexion partout : plus aucune session', async () => {
  await openWithBackup()
  await page.goto(`${BASE}/tableau-de-bord/securite`)
  await page.getByRole('button', { name: 'Déconnecter partout' }).click()
  await page.waitForURL('**/tableau-de-bord/connexion')
  assert.equal((await db.query('SELECT 1 FROM app.dashboard_session')).rowCount, 0)
})

await check('essais répétés : blocage, message neutre, alerte sans donnée sensible, déblocage par le serveur', async () => {
  await clearFailures()
  alerts.length = 0
  // Depuis le navigateur : même adresse que le formulaire (node passe parfois par une autre boucle locale).
  await page.goto(`${BASE}/tableau-de-bord/connexion`)
  const attempt = (body) => page.evaluate((b) => fetch('/tableau-de-bord/connexion/api/mot-de-passe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }).then((r) => r.status), body)
  for (let i = 0; i < 5; i++) assert.equal(await attempt({ username: 'x', password: `essai-${i}` }), 401)
  assert.equal(await attempt(good), 429)
  await signIn(page)
  await page.getByText('Trop d’essais').waitFor()
  await shot(page, '09-blocage')
  await new Promise((r) => setTimeout(r, 500))
  assert.ok(alerts.some((a) => /essais de connexion refusés/.test(a.message)), 'alerte série d’échecs')
  for (const alert of alerts) assert.doesNotMatch(JSON.stringify(alert), /e2e-owner|e2e-password|essai-|127\.0\.0\.1|::1/)
  assert.match(reset('--debloquer'), /Échecs effacés/)
  assert.equal(await attempt(good), 200)
})

await check('secours : la commande retire les facteurs, le mot de passe rouvre l’enrôlement', async () => {
  assert.throws(() => reset(), /--confirmer/)
  assert.match(reset('--confirmer'), /réinitialisé/)
  const res = await post('mot-de-passe', good, null)
  assert.equal(res.status, 200)
  assert.match((await res.json()).next, /enrolement/)
  await assertClosed(cookieHeader(res), '/tableau-de-bord/connexion/enrolement')
})

await check('aucune violation de la CSP', () => assert.deepEqual(csp, []))

await browser.close()
stub.close()
await db.end()
console.log(`${passed} parcours réussis`)
