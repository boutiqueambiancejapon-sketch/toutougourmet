import type { Root, RootContent } from 'mdast'
import { articleEndCta } from './article-cro'

// @cdc guide — version courte du guide en haut des articles aliments (autorisé ou à limiter) et
// recettes : <GuideTop /> en tête du corps de l'article, juste sous « L'essentiel » (rendu par
// ArticleLayout). L'encart de fin reste. Urgences et aliments « danger » : rien (même règle que
// lib/article-cro.ts, rien à demander avant les gestes et les numéros).

type GuideTopKind = 'aliment' | 'recette'

interface GuideTopInput {
  slug: string
  categorySlug: string
  verdict?: 'oui' | 'moderation' | 'danger'
}

export function remarkGuideTop({ kind, slug }: { kind: GuideTopKind; slug: string }) {
  return (tree: Root) => {
    const node = {
      type: 'mdxJsxFlowElement',
      name: 'GuideTop',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'kind', value: kind },
        { type: 'mdxJsxAttribute', name: 'slug', value: slug },
      ],
      children: [],
    } as unknown as RootContent
    tree.children.unshift(node)
  }
}

/** Plugin remark à ajouter à l'article (aucun hors aliments autorisés, à limiter et recettes). */
export function guideTopPlugins(input: GuideTopInput): [typeof remarkGuideTop, { kind: GuideTopKind; slug: string }][] {
  const end = articleEndCta(input)
  if (end === 'guide-aliment') return [[remarkGuideTop, { kind: 'aliment', slug: input.slug }]]
  if (end === 'guide-recette') return [[remarkGuideTop, { kind: 'recette', slug: input.slug }]]
  return []
}
