import { cleanPath, SITE } from '../config'

// @cdc tableau de bord SEO — adresses du plan du site (index + plans fils), lues sur le site en ligne, gardées
// une heure. Sert aux pages jamais vues par Google, à l'audit de nuit et à l'inspection d'URL.

let cache: { at: number; list: SitemapEntry[] } | null = null

export interface SitemapEntry {
  path: string
  lastmod: string | null
}

async function fetchXml(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(15_000) })
  if (!res.ok) throw new Error(`plan du site ${res.status}`)
  return res.text()
}

function entries(xml: string): { loc: string; lastmod: string | null }[] {
  const out: { loc: string; lastmod: string | null }[] = []
  for (const m of xml.matchAll(/<(?:url|sitemap)>([\s\S]*?)<\/(?:url|sitemap)>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1]?.trim()
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1]?.trim().slice(0, 10) ?? null
    if (loc) out.push({ loc, lastmod })
  }
  return out
}

export async function sitemapEntries(): Promise<SitemapEntry[]> {
  if (cache && Date.now() - cache.at < 3_600_000) return cache.list
  const root = await fetchXml(SITE.sitemapUrl)
  const top = entries(root)
  const isIndex = /<sitemapindex/.test(root)
  const all = isIndex ? (await Promise.all(top.map((s) => fetchXml(s.loc).then(entries)))).flat() : top
  const seen = new Set<string>()
  const list: SitemapEntry[] = []
  for (const e of all) {
    const path = cleanPath(e.loc).replace(/\/$/, '') || '/'
    if (seen.has(path)) continue
    seen.add(path)
    list.push({ path, lastmod: e.lastmod })
  }
  cache = { at: Date.now(), list }
  return list
}
