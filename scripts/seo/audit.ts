// @cdc tableau de bord SEO — audit de nuit des pages du plan du site : titre, description, canonique, noindex, H1 et
// liens internes (graphe → pages orphelines), puis état de chaque adresse liée (liens cassés). Les pages sont lues
// sur le site local (127.0.0.1:3000, sans passer par Caddy : ni journaux ni statistiques), 3 à la fois.
//   tsx scripts/seo/audit.ts [--max=2000]
import pg from 'pg'
import { cleanPath, SITE } from '../../lib/seo-dash/config'
import { sitemapEntries } from '../../lib/seo-dash/server/sitemap'

const LOCAL = process.env.AUDIT_ORIGIN || 'http://127.0.0.1:3000'
const HOST = new URL(SITE.baseUrl).host
const MAX = Number(process.argv.find((a) => a.startsWith('--max='))?.split('=')[1] ?? 2000)
const SKIP = /^\/(api|_next|tableau-de-bord|garde|en)(\/|$)|\.(png|jpe?g|webp|svg|pdf|xml|txt|ico|json|js|css)$/i

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()

async function get(path: string, method: 'GET' | 'HEAD' = 'GET'): Promise<{ status: number; html: string }> {
  try {
    const res = await fetch(`${LOCAL}${encodeURI(path)}`, {
      method,
      redirect: 'manual',
      headers: { Host: HOST, 'X-Forwarded-Proto': 'https', 'X-Forwarded-Host': HOST, 'User-Agent': 'ToutouAudit/1.0 (+tableau de bord)' },
      signal: AbortSignal.timeout(30_000),
    })
    return { status: res.status, html: method === 'GET' && res.status === 200 ? await res.text() : '' }
  } catch {
    return { status: 0, html: '' }
  }
}

function parse(html: string) {
  const head = html.slice(0, html.indexOf('</head>') > 0 ? html.indexOf('</head>') : 20_000)
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]
  const desc = /<meta[^>]+name="description"[^>]+content="([^"]*)"/i.exec(head)?.[1]
  const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i.exec(head)?.[1]
  const robots = /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i.exec(head)?.[1] ?? ''
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, '')
  const links = new Set<string>()
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    let href = decode(m[1])
    if (href.startsWith(SITE.baseUrl)) href = href.slice(SITE.baseUrl.length) || '/'
    if (!href.startsWith('/') || href.startsWith('//')) continue
    const path = cleanPath(href).replace(/\/$/, '') || '/'
    if (!SKIP.test(path)) links.add(path)
  }
  return {
    title: title ? decode(title) : null,
    description: desc ? decode(desc) : null,
    canonical: canonical ? decode(canonical) : null,
    noindex: /noindex/i.test(robots),
    h1: h1 ? decode(h1).slice(0, 300) : null,
    links: [...links],
  }
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>): Promise<void> {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) await fn(items[i++])
  }))
}

async function main(): Promise<void> {
  const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
  const pages = (await sitemapEntries()).slice(0, MAX)
  const now = new Date()
  const audits: { path: string; status: number; p: ReturnType<typeof parse> | null }[] = []
  await pool(pages, 3, async (e) => {
    const r = await get(e.path)
    audits.push({ path: e.path, status: r.status, p: r.status === 200 ? parse(r.html) : null })
  })
  const known = new Map(audits.map((a) => [a.path, a.status]))
  const targets = [...new Set(audits.flatMap((a) => a.p?.links ?? []))].filter((t) => !known.has(t))
  const status = new Map(known)
  await pool(targets, 3, async (t) => {
    status.set(t, (await get(t, 'HEAD')).status)
  })
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM analytics.page_audit')
    await client.query('DELETE FROM analytics.page_links')
    await client.query('DELETE FROM analytics.link_status')
    for (const a of audits) {
      await client.query(
        `INSERT INTO analytics.page_audit (path, checked_at, status, title, description, canonical, h1, noindex, in_sitemap, links_out)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)`,
        [a.path, now, a.status, a.p?.title ?? null, a.p?.description ?? null, a.p?.canonical ?? null, a.p?.h1 ?? null, a.p?.noindex ?? false, a.p?.links.length ?? 0],
      )
      const links = a.p?.links ?? []
      for (let i = 0; i < links.length; i += 500) {
        const lot = links.slice(i, i + 500)
        await client.query(`INSERT INTO analytics.page_links (src, dst) SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING`, [a.path, lot])
      }
    }
    const st = [...status]
    await client.query(`INSERT INTO analytics.link_status (path, status, checked_at) SELECT unnest($1::text[]), unnest($2::int[]), $3`, [st.map((s) => s[0]), st.map((s) => s[1]), now])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
  await db.end()
  const broken = [...status].filter(([, s]) => s >= 400 || s === 0).length
  console.log(`Audit : ${audits.length} pages lues, ${targets.length} adresses liées hors plan du site vérifiées, ${broken} en erreur`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
