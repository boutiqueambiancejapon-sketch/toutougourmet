import { ProductPick, ProductPicks } from '@/components/article/ProductPicks'
import { capByBrand, displayBrand, displayName, segmentBySlug, type SegmentSlug } from '@/lib/scanner/rankings'
import { segmentRecipes } from '@/lib/server/rankings'

// @cdc avis — avis d'une marque introuvable chez nos partenaires (Orlando, Lidl) : les recettes les mieux notées vendues
// chez Maxi Zoo, une par marque, faits tirés de la fiche (plan CRO du 2026-11-07). Rang = note du scanner seule.
// Dans le MDX : <MeilleuresAlternatives title="…" segment="adulte" />

export async function MeilleuresAlternatives({ title, segment = 'adulte', n = 3 }: { title: string; segment?: SegmentSlug; n?: number }) {
  const seg = segmentBySlug(segment)
  if (!seg) return null
  const top = capByBrand((await segmentRecipes(seg)).filter((r) => r.buy?.store === 'Maxi Zoo'), 1).slice(0, n)
  if (top.length < 2) return null
  return (
    <ProductPicks title={title}>
      {top.map((r) => {
        const faits = [r.ingredients[0] ? `Premier ingrédient : ${r.ingredients[0]}.` : '', r.protein ? `${r.protein} % de protéines.` : '', `Note du scanner : ${r.score} sur 100.`].filter(Boolean).join(' ')
        return <ProductPick key={r.key} name={`${displayBrand(r.brand)} ${displayName(r.name)}`} why={faits} href={r.buy?.href ?? ''} image={r.image} />
      })}
    </ProductPicks>
  )
}
