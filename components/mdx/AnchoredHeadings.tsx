import { isValidElement, type ReactNode, type ComponentProps } from 'react'
import { slugify } from '@/lib/utils'

// @cdc seo — id stable sur chaque H2/H3 d'article : permet aux hubs profil de
// lier directement la section concernée (#…) et à Google d'afficher des liens d'ancre.

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

export function AnchoredH2(props: ComponentProps<'h2'>) {
  return <h2 id={slugify(textOf(props.children).trim())} {...props} />
}

export function AnchoredH3(props: ComponentProps<'h3'>) {
  return <h3 id={slugify(textOf(props.children).trim())} {...props} />
}
