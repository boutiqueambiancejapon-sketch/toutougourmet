import type { Heading, Root, RootContent } from 'mdast'
import { extractToc, type TocItem } from './article-toc'
import { pageTypeOf } from './page-type'

// @cdc cro-carte — pages d'urgence et aliments « danger » : les gestes d'abord. Le plugin remonte en
// tête du corps la section qui contient <WhatToDo> et l'antipoison, juste sous l'encadré Danger, puis
// pose « L'essentiel » (<UrgentTldr />, rendu par la page) et le reste de l'article, sans toucher aux
// fichiers MDX. Un article sans <PoisonCenters> en reçoit un. Le texte ne change pas, seul l'ordre.

interface UrgentInput {
  slug: string
  categorySlug: string
  verdict?: 'oui' | 'moderation' | 'danger'
}

export function isUrgentPage({ slug, categorySlug, verdict }: UrgentInput): boolean {
  return verdict === 'danger' || pageTypeOf(`/chien/${categorySlug}/${slug}`) === 'urgences'
}

const jsx = (name: string): RootContent => ({ type: 'mdxJsxFlowElement', name, attributes: [], children: [] }) as unknown as RootContent
const isJsx = (node: RootContent, name: string): boolean => node.type === ('mdxJsxFlowElement' as RootContent['type']) && 'name' in node && node.name === name
const isH2 = (node: RootContent): boolean => node.type === 'heading' && (node as Heading).depth === 2

export function remarkUrgentFirst() {
  return (tree: Root) => {
    const nodes = tree.children
    const steps = nodes.findIndex((n) => isJsx(n, 'WhatToDo'))
    let first: RootContent[] = []
    let rest = nodes
    if (steps >= 0) {
      const start = nodes.findLastIndex((n, i) => i < steps && isH2(n))
      const from = start >= 0 ? start : steps
      const nextH2 = nodes.findIndex((n, i) => i > steps && isH2(n))
      const to = nextH2 >= 0 ? nextH2 : nodes.length
      first = nodes.slice(from, to)
      rest = [...nodes.slice(0, from), ...nodes.slice(to)]
    }
    if (!first.some((n) => isJsx(n, 'PoisonCenters'))) {
      const poison = rest.findIndex((n) => isJsx(n, 'PoisonCenters'))
      const node = poison >= 0 ? rest[poison] : jsx('PoisonCenters')
      if (poison >= 0) rest = rest.filter((_, i) => i !== poison)
      const at = first.findIndex((n) => isJsx(n, 'WhatToDo'))
      first = at >= 0 ? [...first.slice(0, at + 1), node, ...first.slice(at + 1)] : [node]
    }
    tree.children = [...first, jsx('UrgentTldr'), ...rest]
  }
}

/** Sommaire dans l'ordre affiché : la section des gestes passe en premier. */
export function urgentToc(toc: TocItem[], rawContent: string): TocItem[] {
  const steps = rawContent.indexOf('<WhatToDo')
  if (steps < 0) return toc
  const heading = extractToc(rawContent.slice(0, steps)).at(-1)
  if (!heading) return toc
  return [heading, ...toc.filter((item) => item.id !== heading.id)]
}
