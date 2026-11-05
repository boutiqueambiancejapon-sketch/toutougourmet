import { BAND_LABELS, type ScoreResult, isPartial } from '@/lib/scanner/score'
import { SafetyAlerts } from './SafetyAlerts'
import { ScoreBadge } from './ScoreBadge'
import { KindTag } from './treat/KindTag'
import { TreatAlerts } from './treat/TreatAlerts'
import { TreatAllowance } from './treat/TreatAllowance'

// @cdc lot 6 — note sur 100 et détail critère par critère, avec ce qui manque sur l'étiquette.
// Sans état : rendu serveur (fiche, exemple de /scanner) ou dans le résultat du scanner.
// Friandise : pastille « Friandise », alertes de sécurité (sauf si la page les montre déjà en
// tête : alerts={false}) et nombre de friandises par jour sous le détail.

interface ScoreDetailProps {
  details: ScoreResult
  headingLevel?: 'h2' | 'h3'
  alerts?: boolean
}

export function ScoreDetail({ details, headingLevel = 'h3', alerts = true }: ScoreDetailProps) {
  const H = headingLevel
  const { score, band } = details
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <ScoreBadge score={score} size="lg" />
        <div className="flex flex-col items-start gap-1">
          <p className="m-0 font-display text-2xl font-black leading-tight text-ink">
            {score === null ? 'Pas de note' : `${score}/100`}
          </p>
          <p className="m-0 text-[15px] text-ink-2">{band ? `${BAND_LABELS[band]}${isPartial(details) ? ', note partielle' : ''}` : details.notice}</p>
          <KindTag details={details} />
        </div>
      </div>
      {alerts && details.alertes ? <SafetyAlerts alerts={details.alertes} /> : null}
      {alerts && details.treat && !details.alertes ? <TreatAlerts alerts={details.treat.alerts} /> : null}
      {details.missing.length > 0 ? (
        <p className="m-0 rounded-box bg-amber-bg p-3 text-[15px] leading-relaxed text-amber-ink">
          {`Absent de l'étiquette ou illisible : ${details.missing.join(', ')}.`}
          {score !== null ? ' La note porte sur les critères évalués.' : ' Reprends une photo nette de cette partie pour obtenir une note.'}
        </p>
      ) : null}
      {details.assumptions.map((a) => (
        <p key={a} className="m-0 text-sm leading-relaxed text-ink-2">
          {a}
        </p>
      ))}
      {details.bareme && details.criteria.length === 0 ? null : (
        <section className="flex flex-col gap-2">
          <H className="m-0 font-display text-xl font-black text-ink">Le détail de la note</H>
          <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
            {details.criteria.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 py-3">
                <p className="m-0 flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-ink">{c.label}</span>
                  <span className={`shrink-0 text-sm font-semibold ${c.points === null ? 'text-ink-2' : 'text-ink'}`}>
                    {c.points === null ? 'non évalué' : `${c.points} / ${c.max}`}
                  </span>
                </p>
                <p className="m-0 text-[15px] leading-relaxed text-ink-2">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {details.treat ? <TreatAllowance allowance={details.treat.allowance} headingLevel={H} /> : null}
    </div>
  )
}
