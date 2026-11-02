import type { Brand } from '@/data/brands'
import type { BrandRecipe } from '@/data/brand-content'
import { IconCheck, IconCross } from '@/components/icons'
import { frTypo } from '@/lib/utils'

// @cdc 04-pages — corps d'une fiche marque V2 : présentation, points forts et limites en listes
// simples (sans cartes), recettes en lignes. Rendu serveur, texte indexable.

const H2 = 'm-0 font-display text-2xl font-black leading-tight text-ink md:text-3xl'

export function BrandPresentation({ brand, paragraphs }: { brand: Brand; paragraphs: string[] }) {
  if (paragraphs.length === 0) return null
  return (
    <section aria-labelledby="presentation" className="v2 flex max-w-prose flex-col gap-4">
      <h2 id="presentation" className={H2}>Qui est {brand.name}&nbsp;?</h2>
      {paragraphs.map((p) => (
        <p key={p.slice(0, 32)} className="m-0 leading-relaxed text-ink-2">{frTypo(p)}</p>
      ))}
    </section>
  )
}

function List({ items, kind }: { items: string[]; kind: 'pro' | 'con' }) {
  const Icon = kind === 'pro' ? IconCheck : IconCross
  return (
    <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((t) => (
        <li key={t} className="flex gap-3 leading-snug text-ink-2">
          <Icon className={`mt-0.5 size-5 shrink-0 ${kind === 'pro' ? 'text-green-ink' : 'text-orange-ink'}`} />
          {frTypo(t)}
        </li>
      ))}
    </ul>
  )
}

export function BrandProsCons({ brand }: { brand: Brand }) {
  return (
    <section aria-labelledby="points" className="v2 flex flex-col gap-6">
      <h2 id="points" className={H2}>Quels sont les points forts et les limites de {brand.name}&nbsp;?</h2>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-lg font-semibold text-ink">Points forts</h3>
          <List items={brand.pros} kind="pro" />
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-lg font-semibold text-ink">Limites</h3>
          <List items={brand.cons} kind="con" />
        </div>
      </div>
    </section>
  )
}

export function BrandRecipes({ brand, recipes }: { brand: Brand; recipes: BrandRecipe[] }) {
  if (recipes.length === 0) return null
  return (
    <section aria-labelledby="recettes" className="v2 flex flex-col gap-4">
      <h2 id="recettes" className={H2}>Quelles recettes propose {brand.name}&nbsp;?</h2>
      <dl className="m-0 grid border-t border-line md:grid-cols-2 md:gap-x-10">
        {recipes.map((r) => (
          <div key={r.name} className="flex flex-col gap-1 border-b border-line py-3">
            <dt className="font-semibold text-ink">{r.name}</dt>
            <dd className="m-0 text-sm leading-snug text-ink-2">{r.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
