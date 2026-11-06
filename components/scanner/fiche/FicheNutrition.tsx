import Link from 'next/link'
import { dryMatterBasis } from '@/lib/scanner/score'
import type { ExtractedLabel } from '@/lib/scanner/types'

// @cdc lot 6 — fiche /croquettes/[slug] : « Combien de protéines et de glucides ? ». Valeurs
// telles quelles et sur matière sèche, du même calcul que la note (dryMatterBasis).

const fmt = (n: number | null) => (n === null ? 'non indiqué' : `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`)

export function FicheNutrition({ label }: { label: ExtractedLabel }) {
  const a = label.constituants
  const basis = dryMatterBasis(a, label.typeAliment)
  const rows: [string, number | null, number | null][] = [
    ['Protéines', a.proteines, basis.protDm],
    ['Matières grasses', a.matieresGrasses, basis.fatDm],
    ['Glucides estimés', basis.carbsAsFed === null ? null : Math.round(basis.carbsAsFed * 10) / 10, basis.carbsDm],
  ]
  const prot = basis.protDm
  const carbs = basis.carbsDm
  const lead =
    prot === null
      ? "L'étiquette lue ne permet pas de ramener les protéines sur matière sèche : il manque le taux de protéines ou l'humidité."
      : `${fmt(prot)} de protéines une fois l'eau retirée, ${prot >= 18 ? 'au-dessus' : 'en dessous'} du minimum de 18 % pour un chien adulte${carbs === null ? '.' : `, et environ ${fmt(carbs)} de glucides sur matière sèche.`}`
  return (
    <section aria-labelledby="proteines-glucides" className="flex flex-col gap-3">
      <h2 id="proteines-glucides" className="m-0 font-display text-2xl font-black text-ink">
        Combien de protéines et de glucides&nbsp;?
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">{lead}</p>
      <table className="w-full border-collapse text-[15px]">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th scope="col" className="py-2 pr-2 font-semibold text-ink">Constituant</th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold text-ink">Étiquette</th>
            <th scope="col" className="py-2 text-right font-semibold text-ink">Sans l&apos;eau</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, asFed, dm]) => (
            <tr key={name} className="border-b border-line">
              <th scope="row" className="py-2.5 pr-2 text-left font-normal text-ink-2">{name}</th>
              <td className="py-2 pr-2 text-right text-ink">{fmt(asFed)}</td>
              <td className="py-2 text-right font-semibold text-ink">{fmt(dm)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        {basis.assumedMoisture ? `Humidité non indiquée : ${basis.moisture} % retenus. ` : ''}
        Glucides calculés par différence (100 moins les autres constituants), comme dans le{' '}
        <Link href="/scanner#glucides" className="font-semibold text-orange-ink underline underline-offset-2">
          calculateur de glucides
        </Link>
        .
      </p>
    </section>
  )
}
