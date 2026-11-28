import { NextResponse, type NextRequest } from 'next/server'
import { fromGo } from '@/lib/go'

// @cdc affiliation — /go/<jeton> : seul passage vers les marchands (lib/go.ts). Filtre avant le vrai lien :
// robot déclaré, navigateur sans langue ou sans tête, préchargement, rafale de clics d'une même adresse (plus de 8 en
// 10 minutes, ou plus de 3 vers le même lien) : la personne reste chez nous, le marchand ne reçoit rien. Les refus
// (403, 429) restent dans les journaux du serveur pour la surveillance quotidienne (scripts/go-veille.ts).
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BOT = /bot|crawl|spider|slurp|curl|wget|python|httpclient|okhttp|go-http|java\/|headless|phantom|puppeteer|playwright|selenium|preview|facebookexternalhit|scrapy|axios|node-fetch|libwww|semrush|ahrefs|mj12|petal|bytespider|gptbot|claude|perplexity|ccbot/i
const WINDOW = 10 * 60_000
const hits = new Map<string, number[]>()
const NO = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }

function refuse(status: 403 | 429) {
  const body = '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Lien partenaire</title><body style="font:16px system-ui;max-width:520px;margin:15vh auto;padding:0 20px"><h1 style="font-size:20px">Lien momentanément indisponible</h1><p>Trop de clics en peu de temps depuis cette connexion. Réessaie dans quelques minutes, ou <a href="/">reviens au site</a>.</p></body></html>'
  return new NextResponse(body, { status, headers: { ...NO, 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ t: string }> }) {
  const { t } = await ctx.params
  const to = fromGo(t)
  if (!to) return new NextResponse('Lien inconnu', { status: 404, headers: NO })
  const h = req.headers
  if (/prefetch/i.test(h.get('sec-purpose') ?? h.get('purpose') ?? '') || h.get('next-router-prefetch')) return new NextResponse(null, { status: 204, headers: NO })
  const ua = h.get('user-agent') ?? ''
  if (!ua || BOT.test(ua) || !h.get('accept-language')) return refuse(403)
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'inconnu'
  const now = Date.now()
  const mine = (hits.get(ip) ?? []).filter((x) => now - x < WINDOW)
  const same = (hits.get(`${ip}|${t}`) ?? []).filter((x) => now - x < WINDOW)
  if (mine.length >= 8 || same.length >= 3) return refuse(429)
  hits.set(ip, [...mine, now]); hits.set(`${ip}|${t}`, [...same, now])
  if (hits.size > 20_000) for (const [k, v] of hits) if (now - (v[v.length - 1] ?? 0) > WINDOW) hits.delete(k)
  return NextResponse.redirect(to, { status: 302, headers: NO })
}
