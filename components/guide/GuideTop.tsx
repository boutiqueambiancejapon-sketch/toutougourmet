import { bookSummary } from '@/lib/guide/book'
import { GuideInline } from './GuideInline'

// @cdc guide — version courte du guide en haut d'article (lib/remark-guide-top.ts) : une ligne,
// puis le champ e-mail. Rendu serveur de la phrase (chiffres du livre), formulaire côté client.

export function GuideTop({ kind, slug }: { kind: 'aliment' | 'recette'; slug: string }) {
  const { foodCount, recipeCount } = bookSummary()
  const line =
    kind === 'recette'
      ? `Les ${recipeCount} recettes du guide de la gamelle, avec les doses par taille de chien, et ${foodCount} aliments classés. Gratuit, en PDF.`
      : `${foodCount} aliments classés en autorisé, à limiter et interdit, sur une page à coller sur le frigo. Le guide de la gamelle est gratuit, en PDF.`
  return <GuideInline line={line} slug={slug} />
}
