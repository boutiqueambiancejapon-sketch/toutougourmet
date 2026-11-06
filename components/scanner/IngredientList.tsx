import { INGREDIENT_CLASS_LABELS, ingredientClass, type IngredientClass } from '@/lib/scanner/ingredient-class'
import type { ScanAnalysis } from '@/lib/scanner/result'

// @cdc scanner — composition dans l'ordre de l'étiquette : rang, repère coloré selon les règles de la note, pourcentage
// aligné. Au-delà de 10 ingrédients, la suite est repliée mais reste dans le HTML. Sans état.

const VISIBLES = 10

const POINT: Record<IngredientClass, string> = {
  nommee: 'bg-green-ink',
  'non-nommee': 'bg-amber-ink',
  cereale: 'bg-line-2',
  controverse: 'bg-rose-ink',
  autre: 'bg-cream-2 ring-1 ring-line-2',
}

const pct = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`
const capitale = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type Ingredient = ScanAnalysis['label']['ingredients'][number]

function Ligne({ ingredient, rang }: { ingredient: Ingredient; rang: number }) {
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span aria-hidden="true" className="w-5 shrink-0 text-right text-sm tabular-nums text-ink-2">{rang}</span>
      <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-pill ${POINT[ingredientClass(ingredient.nom)]}`} />
      <span className="min-w-0 grow text-[15px] leading-snug text-ink [overflow-wrap:anywhere]">{capitale(ingredient.nom)}</span>
      {ingredient.pourcentage !== null ? <span className="shrink-0 whitespace-nowrap text-[15px] font-semibold tabular-nums text-ink">{pct(ingredient.pourcentage)}</span> : null}
    </li>
  )
}

export function IngredientList({ ingredients }: { ingredients: Ingredient[] }) {
  const tete = ingredients.slice(0, VISIBLES)
  const suite = ingredients.slice(VISIBLES)
  const classes = [...new Set(ingredients.map((i) => ingredientClass(i.nom)))].filter((c): c is Exclude<IngredientClass, 'autre'> => c !== 'autre')
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper">
      <ol className="m-0 list-none divide-y divide-line p-0">
        {tete.map((i, n) => <Ligne key={`${n}-${i.nom}`} ingredient={i} rang={n + 1} />)}
      </ol>
      {suite.length > 0 ? (
        <details className="group border-t border-line">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center px-4 text-sm font-semibold text-orange-ink group-open:border-b group-open:border-line">
            <span className="group-open:hidden">{`Voir les ${suite.length} autres ingrédients`}</span>
            <span className="hidden group-open:inline">Replier la liste</span>
          </summary>
          <ol className="m-0 list-none divide-y divide-line p-0">
            {suite.map((i, n) => <Ligne key={`${n}-${i.nom}`} ingredient={i} rang={VISIBLES + n + 1} />)}
          </ol>
        </details>
      ) : null}
      {classes.length > 0 ? <ul role="list" aria-label="Légende" className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 border-t border-line bg-cream px-4 py-2.5 text-xs text-ink-2">
        {classes.map((c) => (
          <li key={c} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2.5 rounded-pill ${POINT[c]}`} />
            {INGREDIENT_CLASS_LABELS[c]}
          </li>
        ))}
      </ul> : null}
    </div>
  )
}
