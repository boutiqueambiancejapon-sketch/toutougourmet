#!/usr/bin/env node
/**
 * gsc-list-sites.mjs — Liste les propriétés Google Search Console
 * accessibles par un service account. Outil de debug.
 *
 * Zéro dépendance : utilise node:crypto pour signer le JWT RS256.
 *
 * Usage:
 *   node scripts/gsc-list-sites.mjs /chemin/vers/service-account.json
 *   GOOGLE_SERVICE_ACCOUNT_JSON_FILE=/path/to/sa.json node scripts/gsc-list-sites.mjs
 *
 * Affiche pour chaque propriété :
 *   - siteUrl (à passer dans le body de /api/search-console)
 *   - permissionLevel (siteOwner, siteFullUser, siteRestrictedUser, siteUnverifiedUser)
 *
 * ⚠️  Search Analytics API exige au minimum `siteFullUser` ou `siteOwner`.
 *     `siteRestrictedUser` ne suffit pas.
 */

import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  )
  const signingInput = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(signingInput)
  signer.end()
  const signature = base64url(signer.sign(sa.private_key))
  const jwt = `${signingInput}.${signature}`

  const resp = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!resp.ok) {
    throw new Error(`Token exchange failed (${resp.status}): ${await resp.text()}`)
  }

  const data = await resp.json()
  return data.access_token
}

async function main() {
  const file = process.argv[2] || process.env.GOOGLE_SERVICE_ACCOUNT_JSON_FILE
  if (!file) {
    console.error('Usage: node scripts/gsc-list-sites.mjs /path/to/service-account.json')
    console.error('   or: GOOGLE_SERVICE_ACCOUNT_JSON_FILE=/path/to/sa.json node scripts/gsc-list-sites.mjs')
    process.exit(2)
  }

  let sa
  try {
    sa = JSON.parse(readFileSync(file, 'utf-8'))
  } catch (e) {
    console.error(`❌ Impossible de lire ${file}: ${e.message}`)
    process.exit(1)
  }

  console.log(`🔐 Service account: ${sa.client_email}`)
  console.log(`   Project: ${sa.project_id}`)

  const token = await getAccessToken(sa)
  console.log('✓ Access token obtenu\n')

  const resp = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const text = await resp.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    console.error(`❌ Réponse non-JSON (${resp.status}):`, text.slice(0, 500))
    process.exit(1)
  }

  if (!resp.ok) {
    console.error(`❌ sites.list failed (${resp.status}):`)
    console.error(JSON.stringify(data, null, 2))
    process.exit(1)
  }

  const sites = data.siteEntry ?? []
  if (sites.length === 0) {
    console.log('⚠️  Aucune propriété GSC accessible pour ce service account.\n')
    console.log('Fix :')
    console.log('  1. Va sur https://search.google.com/search-console')
    console.log('  2. Sélectionne ta propriété toutou-gourmet.com')
    console.log('  3. Paramètres (⚙ en bas à gauche) > Utilisateurs et autorisations')
    console.log('  4. Ajouter un utilisateur :')
    console.log(`     Email : ${sa.client_email}`)
    console.log('     Niveau : Propriétaire (ou au minimum "Complet")')
    console.log('  5. Re-teste dans 2-5 min (propagation Google)')
    return
  }

  console.log(`✅ ${sites.length} propriété(s) accessible(s) :\n`)
  for (const s of sites) {
    const ok = s.permissionLevel === 'siteOwner' || s.permissionLevel === 'siteFullUser'
    const icon = ok ? '✓' : '⚠️'
    console.log(`${icon} ${s.siteUrl}`)
    console.log(`   permissionLevel: ${s.permissionLevel}${ok ? '' : ' (INSUFFISANT pour Search Analytics API — upgrade à "Complet" ou "Propriétaire")'}`)
    console.log()
  }

  console.log('→ Utilise la valeur exacte de `siteUrl` ci-dessus dans le body de /api/search-console')
  console.log('  Exemples valides :')
  console.log('    "siteUrl": "sc-domain:toutou-gourmet.com"    (propriété de domaine)')
  console.log('    "siteUrl": "https://www.toutou-gourmet.com/" (propriété URL-prefix, trailing slash inclus)')
}

main().catch((e) => {
  console.error(`❌ ${e.message ?? e}`)
  process.exit(1)
})
