import type { Article } from '@/lib/mdx'

// @cdc seo — sélection « Continuer votre lecture » pensée pour répartir l'autorité.
//
// Ancien algo : les 3 articles les plus récents de la catégorie sur TOUTES les
// pages de la catégorie (jusqu'à 108 liens chacun, 0 pour les 296 autres), plus
// 3 articles au hasard. Nouveau découpage des 6 cartes :
//  1. 2 voisins dans la catégorie (anneau trié par slug) → chaque article reçoit
//     au moins 2 liens de sa catégorie, et l'anneau ne bouge que localement quand
//     un article est ajouté.
//  2. 2 articles de la catégorie les plus proches par tags (tags rares pondérés
//     plus fort, IDF) → pertinence éditoriale.
//  3. 2 articles d'autres catégories les plus proches par tags → ponts thématiques.
// Égalités départagées par un hash stable (slug courant + candidat) : rendu
// déterministe, SSR-safe, sans favoriser toujours les mêmes pages.

const RING_PICKS = 2
const SAME_CATEGORY_PICKS = 2
const TOTAL = 6

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const normalizeTag = (t: string) => t.trim().toLowerCase()

function tagSet(a: Article): Set<string> {
  return new Set((a.frontmatter.tags ?? []).map(normalizeTag))
}

function buildIdf(articles: Article[]): Map<string, number> {
  const df = new Map<string, number>()
  for (const a of articles) {
    for (const t of tagSet(a)) df.set(t, (df.get(t) ?? 0) + 1)
  }
  const idf = new Map<string, number>()
  for (const [t, n] of df) idf.set(t, Math.log(articles.length / n))
  return idf
}

export function selectRelatedArticles(
  currentSlug: string,
  categorySlug: string,
  allArticles: Article[],
): Article[] {
  const current = allArticles.find((a) => a.slug === currentSlug)
  const idf = buildIdf(allArticles)
  const currentTags = current ? tagSet(current) : new Set<string>()

  const score = (a: Article) => {
    let s = 0
    for (const t of tagSet(a)) if (currentTags.has(t)) s += idf.get(t) ?? 0
    return s
  }
  const byRelevance = (list: Article[]) =>
    list
      .map((a) => ({ a, s: score(a), h: hash(`${currentSlug}|${a.slug}`) }))
      .sort((x, y) => y.s - x.s || x.h - y.h)
      .map((x) => x.a)

  const picked: Article[] = []
  const take = (list: Article[], n: number) => {
    for (const a of list) {
      if (n <= 0 || picked.length >= TOTAL) break
      if (a.slug === currentSlug || picked.some((p) => p.slug === a.slug)) continue
      picked.push(a)
      n--
    }
  }

  // 1. Voisins dans l'anneau de la catégorie
  const sameCategory = allArticles
    .filter((a) => a.frontmatter.categorySlug === categorySlug)
    .sort((a, b) => a.slug.localeCompare(b.slug))
  const idx = sameCategory.findIndex((a) => a.slug === currentSlug)
  if (idx !== -1 && sameCategory.length > 1) {
    const ring = Array.from({ length: sameCategory.length - 1 }, (_, i) => sameCategory[(idx + 1 + i) % sameCategory.length])
    take(ring, RING_PICKS)
  }

  // 2. Les plus proches dans la catégorie
  take(byRelevance(sameCategory), SAME_CATEGORY_PICKS)

  // 3. Ponts vers les autres catégories (complète jusqu'à 6)
  const otherCategories = allArticles.filter((a) => a.frontmatter.categorySlug !== categorySlug)
  take(byRelevance(otherCategories), TOTAL - picked.length)

  return picked
}
