import type { ReactNode } from 'react'
import { highlights } from '@/lib/scanner/highlights'
import { BAND_LABELS, type ScoreResult } from '@/lib/scanner/score'
import { ScoreDetail } from '../ScoreDetail'

// @cdc lot 6 — fiche /croquettes/[slug] : « Les croquettes {Marque} sont-elles bonnes pour ton
// chien ? ». Verdict en une phrase (tranche, points forts et faibles), puis le détail de la note.

const list = (items: string[]) => items.map((s) => s.charAt(0).toLowerCase() + s.slice(1)).join(', ')

export function FicheVerdict({ brand, details, children }: { brand: string | null; details: ScoreResult; children?: ReactNode }) {
  const { strengths, weaknesses } = highlights(details)
  const parts: string[] = []
  if (details.score !== null && details.band) parts.push(`${details.score}/100 : ${BAND_LABELS[details.band].toLowerCase()} pour un chien adulte.`)
  else if (details.notice) parts.push(details.notice)
  if (strengths.length) parts.push(`Points forts : ${list(strengths)}.`)
  if (weaknesses.length) parts.push(`Points faibles : ${list(weaknesses)}.`)
  return (
    <section aria-labelledby="verdict" className="flex flex-col gap-3">
      <h2 id="verdict" className="m-0 font-display text-2xl font-black text-ink">
        {`Les croquettes ${brand ?? 'de cette marque'} sont-elles bonnes pour ton chien ?`}
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">{parts.join(' ')}</p>
      <ScoreDetail details={details} />
      {children}
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        La note juge la composition écrite sur le sac. Un chiot, un chien âgé ou malade a des besoins propres, à voir avec ton
        vétérinaire.
      </p>
    </section>
  )
}
