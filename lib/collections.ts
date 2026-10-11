import type { Metadata } from 'next'
import type { Article } from '@/lib/mdx'
import { extractFaqs } from '@/lib/mdx'
import { slugify } from '@/lib/utils'
import { collections, type Collection } from '@/data/collections'

// @cdc seo — un hub n'est indexé, listé dans le sitemap et lié depuis le site
// qu'à partir de 8 articles (dont 3 dédiés pour un profil). En dessous : noindex,
// le temps d'écrire le contenu manquant.
const MIN_TOTAL = 8
const MIN_DEDICATED_PROFIL = 3
const MAX_FAQ = 6

export interface CollectionMention {
  article: Article
  heading: string
  anchor: string
}

export interface CollectionFaq {
  question: string
  answer: string
  article: Article
}

export interface CollectionContent {
  collection: Collection
  dedicated: Article[]
  mentions: CollectionMention[]
  faqs: CollectionFaq[]
  published: boolean
}

/** Texte brut d'un titre Markdown : même résultat que le texte rendu du H2/H3 */
export function headingText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
}

export const headingAnchor = (text: string) => slugify(text)

export function articleHref(a: Article): string {
  return a.frontmatter.categorySlug ? `/chien/${a.frontmatter.categorySlug}/${a.slug}` : `/blog/${a.slug}`
}

function isMember(a: Article, c: Collection): boolean {
  return c.kind === 'theme' ? a.frontmatter.theme === c.slug : (a.frontmatter.profils ?? []).includes(c.slug)
}

function findMentions(c: Collection, all: Article[], dedicated: Set<string>): CollectionMention[] {
  if (!c.headingPattern) return []
  const re = new RegExp(c.headingPattern, 'iu')
  const out: CollectionMention[] = []
  for (const a of all) {
    if (dedicated.has(a.slug)) continue
    // Premier H2/H3 correspondant de l'article (un seul lien par article)
    const match = a.rawContent
      .split('\n')
      .map((l) => l.match(/^#{2,3}\s+(.+?)\s*$/)?.[1])
      .find((h): h is string => Boolean(h) && re.test(headingText(h!)) && !/^TL;DR/i.test(h!))
    if (match) {
      const heading = headingText(match)
      out.push({ article: a, heading, anchor: headingAnchor(heading) })
    }
  }
  return out.sort((x, y) => x.article.frontmatter.title.localeCompare(y.article.frontmatter.title, 'fr'))
}

function firstSentences(text: string, max = 260): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const end = cut.lastIndexOf('. ')
  return end > 80 ? cut.slice(0, end + 1) : `${cut.trimEnd()}…`
}

function pickFaqs(dedicated: Article[], mentioned: Article[], pattern?: RegExp): CollectionFaq[] {
  // Une question par article : guides dédiés d'abord (la 1re question qui cite le
  // profil, sinon la 1re tout court), puis guides mentionnés (question qui cite le profil)
  const out: CollectionFaq[] = []
  const seen = new Set<string>()
  const candidates = [
    ...dedicated.map((a) => ({ a, strict: false })),
    ...mentioned.map((a) => ({ a, strict: true })),
  ]
  for (const { a, strict } of candidates) {
    const faqs = extractFaqs(a.rawContent).filter((f) => !seen.has(f.question.toLowerCase()))
    const faq = (pattern && faqs.find((f) => pattern.test(f.question))) || (strict ? undefined : faqs.at(0))
    if (!faq) continue
    seen.add(faq.question.toLowerCase())
    out.push({ question: faq.question, answer: firstSentences(faq.answer), article: a })
    if (out.length >= MAX_FAQ) break
  }
  return out
}

export function getCollectionContent(c: Collection, all: Article[]): CollectionContent {
  const dedicated = all
    .filter((a) => isMember(a, c))
    .sort((x, y) => x.frontmatter.title.localeCompare(y.frontmatter.title, 'fr'))
  const mentions = findMentions(c, all, new Set(dedicated.map((a) => a.slug)))
  const total = dedicated.length + mentions.length
  const published =
    total >= MIN_TOTAL && (c.kind === 'theme' || dedicated.length >= MIN_DEDICATED_PROFIL)
  return {
    collection: c,
    dedicated,
    mentions,
    faqs: pickFaqs(
      dedicated,
      mentions.map((m) => m.article),
      c.headingPattern ? new RegExp(c.headingPattern, 'iu') : undefined,
    ),
    published,
  }
}

export function getPublishedCollections(all: Article[], kind?: Collection['kind']): CollectionContent[] {
  return collections
    .filter((c) => !kind || c.kind === kind)
    .map((c) => getCollectionContent(c, all))
    .filter((cc) => cc.published)
}

export function collectionMetadata(c: Collection, all: Article[]): Metadata {
  const { published } = getCollectionContent(c, all)
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `https://www.toutou-gourmet.com/chien/${c.slug}` },
    // @cdc seo — hub sous le seuil de contenu : noindex jusqu'à ce qu'il soit étoffé
    ...(published ? {} : { robots: { index: false, follow: true } }),
  }
}
