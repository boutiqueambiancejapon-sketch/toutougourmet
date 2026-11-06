#!/usr/bin/env node
// IndexNow : signale à Bing et aux moteurs partenaires les pages nouvelles, modifiées ou retirées du plan du site.
// Compare /sitemap.xml à l'état du dernier envoi. Au premier lancement, n'envoie que les 30 derniers jours.
// La clé n'est pas un secret : le protocole la publie à la racine du site (public/<clé>.txt).
//   node scripts/indexnow.mjs [--essai]
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'

const SITE = 'https://www.toutou-gourmet.com'
const HOST = new URL(SITE).host
const API = 'https://api.indexnow.org/IndexNow'
const STATE = process.env.INDEXNOW_STATE ?? '/srv/toutou/shared/indexnow-state.json'
const PREMIER_ENVOI_JOURS = 30
const MIN_URLS = 100
const LOT = 10_000
const essai = process.argv.includes('--essai')

const fichier = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (!fichier) throw new Error('Clé IndexNow absente de public/')
const key = fichier.replace('.txt', '')

async function texte(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`${url} : ${res.status}`)
  return res.text()
}

const balises = (xml, nom) => [...xml.matchAll(new RegExp(`<${nom}>(.*?)</${nom}>`, 'g'))].map((m) => m[1])

async function planDuSite() {
  const pages = new Map()
  for (const carte of balises(await texte(`${SITE}/sitemap.xml`), 'loc')) {
    const xml = await texte(carte)
    for (const [, bloc] of xml.matchAll(/<url>(.*?)<\/url>/gs)) {
      const loc = balises(bloc, 'loc')[0]
      if (loc) pages.set(loc, balises(bloc, 'lastmod')[0] ?? '')
    }
  }
  return pages
}

async function main() {
  const pages = await planDuSite()
  // Un plan du site vide ou cassé ne doit pas faire croire que toutes les pages ont disparu.
  if (pages.size < MIN_URLS) throw new Error(`Plan du site suspect : ${pages.size} adresses`)
  const avant = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : null
  const limite = new Date(Date.now() - PREMIER_ENVOI_JOURS * 86_400_000).toISOString().slice(0, 10)
  const urls = avant
    ? [...[...pages].filter(([u, d]) => avant[u] !== d).map(([u]) => u), ...Object.keys(avant).filter((u) => !pages.has(u))]
    : [...pages].filter(([, d]) => d >= limite).map(([u]) => u)
  console.log(`${pages.size} pages, ${urls.length} à signaler`)
  if (essai) return console.log(urls.slice(0, 10).join('\n'))
  for (let i = 0; i < urls.length; i += LOT) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${fichier}`, urlList: urls.slice(i, i + LOT) }),
      signal: AbortSignal.timeout(60_000),
    })
    if (res.status !== 200 && res.status !== 202) throw new Error(`IndexNow a répondu ${res.status} : ${(await res.text()).slice(0, 200)}`)
    console.log(`Réponse ${res.status} pour ${Math.min(LOT, urls.length - i)} adresses`)
  }
  // L'état n'avance qu'après un envoi réussi : un échec sera repris au passage suivant.
  writeFileSync(`${STATE}.tmp`, JSON.stringify(Object.fromEntries(pages)))
  renameSync(`${STATE}.tmp`, STATE)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
