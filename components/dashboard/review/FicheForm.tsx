import type { FoodAnalysis } from '@/db/schema'
import { analyticalValue, ingredientsToText } from '@/lib/scanner/review-form'
import type { AnalyticalKey } from '@/lib/scanner/types'

// @cdc lot 6 — formulaire de relecture d'une fiche (rendu serveur, action serveur liée à l'id).
// « Enregistrer » corrige sans publier ; « Valider » corrige et rend la fiche indexable.

const FIELDS: [AnalyticalKey, string][] = [
  ['proteines', 'Protéines'],
  ['matieresGrasses', 'Matières grasses'],
  ['cellulose', 'Cellulose brute'],
  ['cendres', 'Cendres brutes'],
  ['humidite', 'Humidité'],
  ['calcium', 'Calcium'],
  ['phosphore', 'Phosphore'],
]

const input = 'min-h-11 w-full rounded-control border-2 border-ink bg-paper px-3 text-base text-ink outline-none focus-visible:ring-4 focus-visible:ring-amber'
const area = 'w-full rounded-control border-2 border-ink bg-paper p-3 font-mono text-sm leading-relaxed text-ink outline-none focus-visible:ring-4 focus-visible:ring-amber'
const label = 'flex flex-col gap-1.5 text-sm font-semibold text-ink'

export function FicheForm({ row, action }: { row: FoodAnalysis; action: (form: FormData) => Promise<void> }) {
  const l = row.extracted
  return (
    <form action={action} className="flex flex-col gap-5 rounded-card border border-line bg-paper p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={label}>
          Marque
          <input name="marque" defaultValue={l.marque ?? ''} maxLength={80} className={input} />
        </label>
        <label className={label}>
          Produit
          <input name="produit" defaultValue={l.produit ?? ''} maxLength={160} className={input} />
        </label>
      </div>
      <label className={label}>
        <span>
          Composition <span className="font-normal text-ink-2">(un ingrédient par ligne, pourcentage entre parenthèses)</span>
        </span>
        <textarea name="ingredients" defaultValue={ingredientsToText(l)} rows={12} className={area} />
      </label>
      <label className={label}>
        <span>
          Additifs <span className="font-normal text-ink-2">(un par ligne)</span>
        </span>
        <textarea name="additifs" defaultValue={l.additifs.join('\n')} rows={5} className={area} />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-ink">Constituants analytiques (% du produit tel quel, vide si absent)</legend>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {FIELDS.map(([k, name]) => (
            <label key={k} className="flex flex-col gap-1 text-sm text-ink-2">
              {name}
              <input name={k} defaultValue={analyticalValue(l, k)} inputMode="decimal" className={input} />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button type="submit" name="intent" value="validate" className="min-h-11 rounded-control bg-ink px-5 font-semibold text-cream hover:underline">
          {row.reviewed ? 'Enregistrer (reste publiée)' : 'Valider et publier'}
        </button>
        {!row.reviewed && (
          <button type="submit" name="intent" value="save" className="min-h-11 rounded-control border-2 border-ink px-5 font-semibold text-ink hover:underline">
            Enregistrer sans publier
          </button>
        )}
        {row.reviewed && (
          <button type="submit" name="intent" value="unpublish" className="min-h-11 rounded-control border-2 border-ink px-5 font-semibold text-ink hover:underline">
            Retirer de l&apos;index
          </button>
        )}
      </div>
    </form>
  )
}
