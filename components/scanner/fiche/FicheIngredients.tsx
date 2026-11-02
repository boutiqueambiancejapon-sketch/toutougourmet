import { INGREDIENT_CLASS_LABELS, ingredientClass, type IngredientClass } from '@/lib/scanner/ingredient-class'
import type { ExtractedLabel } from '@/lib/scanner/types'

// @cdc lot 6 — fiche A4 : composition dans l'ordre de l'étiquette, chaque ingrédient coloré
// selon sa catégorie (mêmes règles que la note), avec la légende.

const CLASS_STYLE: Record<IngredientClass, string> = {
  nommee: 'bg-green-bg text-green-ink border-green-ink/30',
  'non-nommee': 'bg-amber-bg text-amber-ink border-amber-ink/30',
  cereale: 'bg-cream-2 text-ink-2 border-line-2',
  controverse: 'bg-rose-bg text-rose-ink border-rose-ink/30',
  autre: 'bg-paper text-ink border-line',
}

const pct = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`

export function FicheIngredients({ label }: { label: ExtractedLabel }) {
  const items = [...label.ingredients.map((i) => ({ text: i.pourcentage !== null ? `${i.nom} (${pct(i.pourcentage)})` : i.nom, cls: ingredientClass(i.nom) }))]
  const additives = label.additifs.map((a) => ({ text: a, cls: ingredientClass(a) })).filter((a) => a.cls === 'controverse')
  return (
    <section className="flex flex-col gap-2 print:break-inside-avoid">
      <h2 className="m-0 font-display text-xl font-black text-ink print:text-[16px]">Composition, ingrédient par ingrédient</h2>
      {items.length === 0 ? (
        <p className="m-0 text-[15px] text-ink-2">Composition absente de la lecture.</p>
      ) : (
        <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {[...items, ...additives].map((i, n) => (
            <li key={`${n}-${i.text}`} className={`rounded-pill border px-2.5 py-1 text-sm leading-tight print:px-2 print:py-0.5 print:text-[10px] ${CLASS_STYLE[i.cls]}`}>
              {i.text}
            </li>
          ))}
        </ol>
      )}
      <ul role="list" aria-label="Légende" className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-ink-2 print:text-[9px]">
        {(Object.keys(INGREDIENT_CLASS_LABELS) as (keyof typeof INGREDIENT_CLASS_LABELS)[]).map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`inline-block size-3 rounded-pill border ${CLASS_STYLE[k]}`} />
            {INGREDIENT_CLASS_LABELS[k]}
          </li>
        ))}
      </ul>
    </section>
  )
}
