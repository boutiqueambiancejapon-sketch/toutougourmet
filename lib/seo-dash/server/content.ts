import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// @cdc tableau de bord SEO — articles publiés, lus dans les fichiers MDX (date, mise à jour, rubrique, titre,
// description). Gardé 10 minutes en mémoire : les articles de 7 h et 20 h arrivent par un déploiement.

export interface Publication {
  slug: string
  path: string
  title: string
  description: string
  category: string
  date: string
  updatedAt: string | null
}

let cache: { at: number; list: Publication[] } | null = null
const TTL = 10 * 60_000
const day = (v: unknown): string | null => {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return typeof v === 'string' && /^\d{4}-\d\d-\d\d/.test(v) ? v.slice(0, 10) : null
}

export function publications(): Publication[] {
  if (cache && Date.now() - cache.at < TTL) return cache.list
  const list: Publication[] = []
  for (const dir of ['blog', 'comparatifs']) {
    const base = path.join(process.cwd(), 'content', dir)
    if (!fs.existsSync(base)) continue
    for (const file of fs.readdirSync(base)) {
      if (!file.endsWith('.mdx')) continue
      const { data } = matter(fs.readFileSync(path.join(base, file), 'utf-8'))
      const date = day(data.date)
      if (!date) continue
      const slug = file.replace(/\.mdx$/, '')
      const cat = typeof data.categorySlug === 'string' ? data.categorySlug : dir === 'comparatifs' ? 'marque' : 'blog'
      list.push({
        slug,
        path: `/chien/${cat}/${slug}`,
        title: typeof data.title === 'string' ? data.title : slug,
        description: typeof data.description === 'string' ? data.description : '',
        category: cat,
        date,
        updatedAt: day(data.updatedAt),
      })
    }
  }
  list.sort((a, b) => (a.date < b.date ? 1 : -1))
  cache = { at: Date.now(), list }
  return list
}
