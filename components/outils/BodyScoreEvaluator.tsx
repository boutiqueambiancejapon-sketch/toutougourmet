'use client'

import { useId, useState } from 'react'
import { track } from '@/lib/analytics'
import { dogSizeRanges, evaluateBodyScore, type Animal, type BodyScore, type BodyScoreResult } from '@/lib/calculators'
import { Segmented } from '@/components/tools/Segmented'
import { NumberField, SubmitButton, ToolCard } from './fields'
import type { NextStep } from './NextSteps'
import { PARTNERS, type Partner } from './partners'
import { ScoreScale } from './ScoreScale'
import { ToolResult } from './ToolResult'
import type { AccountDog } from './useAccountPrefill'

// @cdc outils — poids actuel comparé au poids de forme. Lien partenaire seulement pour un chien
// en surpoids (Dog Chef dose les repas selon le poids visé).

const ANIMALS = [['chien', 'Chien'], ['chat', 'Chat']] as const
const DOG_SIZES = Object.entries(dogSizeRanges).map(([key, v]) => ({ key, kg: v.midKg, label: `${v.label.split(' (')[0]} (${v.minKg} à ${v.maxKg} kg)` }))
const CAT_SIZES = [
  { key: 'petit', kg: 3.5, label: 'Petit (Siamois, Devon Rex), environ 3,5 kg' },
  { key: 'moyen', kg: 4.5, label: 'Moyen (Européen, Bengal), environ 4,5 kg' },
  { key: 'grand', kg: 6.5, label: 'Grand (Maine Coon, Ragdoll), environ 6,5 kg' },
]

function nextSteps(score: BodyScore, animal: Animal, idealKg: number): NextStep[] {
  const ration: NextStep = { href: `/outils/ration?poids=${idealKg}`, label: 'Calculer sa ration à son poids de forme' }
  if (animal === 'chat') return [ration]
  if (score === 'surpoids' || score === 'obese') {
    return [ration, { href: '/chien/alimentation-quotidienne/comment-faire-maigrir-son-chien', label: 'Faire maigrir son chien', sub: 'Le programme semaine par semaine' }]
  }
  if (score === 'maigre' || score === 'sous-poids') {
    return [{ href: '/chien/alimentation-quotidienne/croquettes-chien-trop-maigre', label: 'Quelle croquette pour un chien trop maigre ?' }, ration]
  }
  return [ration, { href: '/fiche-aliments-dangereux', label: 'Les aliments à ne jamais lui donner' }]
}

function partner(score: BodyScore, animal: Animal): Partner | null {
  if (animal !== 'chien' || (score !== 'surpoids' && score !== 'obese')) return null
  return { ...PARTNERS.dogChef, why: 'Pour un chien en surpoids, Dog Chef calcule les portions selon le poids visé et livre les repas déjà dosés.', label: 'Essayer Dog Chef' }
}

/** `dog` : profil du compte. Poids actuel = dernière pesée ; poids de forme = milieu de la fourchette de sa race. */
export function BodyScoreEvaluator({ dog }: { dog?: AccountDog | null }) {
  const currentId = useId()
  const idealId = useId()
  const [animal, setAnimal] = useState<Animal>('chien')
  const [current, setCurrent] = useState(dog?.weightKg ? String(dog.weightKg) : '')
  const [ideal, setIdeal] = useState(dog?.breedMidKg ? String(dog.breedMidKg) : '')
  const [result, setResult] = useState<{ score: BodyScoreResult; idealKg: number } | null>(null)
  const sizes = animal === 'chien' ? DOG_SIZES : CAT_SIZES

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const c = parseFloat(current.replace(',', '.'))
    const i = parseFloat(ideal.replace(',', '.'))
    if (!(c > 0) || !(i > 0)) return
    setResult({ score: evaluateBodyScore(c, i), idealKg: i })
    track('Tool Result', { tool: 'etat-corporel' })
  }

  const r = result?.score
  const gap = r ? `${r.gapPct > 0 ? '+' : ''}${r.gapPct} %` : ''
  return (
    <div className="flex flex-col gap-4">
      <ToolCard label="Évaluer son poids" onSubmit={onSubmit}>
        <Segmented name="animal" legend="Animal" options={ANIMALS} value={animal} onChange={(v) => { setAnimal(v); setIdeal(''); setResult(null) }} />
        <div className="grid grid-cols-2 gap-3">
          <NumberField id={currentId} label="Poids actuel (kg)" value={current} onChange={(v) => { setCurrent(v); setResult(null) }} placeholder="18" min={0.5} max={120} />
          <NumberField id={idealId} label="Poids de forme (kg)" value={ideal} onChange={(v) => { setIdeal(v); setResult(null) }} placeholder="15" min={0.5} max={120} />
        </div>
        <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
          <legend className="mb-1 p-0 text-sm text-ink-2">Tu ne connais pas son poids de forme&nbsp;? Prends un repère&nbsp;:</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={ideal === String(s.kg)}
                onClick={() => { setIdeal(String(s.kg)); setResult(null) }}
                className="min-h-11 rounded-control border border-line bg-paper px-3 text-left text-sm text-ink aria-pressed:border-ink aria-pressed:font-semibold"
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <SubmitButton>Évaluer son poids</SubmitButton>
      </ToolCard>
      <div aria-live="polite">
        {result && r ? (
          <ToolResult
            tool="etat-corporel"
            summary={`${r.label} (${gap} par rapport à ${result.idealKg} kg)`}
            steps={nextSteps(r.score, animal, result.idealKg)}
            partner={partner(r.score, animal)}
          >
            <BigResultScore label={r.label} gap={gap} advice={r.advice} score={r.score} />
          </ToolResult>
        ) : null}
      </div>
    </div>
  )
}

function BigResultScore({ label, gap, advice, score }: { label: string; gap: string; advice: string; score: BodyScore }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 flex flex-wrap items-baseline gap-x-3 text-ink">
        <span className="font-display text-4xl font-black leading-none tracking-tight">{label}</span>
        <span className="text-lg">{gap} par rapport à son poids de forme</span>
      </p>
      <ScoreScale score={score} />
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {advice} Ce repère ne remplace pas la palpation des côtes par ton vétérinaire.
      </p>
    </div>
  )
}
