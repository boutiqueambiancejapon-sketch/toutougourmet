import { isValidElement, type ReactNode } from 'react'
import { slugify } from '@/lib/utils'

// @cdc seo-geo — sommaire d'article : les H2 du MDX, avec des ancres stables.
// Le même slugify sert au rendu des H2 (components/mdx/Heading2.tsx) et au sommaire.

export interface TocItem {
  id: string
  text: string
}

/** Texte brut d'un titre markdown : retire **gras**, *italique*, `code` et [liens](url). */
export function plainHeading(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
}

/** H2 d'un article (hors blocs de code), dans l'ordre. */
export function extractToc(markdown: string): TocItem[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '')
  const items: TocItem[] = []
  for (const line of withoutCode.split('\n')) {
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue
    const text = plainHeading(m[1])
    if (text) items.push({ id: slugify(text), text })
  }
  return items
}

/** Texte d'un nœud React (enfants d'un H2 rendu par MDX). */
export function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}
