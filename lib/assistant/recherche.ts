// @cdc assistant — trouve les articles du site qui répondent à une question, sans IA : mots communs avec le titre,
// l'adresse, les étiquettes et la description, pondérés. Fonctions pures, testées par scripts/test-assistant.ts.

export interface ArticleIndexe {
  slug: string
  url: string
  titre: string
  tags: string[]
  description: string
  texte: string
}

export interface Trouve {
  article: ArticleIndexe
  score: number
}

const VIDES = new Set('le la les un une des du de d l au aux a et ou en est il elle on mon ma mes ton ta tes son sa ses ce cet cette pour par sur dans avec sans que qui quoi quel quelle quels quelles comment combien pourquoi est-ce peut peux puis manger mange donner chien chiens chiot chienne mon-chien je j tu y pas ne plus bien bon bonne'.split(' '))

/** Mots utiles d'un texte : sans accents, sans mots vides, pluriels simples ramenés au singulier. */
export function mots(texte: string): string[] {
  return texte
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((m) => m.length > 2 && !VIDES.has(m))
    .map((m) => (m.length > 4 ? m.replace(/(x|s)$/, '') : m))
}

export function chercherArticles(articles: ArticleIndexe[], question: string, n = 3): Trouve[] {
  const q = [...new Set(mots(question))]
  if (q.length === 0) return []
  return articles
    .map((article) => {
      const titre = new Set([...mots(article.titre), ...mots(article.slug.replace(/-/g, ' '))])
      const tags = new Set(mots(article.tags.join(' ')))
      const desc = new Set(mots(article.description))
      const score = q.reduce((s, m) => s + (titre.has(m) ? 3 : 0) + (tags.has(m) ? 2 : 0) + (desc.has(m) ? 1 : 0), 0)
      return { article, score: score / Math.sqrt(q.length) }
    })
    .filter((t) => t.score >= 2.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
}

/** Texte de l'article sans MDX ni balises, pour l'extrait donné à l'IA. */
export function texteBrut(mdx: string, max = 2200): string {
  return mdx
    .replace(/^---[\s\S]*?---/, '')
    .split(/^## Sources/m)[0]
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#>|`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}
