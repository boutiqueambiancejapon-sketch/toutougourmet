import type { ComponentProps } from 'react'
import { slugify } from '@/lib/utils'
import { textOf } from '@/lib/article-toc'
import { titleTypo } from '@/lib/title-typo'

// H2 d'article avec ancre (cible du sommaire) ; scroll-mt laisse la place à l'en-tête collant.
export function Heading2({ children, ...props }: ComponentProps<'h2'>) {
  return (
    <h2 id={slugify(textOf(children))} className="scroll-mt-24" {...props}>
      {titleTypo(children)}
    </h2>
  )
}
