import type { Pool } from 'pg'
import { SITE } from '../config'
import type { Range } from './range'
import { Params } from './sql'

// @cdc tableau de bord SEO — journaux du serveur (analytics.hits) : Googlebot vérifié par les plages d'adresses
// publiées par Google (une fausse signature « Googlebot » ne compte pas), robots d'IA par entreprise, erreurs.

const RANGES_URL = 'https://developers.google.com/static/crawling/ipranges/common-crawlers.json'

let cidrs: { at: number; list: string[] } | null = null

/** Plages d'adresses des robots de Google (rechargées chaque jour, liste vide si Google ne répond pas). */
export async function googleCidrs(): Promise<string[]> {
  if (cidrs && Date.now() - cidrs.at < 86_400_000) return cidrs.list
  try {
    const res = await fetch(RANGES_URL, { next: { revalidate: 86_400 }, signal: AbortSignal.timeout(8000) })
    const data = (await res.json()) as { prefixes: { ipv4Prefix?: string; ipv6Prefix?: string }[] }
    const list = data.prefixes.map((p) => p.ipv4Prefix ?? p.ipv6Prefix ?? '').filter(Boolean)
    cidrs = { at: Date.now(), list }
    return list
  } catch {
    return cidrs?.list ?? []
  }
}

/** Condition SQL « vrai Googlebot » : signature et adresse de Google (sans plages connues : signature seule). */
export async function googlebotSql(p: Params, alias = ''): Promise<string> {
  const list = await googleCidrs()
  const col = (c: string) => (alias ? `${alias}.${c}` : c)
  if (!list.length) return `${col('bot')} = 'Googlebot'`
  return `${col('bot')} = 'Googlebot' AND ${col('ip')} <<= ANY(${p.add(list)}::cidr[])`
}

/** Fichiers (images, scripts, icônes) : ni pages ni erreurs à corriger dans le contenu. */
export const ASSET_SQL = `(path ~ '^/(_next/|images/|fonts/|icons?/)' OR path ~ '\\.(js|css|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|txt|xml|json|pdf)$')`
/** Sondes de pirates (wp-admin, .env, .php…) : retirées des erreurs, elles ne disent rien du site. */
export const PROBE_SQL = `(path ~* '(wp-|\\.php|\\.env|\\.git|xmlrpc|cgi-bin|\\.asp|/admin|phpmyadmin|\\.sql|\\.bak|\\.zip|netlify|firebase|\\.well-known|\\.aws|\\.ds_store|config\\.)')`

/** Groupe d'affichage d'une adresse de journal : fiche, article, autre page, fichier. */
export function crawlGroupSql(p: Params): string {
  const fiche = SITE.pageTypes.find((t) => t.key === 'fiche')?.match.source ?? '^$'
  const article = SITE.pageTypes.filter((t) => t.key === 'article' || t.key === 'marque').map((t) => `(${t.match.source})`).join('|') || '^$'
  return `CASE WHEN ${ASSET_SQL} THEN 'asset' WHEN path ~ ${p.add(fiche)} THEN 'fiche' WHEN path ~ ${p.add(article)} THEN 'article' ELSE 'autre' END`
}

export const tsIn = (p: Params, r: Range, col = 'ts'): string =>
  `${col} >= (${p.add(r.start)}::date AT TIME ZONE 'Europe/Paris') AND ${col} < ((${p.add(r.end)}::date + 1) AT TIME ZONE 'Europe/Paris')`

export interface ErrorRow {
  path: string
  status: number
  hits: number
  last: string
}

/** Erreurs vues par Googlebot (vérifié) et Bingbot, sondes de pirates retirées. */
export async function crawlErrors(pool: Pool, r: Range, min = 400): Promise<ErrorRow[]> {
  const p = new Params()
  const g = await googlebotSql(p)
  const { rows } = await pool.query(
    `SELECT path, status, count(*)::int AS hits, max(ts)::date::text AS last FROM analytics.hits
      WHERE ${tsIn(p, r)} AND status >= ${p.add(min)} AND ((${g}) OR bot = 'Bingbot') AND NOT ${PROBE_SQL}
      GROUP BY 1, 2 ORDER BY 3 DESC, 1 LIMIT 200`,
    p.values,
  )
  // Une adresse corrigée depuis (réponse correcte plus récente que la dernière erreur) sort de la liste.
  const errs = rows as ErrorRow[]
  if (!errs.length) return errs
  const fixed = await pool.query<{ path: string; last: string }>(
    `SELECT path, max(ts)::date::text AS last FROM analytics.hits WHERE path = ANY($1::text[]) AND status < 400 AND ts >= $2::date GROUP BY 1`,
    [[...new Set(errs.map((e) => e.path))], r.start],
  )
  const ok = new Map(fixed.rows.map((x) => [x.path, x.last]))
  return errs.filter((e) => !ok.has(e.path) || (ok.get(e.path) ?? '') < e.last)
}

/** Chemins vus au moins une fois par Googlebot vérifié depuis le début des journaux. */
export async function crawledPaths(pool: Pool): Promise<Set<string>> {
  const p = new Params()
  const g = await googlebotSql(p)
  const { rows } = await pool.query<{ path: string }>(`SELECT DISTINCT path FROM analytics.hits WHERE ${g} AND status < 400`, p.values)
  return new Set(rows.map((x) => x.path.replace(/\/$/, '') || '/'))
}
