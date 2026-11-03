import type { ScanAnalysis } from '@/lib/scanner/result'
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
}

const pct = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`

export function LabelData({ label, source, headingLevel = 'h3' }: { label: ScanAnalysis['label']; source: AnalysisSource; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const origin = ORIGIN[source]
  const rows = ROWS.filter(([k]) => label.constituants[k] !== null)
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <H className="m-0 font-display text-xl font-black text-ink">Composition lue sur l&apos;étiquette</H>
        {label.ingredients.length > 0 ? (
          <ol className="m-0 flex list-decimal flex-col gap-1 pl-6 text-[15px] leading-relaxed text-ink marker:text-ink-2">
            {label.ingredients.map((i, n) => (
              <li key={`${n}-${i.nom}`}>
                {i.nom}
                {i.pourcentage !== null ? <span className="text-ink-2">{` (${pct(i.pourcentage)})`}</span> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="m-0 text-[15px] text-ink-2">{`Composition absente ${origin}.`}</p>
        )}
      </section>
      <section className="flex flex-col gap-2">
        <H className="m-0 font-display text-xl font-black text-ink">Constituants analytiques</H>
        {rows.length > 0 ? (
          <table className="w-full border-collapse text-[15px]">
            <tbody>
              {rows.map(([k, name]) => (
                <tr key={k} className="border-b border-line">
                  <th scope="row" className="py-2 text-left font-normal text-ink-2">
                    {name}
                  </th>
                  <td className="py-2 text-right font-semibold text-ink">{pct(label.constituants[k] as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="m-0 text-[15px] text-ink-2">{`Constituants absents ${origin}.`}</p>
        )}
      </section>
      {energyText(label.energie) ? <p className="m-0 text-[15px] text-ink">{`Énergie : ${energyText(label.energie)}.`}</p> : null}
      {label.additifs.length > 0 ? (
        <section className="flex flex-col gap-2">
          <H className="m-0 font-display text-xl font-black text-ink">Additifs</H>
          <p className="m-0 text-[15px] leading-relaxed text-ink">{label.additifs.join(', ')}</p>
        </section>
      ) : null}
      {label.illisibles.length > 0 ? (
        <p className="m-0 text-sm text-ink-2">{`Passages illisibles sur les photos : ${label.illisibles.join(' ; ')}.`}</p>
      ) : null}
    </div>
  )
}
