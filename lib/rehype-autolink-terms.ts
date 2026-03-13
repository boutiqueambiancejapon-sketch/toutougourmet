/**
 * Plugin rehype : auto-linking de termes clés dans les articles MDX
 *
 * Règles :
 * - Max `maxTotal` liens par article (défaut : 3)
 * - Max 1 lien par terme (première occurrence uniquement)
 * - Uniquement dans les nœuds <p> et <li> — jamais dans les titres ni les composants MDX
 * - Uniquement les nœuds texte directs (pas dans <strong>, <em>, etc.)
 * - Case-insensitive, préserve la casse d'origine
 */

import { visit } from 'unist-util-visit'
import type { Root, Element, Text, ElementContent } from 'hast'
import type { Plugin } from 'unified'

// @cdc alimentation — plugin maillage interne
export interface AutolinkTermsOptions {
  terms: Record<string, string>  // terme (case-insensitive) → URL relative
  maxTotal?: number              // max liens total par article
}

const rehypeAutolinkTerms: Plugin<[AutolinkTermsOptions], Root> = (options) => {
  const { terms, maxTotal = 3 } = options

  // Trier par longueur décroissante : "repas frais" matche avant "frais"
  const sortedTerms = Object.keys(terms).sort((a, b) => b.length - a.length)

  return (tree) => {
    let linksAdded = 0
    const linkedTerms = new Set<string>()

    visit(tree, 'element', (node: Element) => {
      if (linksAdded >= maxTotal) return
      if (!['p', 'li'].includes(node.tagName)) return

      const newChildren: ElementContent[] = []
      let changed = false

      for (const child of node.children) {
        // On ne traite que les nœuds texte directs
        if (child.type !== 'text' || linksAdded >= maxTotal) {
          newChildren.push(child)
          continue
        }

        const textNode = child as Text
        let replaced = false

        for (const term of sortedTerms) {
          if (linkedTerms.has(term)) continue

          const lowerText = textNode.value.toLowerCase()
          const lowerTerm = term.toLowerCase()
          const idx = lowerText.indexOf(lowerTerm)
          if (idx === -1) continue

          const before = textNode.value.slice(0, idx)
          const match = textNode.value.slice(idx, idx + term.length)
          const after = textNode.value.slice(idx + term.length)

          if (before) newChildren.push({ type: 'text', value: before })
          newChildren.push({
            type: 'element',
            tagName: 'a',
            properties: { href: terms[term] },
            children: [{ type: 'text', value: match }],
          })
          if (after) newChildren.push({ type: 'text', value: after })

          linkedTerms.add(term)
          linksAdded++
          replaced = true
          changed = true
          break
        }

        if (!replaced) newChildren.push(textNode)
      }

      if (changed) node.children = newChildren
    })
  }
}

export default rehypeAutolinkTerms
