// Tests de la connexion du tableau de bord.
// Lancer : npx tsx scripts/test-dashboard-login.ts
// Avec TEST_DATABASE_URL (base jetable, jamais la production) : sessions, limites, codes, facteurs.
import assert from 'node:assert/strict'
import { TOTP } from 'otpauth'
import { newBackupCodes, normalizeBackupCode } from '../lib/dashboard/login/backup-codes'
import {
  ABSOLUTE_MS, attemptBlocked, deviceLabel, ENROLL_PATH, factorIsRecent, failuresDeserveAlert, IDLE_MS, LOGIN_PATH, MAX_GLOBAL_FACTOR_FAILURES, MAX_GLOBAL_PASSWORD_FAILURES,
  MAX_IP_FAILURES, MAX_SESSION_FACTOR_FAILURES, RECENT_FACTOR_MS, routeCountsAsActivity, routeKind, safeNext, sessionIsLive, stageHref, VERIFY_PATH,
} from '../lib/dashboard/login/policy'

process.env.DASHBOARD_USER = 'proprietaire'
process.env.DASHBOARD_PASSWORD = 'mot-de-passe-de-test'
process.env.DASHBOARD_AUTH_SECRET = 'secret-de-test-assez-long-pour-etre-accepte-0123456789'
process.env.DASHBOARD_LOGIN_ENABLED = '1'
delete process.env.NTFY_TOPIC
if (process.env.TEST_DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
else delete process.env.DATABASE_URL

let passed = 0
async function test(name: string, fn: () => void | Promise<void>) {
  await fn()
  passed++
  console.log(`ok - ${name}`)
}

const NOW = new Date('2026-11-04T12:00:00Z')
const after = (ms: number) => new Date(NOW.getTime() + ms)

async function pureTests() {
  const session = { stage: 'full' as const, passwordFp: 'fp', lastSeenAt: NOW, expiresAt: after(ABSOLUTE_MS) }

  await test('session : vivante, puis morte à 2 h sans activité', () => {
    assert.equal(sessionIsLive(session, 'fp', after(IDLE_MS - 1)), true)
    assert.equal(sessionIsLive(session, 'fp', after(IDLE_MS)), false)
  })
  await test('session : morte à 12 h même avec une activité récente', () => {
    const active = { ...session, lastSeenAt: after(ABSOLUTE_MS - 1) }
    assert.equal(sessionIsLive(active, 'fp', after(ABSOLUTE_MS - 1)), true)
    assert.equal(sessionIsLive({ ...active, lastSeenAt: after(ABSOLUTE_MS) }, 'fp', after(ABSOLUTE_MS)), false)
  })
  await test('session : morte dès que le mot de passe change', () => {
    assert.equal(sessionIsLive(session, 'autre', NOW), false)
  })
  await test('limite : par adresse, y compris pour un appareil connu', () => {
    assert.equal(attemptBlocked('password', { ip: MAX_IP_FAILURES - 1, global: 0 }, false), false)
    assert.equal(attemptBlocked('password', { ip: MAX_IP_FAILURES, global: 0 }, false), true)
    assert.equal(attemptBlocked('password', { ip: MAX_IP_FAILURES, global: 0 }, true), true)
  })
  await test('limite globale : bloque l’inconnu, pas l’appareil connu', () => {
    assert.equal(attemptBlocked('password', { ip: 0, global: MAX_GLOBAL_PASSWORD_FAILURES }, false), true)
    assert.equal(attemptBlocked('password', { ip: 0, global: MAX_GLOBAL_PASSWORD_FAILURES }, true), false)
    assert.equal(attemptBlocked('totp', { ip: 0, global: MAX_GLOBAL_FACTOR_FAILURES }, false), true)
    assert.equal(attemptBlocked('password', { ip: 0, global: MAX_GLOBAL_FACTOR_FAILURES }, false), false)
  })
  await test('alerte : au 5e échec, puis tous les 20', () => {
    assert.deepEqual([1, 4, 5, 6, 24, 25, 45].map(failuresDeserveAlert), [false, false, true, false, false, true, true])
  })
  await test('retour après connexion : jamais hors du tableau de bord', () => {
    assert.equal(safeNext('/tableau-de-bord/emails?x=1'), '/tableau-de-bord/emails?x=1')
    for (const bad of ['https://evil.test', '//evil.test', '/tableau-de-bord//evil.test', '/tableau-de-bordure', '/\\evil', '/compte', null, 5, LOGIN_PATH, `${LOGIN_PATH}/verification`, '/tableau-de-bord\r\nX: y']) {
      assert.equal(safeNext(bad), '/tableau-de-bord', String(bad))
    }
  })
  await test('étapes : mot de passe seul n’ouvre que l’écran suivant', () => {
    assert.equal(stageHref('second_factor', '/tableau-de-bord/emails'), VERIFY_PATH)
    assert.equal(stageHref('enroll', '/tableau-de-bord/emails'), ENROLL_PATH)
    assert.equal(stageHref('full', '/tableau-de-bord/emails'), '/tableau-de-bord/emails')
  })
  await test('routes : connexion publique, données en 401, pages en renvoi', () => {
    assert.equal(routeKind(LOGIN_PATH, 'GET'), 'public')
    assert.equal(routeKind(`${LOGIN_PATH}/api/code`, 'POST'), 'public')
    assert.equal(routeKind('/tableau-de-bord/connexionx', 'GET'), 'page')
    assert.equal(routeKind('/tableau-de-bord/direct', 'GET'), 'data')
    assert.equal(routeKind('/tableau-de-bord/direct/', 'GET'), 'data')
    assert.equal(routeKind('/tableau-de-bord/conversions/inscrits/export', 'GET'), 'data')
    assert.equal(routeKind('/tableau-de-bord/emails', 'POST'), 'data')
    assert.equal(routeKind('/tableau-de-bord/emails', 'GET'), 'page')
    assert.equal(routeCountsAsActivity('/tableau-de-bord/direct'), false)
  })
  await test('vérification récente : 15 minutes', () => {
    assert.equal(factorIsRecent(NOW, after(RECENT_FACTOR_MS - 1)), true)
    assert.equal(factorIsRecent(NOW, after(RECENT_FACTOR_MS)), false)
    assert.equal(factorIsRecent(null, NOW), false)
  })
  await test('appareil : réduit à système et navigateur', () => {
    assert.equal(deviceLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'), 'iPhone · Safari')
    assert.equal(deviceLabel('Mozilla/5.0 (Windows NT 10.0) Chrome/130 Safari/537'), 'Windows · Chrome')
    assert.equal(deviceLabel(null), 'Appareil inconnu')
  })
  await test('codes de secours : 10 différents, saisie tolérante', () => {
    const codes = newBackupCodes()
    assert.equal(new Set(codes).size, 10)
    for (const code of codes) {
      assert.match(code, /^[2-9A-HJKMNP-Z]{5}-[2-9A-HJKMNP-Z]{5}$/)
      assert.equal(normalizeBackupCode(code.toLowerCase().replace('-', ' ')), code)
    }
    assert.equal(normalizeBackupCode('trop-court'), null)
    assert.equal(normalizeBackupCode('O0I1L-O0I1L'), null)
  })
}

async function configTests() {
  const { relyingParty } = await import('../lib/server/dashboard-login/webauthn')
  const { decryptSecret, encryptSecret, ipHash, tokenHash } = await import('../lib/server/dashboard-login/secrets')
  const { dashboardAuthMode } = await import('../lib/server/dashboard-login/mode')

  await test('clé d’accès : RP ID de production figé, localhost seulement pour les essais', () => {
    assert.deepEqual(relyingParty({}), { rpID: 'dashboard.toutou-gourmet.com', origin: 'https://dashboard.toutou-gourmet.com' })
    assert.equal(relyingParty({ DASHBOARD_WEBAUTHN_RP_ID: 'evil.test' }).rpID, 'dashboard.toutou-gourmet.com')
    assert.equal(relyingParty({ DASHBOARD_WEBAUTHN_RP_ID: 'localhost', DASHBOARD_WEBAUTHN_ORIGIN: 'https://evil.test' }).origin, 'http://localhost:3070')
  })
  await test('secrets : chiffrement réversible, altération refusée, empreintes stables', () => {
    const sealed = encryptSecret('JBSWY3DPEHPK3PXP')
    assert.equal(decryptSecret(sealed), 'JBSWY3DPEHPK3PXP')
    assert.ok(!sealed.includes('JBSWY3DPEHPK3PXP'))
    assert.equal(decryptSecret(`${sealed.slice(0, -2)}AA`), null)
    assert.equal(ipHash('203.0.113.9'), ipHash('203.0.113.9'))
    assert.ok(!ipHash('203.0.113.9').includes('203'))
    assert.notEqual(tokenHash('a'), tokenHash('b'))
  })
  await test('bascule : secret trop court ou variable absente, Basic reste en place', async () => {
    const secret = process.env.DASHBOARD_AUTH_SECRET
    process.env.DASHBOARD_AUTH_SECRET = 'court'
    assert.equal(await dashboardAuthMode(), 'basic')
    process.env.DASHBOARD_AUTH_SECRET = secret
    delete process.env.DASHBOARD_LOGIN_ENABLED
    assert.equal(await dashboardAuthMode(), 'basic')
    process.env.DASHBOARD_LOGIN_ENABLED = '1'
  })
}

/** Parcours complets sur base jetable, sans HTTP : les routes ne font que lire la requête et appeler ces fonctions. */
async function databaseTests() {
  const { getPool } = await import('../lib/server/db')
  const pool = getPool()
  assert.ok(pool)
  const { dashboardAuthMode } = await import('../lib/server/dashboard-login/mode')
  const { passwordStep, backupStep, totpStep } = await import('../lib/server/dashboard-login/flow-login')
  const { enrollTotpConfirm, enrollTotpStart, deleteTotp } = await import('../lib/server/dashboard-login/flow-factors')
  const { logout, logoutEverywhere } = await import('../lib/server/dashboard-login/flow-sessions')
  const { readSession, takeChallenge, saveChallenge } = await import('../lib/server/dashboard-login/sessions')
  const { ipHash } = await import('../lib/server/dashboard-login/secrets')

  const wipe = async () => {
    for (const t of ['session', 'passkey', 'totp', 'backup_code', 'device', 'login_event']) await pool.query(`DELETE FROM app.dashboard_${t}`)
  }
  const who = (ip = '203.0.113.1') => ({ ipHash: ipHash(ip), label: 'iPhone · Safari' })
  const ctx = async (token: string | undefined, input: Record<string, unknown> = {}, ip?: string) => ({ who: who(ip), session: await readSession(token), deviceToken: undefined, input })
  const good = { username: 'proprietaire', password: 'mot-de-passe-de-test' }
  const nowCode = (secret: string, at = Date.now()) => new TOTP({ secret, algorithm: 'SHA1', digits: 6, period: 30 }).generate({ timestamp: at })

  await wipe()
  await test('mode : tables présentes et variables posées, nouvelle connexion', async () => {
    assert.equal(await dashboardAuthMode(), 'login')
  })

  let codes: string[] = []
  let secret = ''
  let fullToken = ''
  await test('mot de passe faux : refus neutre, identifiant faux : même réponse', async () => {
    const a = await passwordStep(await ctx(undefined, { username: 'proprietaire', password: 'non' }, '203.0.113.50'))
    const b = await passwordStep(await ctx(undefined, { username: 'non', password: good.password }, '203.0.113.51'))
    assert.equal(a.status, 401)
    assert.deepEqual(a.body, b.body)
    assert.equal(a.setSession, undefined)
  })
  await test('mot de passe seul, aucun facteur : session limitée à l’enrôlement', async () => {
    const res = await passwordStep(await ctx(undefined, good))
    assert.equal(res.body.next, ENROLL_PATH)
    const session = await readSession(res.setSession)
    assert.equal(session?.stage, 'enroll')
    const start = await enrollTotpStart(await ctx(res.setSession))
    secret = String(start.body.secret)
    assert.equal((await enrollTotpConfirm(await ctx(res.setSession, { code: '000000' }))).status, 401)
    const done = await enrollTotpConfirm(await ctx(res.setSession, { code: nowCode(secret) }))
    assert.equal(done.status, 200)
    codes = done.body.codes as string[]
    assert.equal(codes.length, 10)
    fullToken = String(done.setSession)
    assert.notEqual(fullToken, res.setSession)
    assert.equal(await readSession(res.setSession), null, 'l’ancien cookie ne vaut plus rien')
    assert.equal((await readSession(fullToken))?.stage, 'full')
    const stored = await pool.query('SELECT code_hash FROM app.dashboard_backup_code')
    assert.equal(stored.rowCount, 10)
    assert.ok(!stored.rows.some((r: { code_hash: string }) => codes.includes(r.code_hash)), 'codes hachés')
    const totp = await pool.query<{ secret_enc: string }>('SELECT secret_enc FROM app.dashboard_totp')
    assert.ok(!totp.rows[0].secret_enc.includes(secret), 'secret chiffré')
  })
  await test('facteur enrôlé : une session d’enrôlement restée ouverte ne peut plus rien', async () => {
    await pool.query(`INSERT INTO app.dashboard_session (token_hash, stage, password_fp, expires_at) SELECT 'x', 'enroll', password_fp, now() + interval '5 minutes' FROM app.dashboard_session LIMIT 1`)
    const session = (await pool.query<{ id: string }>(`SELECT id FROM app.dashboard_session WHERE token_hash = 'x'`)).rows[0]
    const stale = { stage: 'enroll' as const, id: session.id, passwordFp: '', createdAt: NOW, lastSeenAt: NOW, expiresAt: NOW, factorAt: null, factorFailures: 0, deviceLabel: '' }
    const res = await enrollTotpStart({ who: who(), session: stale, deviceToken: undefined, input: {} })
    assert.equal(res.status, 401)
    assert.equal(res.clearSession, true)
    assert.equal((await pool.query(`SELECT 1 FROM app.dashboard_session WHERE token_hash = 'x'`)).rowCount, 0)
  })
  await test('TOTP : second facteur exigé, code rejoué refusé', async () => {
    await pool.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome = 'failure'`)
    const pending = await passwordStep(await ctx(undefined, good))
    assert.equal(pending.body.next, VERIFY_PATH)
    assert.equal((await readSession(pending.setSession))?.stage, 'second_factor')
    const code = nowCode(secret, Date.now() + 30_000)
    assert.equal((await totpStep(await ctx(pending.setSession, { code }))).status, 200)
    const again = await passwordStep(await ctx(undefined, good))
    assert.equal((await totpStep(await ctx(again.setSession, { code }))).status, 401)
  })
  await test('code de secours : une seule fois', async () => {
    await pool.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome = 'failure'`)
    const first = await passwordStep(await ctx(undefined, good))
    const used = await backupStep(await ctx(first.setSession, { code: codes[0].toLowerCase() }))
    assert.equal(used.status, 200)
    assert.equal((await readSession(used.setSession))?.stage, 'full')
    const second = await passwordStep(await ctx(undefined, good))
    assert.equal((await backupStep(await ctx(second.setSession, { code: codes[0] }))).status, 401)
    const left = await pool.query('SELECT 1 FROM app.dashboard_backup_code WHERE used_at IS NULL')
    assert.equal(left.rowCount, 9)
  })
  await test('5 échecs de second facteur sur une session : session supprimée', async () => {
    await pool.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome = 'failure'`)
    const pending = await passwordStep(await ctx(undefined, good))
    let last = await totpStep(await ctx(pending.setSession, { code: '000000' }, '198.51.100.1'))
    for (let i = 1; i < MAX_SESSION_FACTOR_FAILURES; i++) last = await totpStep(await ctx(pending.setSession, { code: '000000' }, `198.51.100.${i + 1}`))
    assert.equal(last.clearSession, true)
    assert.equal(await readSession(pending.setSession), null)
  })
  await test('blocage : 5 échecs par adresse, les requêtes simultanées comptent toutes', async () => {
    await pool.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome = 'failure'`)
    const wrong = { username: 'x', password: 'y' }
    const results = await Promise.all(Array.from({ length: 12 }, async () => passwordStep(await ctx(undefined, wrong, '192.0.2.77'))))
    assert.equal(results.filter((r) => r.status === 401).length, MAX_IP_FAILURES)
    assert.equal(results.filter((r) => r.status === 429).length, 12 - MAX_IP_FAILURES)
    assert.equal((await passwordStep(await ctx(undefined, good, '192.0.2.77'))).status, 429, 'même le bon mot de passe attend')
    assert.equal((await passwordStep(await ctx(undefined, good, '192.0.2.78'))).status, 200, 'une autre adresse passe')
    const blocked = await pool.query(`SELECT 1 FROM app.dashboard_login_event WHERE outcome = 'blocked'`)
    assert.equal(blocked.rowCount, 1, 'une ligne de blocage par minute au plus')
  })
  await test('expirations et rotation du mot de passe', async () => {
    const active = await readSession(fullToken)
    assert.ok(active)
    assert.equal(await readSession(fullToken, false, new Date(Date.now() + IDLE_MS + 1000)), null, 'inactivité')
    assert.equal((await pool.query('SELECT 1 FROM app.dashboard_session WHERE id = $1', [active.id])).rowCount, 0, 'ligne expirée supprimée')
    await pool.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome = 'failure'`)
    const again = await passwordStep(await ctx(undefined, good))
    process.env.DASHBOARD_PASSWORD = 'nouveau-mot-de-passe'
    assert.equal(await readSession(again.setSession), null, 'rotation')
    process.env.DASHBOARD_PASSWORD = good.password
  })
  await test('déconnexion, déconnexion partout, cookie falsifié', async () => {
    await pool.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome = 'failure'`)
    assert.equal(await readSession('falsifie'), null)
    assert.equal(await readSession('x'.repeat(4096)), null)
    const open = async () => {
      const pending = await passwordStep(await ctx(undefined, good))
      const done = await backupStep(await ctx(pending.setSession, { code: codes.pop() }))
      return String(done.setSession)
    }
    const a = await open()
    const b = await open()
    const out = await logout(await ctx(a))
    assert.equal(out.clearSession, true)
    assert.equal(await readSession(a), null)
    assert.ok(await readSession(b))
    const c = await open()
    await logoutEverywhere(await ctx(c))
    assert.equal(await readSession(b), null)
    assert.equal(await readSession(c), null)
  })
  await test('dernier facteur : impossible à retirer', async () => {
    await pool.query(`UPDATE app.dashboard_login_event SET outcome = 'cleared' WHERE outcome = 'failure'`)
    const pending = await passwordStep(await ctx(undefined, good))
    const done = await backupStep(await ctx(pending.setSession, { code: codes.pop() }))
    assert.equal((await deleteTotp(await ctx(String(done.setSession)))).status, 409)
  })
  await test('défi WebAuthn : une seule fois, 5 minutes au plus', async () => {
    const pending = await passwordStep(await ctx(undefined, good))
    const session = await readSession(pending.setSession)
    assert.ok(session)
    await saveChallenge(session.id, 'defi')
    assert.equal(await takeChallenge(session.id), 'defi')
    assert.equal(await takeChallenge(session.id), null)
    await saveChallenge(session.id, 'defi', new Date(Date.now() - 6 * 60_000))
    assert.equal(await takeChallenge(session.id), null)
  })
  await wipe()
  await pool.end()
}

async function main() {
  await pureTests()
  await configTests()
  if (process.env.TEST_DATABASE_URL) await databaseTests()
  else console.log('# sans TEST_DATABASE_URL : parcours sur base sautés')
  console.log(`${passed} tests réussis`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
