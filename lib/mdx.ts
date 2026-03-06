import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content')

export interface ArticleFrontmatter {
  title: string
  description: string
  date: string
  updatedAt: string
  category: string
  tags: string[]
  image: string
  author: string
}

export interface Article {
  slug: string
  frontmatter: ArticleFrontmatter
  content: string      // MDX brut pour next-mdx-remote
  rawContent: string   // même chose (alias pour compat TL;DR)
}

export function getAllArticles(): Article[] {
  const blogDir = path.join(contentDir, 'blog')
  if (!fs.existsSync(blogDir)) return []
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'))
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8')
      const { data, content } = matter(raw)
      return { slug, frontmatter: data as ArticleFrontmatter, content, rawContent: content }
    })
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(contentDir, 'blog', `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { slug, frontmatter: data as ArticleFrontmatter, content, rawContent: content }
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter((a) => a.frontmatter.category === category)
}

// Extrait les items TL;DR depuis le contenu MDX brut
export function extractTldr(rawContent: string): string[] {
  const match = rawContent.match(/##?\s*TL;DR[^\n]*\n([\s\S]*?)(?=\n##)/i)
  if (!match) return []
  const items = match[1].match(/^[-*]\s+(.+)$/gm)
  return items ? items.map((i) => i.replace(/^[-*]\s+/, '')) : []
}

// Supprime la section TL;DR du contenu MDX pour éviter le doublon
export function stripTldr(content: string): string {
  return content.replace(/##?\s*TL;DR[^\n]*\n([\s\S]*?)(?=\n##)/i, '')
}

// Estimation du temps de lecture depuis le MDX brut
export function estimateReadTime(content: string): number {
  const words = content.replace(/^---[\s\S]*?---/, '').split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
