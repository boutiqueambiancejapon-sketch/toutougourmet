import type { Root, RootContent, Heading } from 'mdast'

// @cdc affiliation — insère <MidCta /> avant l'intertitre H2 le plus proche du milieu de
// l'article. Jamais avant le premier H2 ni avant la FAQ ; rien si l'article a moins de 3 H2.

function textOf(node: RootContent): string {
  if ('value' in node && typeof node.value === 'string') return node.value
  if ('children' in node) return (node.children as RootContent[]).map(textOf).join('')
  return ''
}

const SKIP = /question|faq/i

export function remarkMidCta() {
  return (tree: Root) => {
    const h2 = tree.children
      .map((node, index) => ({ node, index }))
      .filter((x): x is { node: Heading; index: number } => x.node.type === 'heading' && (x.node as Heading).depth === 2)
    if (h2.length < 3) return
    const candidates = h2.slice(1).filter((x) => !SKIP.test(textOf(x.node)))
    if (!candidates.length) return
    const middle = tree.children.length / 2
    const target = candidates.reduce((best, x) => (Math.abs(x.index - middle) < Math.abs(best.index - middle) ? x : best))
    const cta = { type: 'mdxJsxFlowElement', name: 'MidCta', attributes: [], children: [] } as unknown as RootContent
    tree.children.splice(target.index, 0, cta)
  }
}
