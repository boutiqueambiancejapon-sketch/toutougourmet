import type { ScanAnalysis } from '@/lib/scanner/result'
import { IngredientList } from './IngredientList'
import type { AnalyticalKey } from '@/lib/scanner/types'
import type { AnalysisSource } from '@/db/schema'

// @cdc lot 6 — ce que l'IA a lu sur l'étiquette : composition dans l'ordre, constituants
// analytiques tels quels, additifs. Sans état, utilisable côté serveur comme côté client.

const ROWS: [AnalyticalKey, string][] = [
  ['proteines', 'Protéines'],
  ['matieresGrasses', 'Matières grasses'],
  ['cellulose', 'Cellulose brute'],
  ['cendres', 'Cendres brutes'],
  ['humidite', 'Humidité'],
  ['calcium', 'Calcium'],
  ['phosphore', 'Phosphore'],
]

const num = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })

/** Énergie écrite sur l'étiquette (friandises surtout), dans ses unités d'origine. */
function energyText(e: ScanAnalysis['label']['energie']): string | null {
  if (!e) return null
  const parts = [
    e.kcalKg !== null ? `${num(e.kcalKg)} kcal/kg` : null,
    e.kcal100g !== null ? `${num(e.kcal100g)} kcal/100 g` : null,
    e.kcalPiece !== null ? `${num(e.kcalPiece)} kcal par pièce` : null,
    e.poidsPieceG !== null ? `pièce de ${num(e.poidsPieceG)} g` : null,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

/** D'où vient ce qui est affiché : une fiche des bases ouvertes n'a pas de photos. */
const ORIGIN: Record<AnalysisSource, string> = {
  photo: "de l'étiquette lue",
  openpetfoodfacts: 'de la fiche Open Pet Food Facts',
  openfoodfacts: 'de la fiche Open Food Facts',
  maxizoo: 'de la fiche produit Maxi Zoo',
  marque: 'du site officiel de la marque',
}

const pct = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`

export function LabelData({ label, source, headingLevel = 'h3' }: { label: ScanAnalysis['label']; source: AnalysisSource; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const origin = ORIGIN[source]
  const rows = ROWS.filter(([k]) => label.constituants[k] !== null)
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <H className="m-0 font-display text-xl font-black text-ink">Composition</H>
        {label.ingredients.length > 0 ? (
          <IngredientList ingredients={label.ingredients} />
        ) : (
          <p className="m-0 text-[15px] text-ink-2">{`Composition absente ${origin}.`}</p>
        )}
      </section>
      <section className="flex flex-col gap-2">
        <H className="m-0 font-display text-xl font-black text-ink">Constituants analytiques</H>
        {rows.length > 0 ? (
          <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {rows.map(([k, name]) => (
              <div key={k} className="flex flex-col-reverse gap-0.5 rounded-box border border-line bg-paper px-3 py-2.5">
                <dt className="text-[13px] leading-snug text-ink-2">{name}</dt>
                <dd className="m-0 font-display text-xl font-black tabular-nums text-ink">{pct(label.constituants[k] as number)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="m-0 text-[15px] text-ink-2">{`Constituants absents ${origin}.`}</p>
        )}
      </section>
      {energyText(label.energie) ? <p className="m-0 text-[15px] text-ink">{`Énergie : ${energyText(label.energie)}.`}</p> : null}
      {label.additifs.length > 0 ? (
        <section className="flex flex-col gap-2">
          <H className="m-0 font-display text-xl font-black text-ink">Additifs</H>
          <ul role="list" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {label.additifs.map((a) => <li key={a} className="rounded-pill border border-line bg-paper px-2.5 py-1 text-sm leading-tight text-ink">{a}</li>)}
          </ul>
        </section>
      ) : null}
      {label.illisibles.length > 0 ? (
        <p className="m-0 text-sm text-ink-2">{`Passages illisibles sur les photos : ${label.illisibles.join(' ; ')}.`}</p>
      ) : null}
    </div>
  )
}
