import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { frTypo } from '@/lib/utils'

// @cdc 04-pages — titres H1 à H3 : jamais de « ? » seul en début de ligne, ni de « est- / il » coupé
// (audit mobile 2026-11-04). Insécables devant la ponctuation (frTypo) et verbe + pronom en un seul
// bloc insécable, posé par du CSS : le texte reste « peut-il » pour les moteurs et les IA, sans U+2011
// (absent des polices du site). L'ancre du titre et le JSON-LD se calculent sur le texte d'origine.

const VERB_PRONOUN = /([\p{L}’'-]*\p{L}(?:-t)?-(?:ils?|elles?|on|ce))(?![\p{L}-])/gu

function typoText(text: string): ReactNode {
  const parts = frTypo(text).split(VERB_PRONOUN)
  if (parts.length === 1) return parts[0]
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="whitespace-nowrap">{part}</span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

/** À appeler au rendu d'un titre, sur une chaîne ou sur les enfants d'un titre MDX. */
export function titleTypo(node: ReactNode): ReactNode {
  if (typeof node === 'string') return typoText(node)
  if (Array.isArray(node)) {
    return Children.map(node, (child) => <Fragment>{titleTypo(child)}</Fragment>)
  }
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>
    return el.props.children === undefined ? el : cloneElement(el, undefined, titleTypo(el.props.children))
  }
  return node
}
