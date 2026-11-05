import Link from 'next/link'
import type { TreatInfo } from '@/lib/scanner/score'
import { allowanceText, TREAT_SHARE } from '@/lib/scanner/treat-allowance'

// @cdc lot 6 — « Combien de friandises par jour ? » : plafond de 10 % de l'apport calorique du
// jour (repère WSAVA), par gabarit, besoin calculé comme dans /outils/ration (NRC 2006). Sans énergie
// sur l'étiquette : la phrase le dit, sans chiffre.

const kcal = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kcal`

export function TreatAllowance({ allowance, headingLevel = 'h3' }: { allowance: TreatInfo['allowance']; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const share = `${Math.round(TREAT_SHARE * 100)} %`
  return (
    <section className="flex flex-col gap-2">
      <H className="m-0 font-display text-xl font-black text-ink">Combien de friandises par jour ?</H>
      {allowance === null ? (
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          {`Calories non indiquées sur l'étiquette : impossible de dire combien en donner. Repère courant des vétérinaires : les friandises ne dépassent pas ${share} de l'apport calorique du jour.`}
        </p>
      ) : (
        <>
          <p className="m-0 text-[15px] leading-relaxed text-ink-2">
            {`${allowance.kcalPiece !== null ? `${kcal(allowance.kcalPiece)} par friandise` : `${kcal(allowance.kcal100g ?? 0)} pour 100 g, poids d'une pièce non indiqué`}. Au plus ${share} de l'apport calorique du jour (repère courant des vétérinaires), pour un chien adulte d'activité normale :`}
          </p>
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th scope="col" className="py-2 pr-2 font-semibold text-ink">Gabarit</th>
                <th scope="col" className="py-2 pr-2 text-right font-semibold text-ink">Besoin du jour</th>
                <th scope="col" className="py-2 text-right font-semibold text-ink">Par jour, au plus</th>
              </tr>
            </thead>
            <tbody>
              {allowance.rows.map((r) => (
                <tr key={r.size} className="border-b border-line">
                  <th scope="row" className="py-2 pr-2 text-left font-normal text-ink-2">{`${r.label} (${r.weightKg} kg)`}</th>
                  <td className="py-2 pr-2 text-right text-ink">{kcal(r.dailyKcal)}</td>
                  <td className="py-2 text-right font-semibold text-ink">{allowanceText(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="m-0 text-sm leading-relaxed text-ink-2">
            Les autres extras du jour comptent dans la même limite. Pour le besoin exact de ton chien, passe par le{' '}
            <Link href="/outils/ration" className="font-semibold text-orange-ink underline underline-offset-2">
              calculateur de ration
            </Link>
            .
          </p>
        </>
      )}
    </section>
  )
}
