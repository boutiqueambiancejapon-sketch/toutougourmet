// Outil DNS Cloudflare de toutou-gourmet.com (accord du propriétaire, 2026-11-11). Clé : CLOUDFLARE_API_TOKEN, limitée
// au DNS de cette zone. Essai à blanc par défaut ; --appliquer pour écrire. Sauvegarde de toute la zone avant chaque
// changement dans /srv/toutou/shared/dns-backups/. Toujours en « DNS only » sauf --proxied explicite.
//   node scripts/dns.mjs lister
//   node scripts/dns.mjs ajouter TYPE NOM VALEUR [--priorite=10] [--proxied] [--appliquer]
//   node scripts/dns.mjs modifier TYPE NOM VALEUR [--proxied] [--appliquer]   (remplace la valeur de l'unique ligne TYPE NOM)
//   node scripts/dns.mjs supprimer TYPE NOM [VALEUR] [--appliquer]
import { mkdirSync, writeFileSync } from 'node:fs'

const ZONE = 'toutou-gourmet.com'
const API = 'https://api.cloudflare.com/client/v4'
const h = { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' }
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const flag = (n) => process.argv.includes(`--${n}`)
const opt = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1]
const appliquer = flag('appliquer')
const fqdn = (nom) => (nom === '@' || nom === ZONE ? ZONE : nom.endsWith(ZONE) ? nom : `${nom}.${ZONE}`)

async function cf(chemin, init = {}) {
  const r = await (await fetch(`${API}${chemin}`, { ...init, headers: h })).json()
  if (!r.success) throw new Error(JSON.stringify(r.errors).slice(0, 300))
  return r.result
}

const zone = (await cf(`/zones?name=${ZONE}`))[0]
if (!zone) throw new Error('zone introuvable')
const tout = await cf(`/zones/${zone.id}/dns_records?per_page=500`)
const affiche = (r) => `${r.type.padEnd(5)} ${r.name.padEnd(42)} ${r.type === 'MX' ? `${r.priority} ` : ''}${r.content}${r.proxied ? '  [orange]' : ''}`
const sauvegarde = () => {
  const dir = '/srv/toutou/shared/dns-backups'
  mkdirSync(dir, { recursive: true })
  const f = `${dir}/${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  writeFileSync(f, JSON.stringify(tout, null, 2))
  console.log(`Sauvegarde : ${f}`)
}

const [action, type, nom, valeur] = args
if (!action || action === 'lister') {
  for (const r of [...tout].sort((a, b) => a.name.localeCompare(b.name) || a.type.localeCompare(b.type))) console.log(affiche(r))
  console.log(`${tout.length} enregistrement(s)`)
} else {
  if (!type || !nom) throw new Error('TYPE et NOM attendus')
  const T = type.toUpperCase()
  const N = fqdn(nom)
  const memes = tout.filter((r) => r.type === T && r.name === N && (!valeur || action !== 'supprimer' || r.content === valeur))
  const corps = { type: T, name: N, content: valeur, ttl: 1, proxied: flag('proxied'), ...(T === 'MX' ? { priority: Number(opt('priorite') ?? 10) } : {}) }
  if (action === 'ajouter') {
    if (!valeur) throw new Error('VALEUR attendue')
    if (tout.some((r) => r.type === T && r.name === N && r.content === valeur)) { console.log('Déjà présent, rien à faire.'); process.exit(0) }
    console.log(`${appliquer ? 'Ajout' : 'Essai, ajouterait'} : ${affiche(corps)}`)
    if (appliquer) { sauvegarde(); await cf(`/zones/${zone.id}/dns_records`, { method: 'POST', body: JSON.stringify(corps) }); console.log('✓ ajouté') }
  } else if (action === 'modifier') {
    if (!valeur) throw new Error('VALEUR attendue')
    if (memes.length !== 1) throw new Error(`${memes.length} ligne(s) ${T} ${N} : modifier demande exactement une ligne`)
    console.log(`${appliquer ? 'Modification' : 'Essai, modifierait'} : ${affiche(memes[0])}  →  ${valeur}`)
    if (appliquer) { sauvegarde(); await cf(`/zones/${zone.id}/dns_records/${memes[0].id}`, { method: 'PATCH', body: JSON.stringify({ content: valeur, proxied: flag('proxied') }) }); console.log('✓ modifié') }
  } else if (action === 'supprimer') {
    if (!memes.length) { console.log('Aucune ligne correspondante.'); process.exit(0) }
    for (const r of memes) console.log(`${appliquer ? 'Suppression' : 'Essai, supprimerait'} : ${affiche(r)}`)
    if (appliquer) { sauvegarde(); for (const r of memes) await cf(`/zones/${zone.id}/dns_records/${r.id}`, { method: 'DELETE' }); console.log(`✓ ${memes.length} supprimée(s)`) }
  } else throw new Error(`action inconnue : ${action}`)
}
