import { computeBilan, getActiveTips, getVerdict, recommend, type BilanAnswers } from '@/data/bien-nourri'
import { BigResult } from './fields'
import type { NextStep } from './NextSteps'
import type { Partner } from './partners'
import { ToolResult } from './ToolResult'

// Résultat du bilan « bien nourri » : score, verdict, conseils déclenchés par les réponses,
// puis la recommandation de data/bien-nourri.ts › recommend() (lien partenaire seulement
// quand le profil le justifie, sinon le comparateur en suite logique).

function steps(answers: BilanAnswers, internalReco: NextStep | null): NextStep[] {
  const list: NextStep[] = []
  if (internalReco) list.push(internalReco)
  const body = answers.etat_corporel
  if (body === 'surpoids' || body === 'obese' || body === 'maigre') {
    list.push({ href: '/outils/poids', label: 'Vérifier son poids de forme', sub: 'Et de combien ajuster sa ration' })
  }
  list.push({ href: '/outils/ration', label: 'Combien de grammes par jour ?', sub: 'Le chiffre à peser pour son poids' })
  return list.slice(0, 2)
}

export function BienNourriResult({ answers, onRestart }: { answers: BilanAnswers; onRestart: () => void }) {
  const scores = computeBilan(answers)
  const verdict = getVerdict(scores.normalized)
  const reco = recommend(scores)
  const tips = getActiveTips(answers, scores)
  const external = reco.url.startsWith('http')
  const partner: Partner | null = external
    ? { brand: reco.primary, href: reco.url, offer: reco.offer ?? '', why: reco.rationale, label: reco.buttonLabel }
    : null
  const internal: NextStep | null = external ? null : { href: reco.url, label: reco.buttonLabel, sub: reco.rationale }

  return (
    <div className="flex flex-col gap-4">
      <ToolResult tool="bien-nourri" summary={`${scores.normalized}/100, ${verdict.label}`} steps={steps(answers, internal)} partner={partner}>
        <BigResult value={`${scores.normalized}/100`} unit={verdict.label}>
          <p>{verdict.summary}</p>
        </BigResult>
        {tips.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="m-0 font-display text-xl font-black text-ink">
              {tips.length > 1 ? `${tips.length} choses à changer` : 'Une chose à changer'}
            </h3>
            <ol className="m-0 flex list-decimal flex-col gap-3 pl-5 marker:font-semibold marker:text-ink">
              {tips.map((tip) => (
                <li key={tip.title} className="pl-1">
                  <p className="m-0 font-semibold text-ink">{tip.title}</p>
                  <p className="m-0 text-[15px] leading-relaxed text-ink-2">{tip.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </ToolResult>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onRestart} className="min-h-11 text-[15px] font-semibold text-ink underline underline-offset-2">
          Refaire le bilan
        </button>
        <p className="m-0 text-sm text-ink-2">Ce bilan ne remplace pas l&apos;avis de ton vétérinaire.</p>
      </div>
    </div>
  )
}
