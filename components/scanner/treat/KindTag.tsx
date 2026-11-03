import { IconBone } from '@/components/icons'
import { kindOf, type ScoreResult } from '@/lib/scanner/score'

// @cdc lot 6 — pastille « Friandise » à côté de la note : la note vient du barème friandise,
// elle ne se compare pas à celle d'un aliment complet. Rien pour un aliment complet.

export function KindTag({ details }: { details: Pick<ScoreResult, 'kind'> }) {
  if (kindOf(details) !== 'treat') return null
  return (
    <span className="inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-pill bg-amber-bg px-3 text-sm font-semibold text-amber-ink">
      <IconBone className="size-4" />
      Friandise
    </span>
  )
}
