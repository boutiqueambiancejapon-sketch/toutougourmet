import type { Code, Paragraph, Root, RootContent } from 'mdast'

// @cdc 04-pages — repère les lignes de calcul seules dans leur paragraphe (« **Glucides (%) = 100 −
// protéines − lipides** ») et les rend en bloc <ArticleFormula>, sans toucher au texte des articles.
// Seuls les paragraphes au premier niveau sont lus : une formule dans un encadré garde son encadré.
// Un bloc de code n'est repris que sans langage et si toutes ses lignes sont des formules : un vrai
// bloc de code reste du code.

const SHAPE = /^(.{1,45}?) [=≈] (.+)$/
const ARITHMETIC = /[−×÷+^*]| \/ /
const PROSE = /[→—;:]|,\s+\p{L}/u

/** La formule nettoyée si le texte en est une, sinon null. */
export function formulaIn(raw: string): string | null {
  const text = raw.trim().replace(/\.$/, '')
  const match = SHAPE.exec(text)
  if (!match) return null
  const [, left, right] = match
  if (right.length > 110 || /[:,→—]/.test(left) || !/^\p{L}/u.test(left)) return null
  return ARITHMETIC.test(right) && !PROSE.test(right) ? text : null
}

function plainText(node: RootContent): string | null {
  if (node.type === 'text') return node.value
  if ((node.type === 'strong' || node.type === 'emphasis') && node.children.length === 1) return plainText(node.children[0])
  return null
}

function block(text: string): RootContent {
  return {
    type: 'mdxJsxFlowElement',
    name: 'ArticleFormula',
    attributes: [{ type: 'mdxJsxAttribute', name: 'text', value: text }],
    children: [],
  } as unknown as RootContent
}

/** Les nœuds qui remplacent ce paragraphe, ou null s'il ne contient pas de formule seule. */
function fromParagraph(node: Paragraph): RootContent[] | null {
  const [first, second] = node.children
  if (node.children.length === 1) {
    const formula = formulaIn(plainText(first) ?? '')
    return formula ? [block(formula)] : null
  }
  // « Formule de conversion : **a = b × c** » : le libellé reste, la formule passe dessous.
  if (node.children.length === 2 && first.type === 'text' && /:\s*$/.test(first.value) && first.value.length <= 60 && second.type === 'strong') {
    const formula = formulaIn(plainText(second) ?? '')
    return formula ? [{ ...node, children: [first] }, block(formula)] : null
  }
  return null
}

function fromCode(node: Code): RootContent[] | null {
  if (node.lang) return null
  const lines = node.value.split('\n').map((l) => l.trim()).filter(Boolean)
  const formulas = lines.map(formulaIn)
  return formulas.length && formulas.every(Boolean) ? formulas.map((f) => block(f as string)) : null
}

export function remarkFormula() {
  return (tree: Root) => {
    tree.children = tree.children.flatMap((node) => {
      if (node.type === 'paragraph') return fromParagraph(node) ?? [node]
      if (node.type === 'code') return fromCode(node) ?? [node]
      return [node]
    })
  }
}
