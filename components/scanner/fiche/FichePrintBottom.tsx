import Link from 'next/link'
import type { ScoreResult } from '@/lib/scanner/score'
import { TreatAllowance } from '../treat/TreatAllowance'

// @cdc lot 6 — bas de la fiche imprimable : matière sèche et ration pour un aliment complet,
// nombre de friandises par jour pour une friandise.

const pct = (n: number | null) => (n === null ? 'non calculé' : `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`)

export function FichePrintBottom({ details, these }: { details: ScoreResult; these: string }) {
  if (details.treat)
    return (
      <div className="rounded-card border border-line bg-paper p-4 print:break-inside-avoid print:p-3">
        <TreatAllowance allowance={details.treat.allowance} headingLevel="h2" />
      </div>
    )
  const dm = details.dryMatter
  return (
    <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
      <section className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4 print:break-inside-avoid print:p-3">
        <h2 className="m-0 font-display text-lg font-black text-ink print:text-[14px]">Sur matière sèche</h2>
        <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[15px] print:text-[11px]">
          <dt className="text-ink-2">Protéines</dt>
          <dd className="m-0 text-right font-semibold text-ink">{pct(dm?.proteines ?? null)}</dd>
          <dt className="text-ink-2">Matières grasses</dt>
          <dd className="m-0 text-right font-semibold text-ink">{pct(dm?.matieresGrasses ?? null)}</dd>
          <dt className="text-ink-2">Glucides estimés</dt>
          <dd className="m-0 text-right font-semibold text-ink">{pct(dm?.glucides ?? null)}</dd>
        </dl>
        <p className="m-0 text-xs text-ink-2 print:text-[9px]">{details.assumptions[0] ?? 'Valeurs de l\'étiquette, eau retirée.'}</p>
      </section>
      <section className="flex flex-col gap-2 rounded-card bg-amber-bg p-4 print:break-inside-avoid print:p-3">
        <h2 className="m-0 font-display text-lg font-black text-ink print:text-[14px]">Combien lui en donner ?</h2>
        <p className="m-0 text-[15px] leading-snug text-ink-2 print:text-[11px]">
          La ration dépend du poids, de l&apos;âge, de l&apos;activité et de l&apos;énergie de {these}. Calcule-la en
          grammes par jour : toutou-gourmet.com/outils/ration
        </p>
        <Link href="/outils/ration" className="text-[15px] font-semibold text-orange-ink underline underline-offset-2 print:hidden">
          Calculer sa ration
        </Link>
      </section>
    </div>
  )
}
