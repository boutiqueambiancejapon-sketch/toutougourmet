import { bandFor, type Band } from '@/lib/scanner/score'

// @cdc lot 6 — pastille de note, couleur selon la tranche (≥ 75, 55-74, 35-54, < 35).
export const BAND_CLASSES: Record<Band, string> = {
  'tres-bon': 'bg-green-bg text-green-ink',
  correct: 'bg-blue-bg text-blue-ink',
  moyen: 'bg-amber-bg text-amber-ink',
  faible: 'bg-rose-bg text-rose-ink',
}

export function ScoreBadge({ score, size = 'sm' }: { score: number | null; size?: 'sm' | 'lg' }) {
  const box = size === 'lg' ? 'size-20 text-3xl' : 'size-11 text-base'
  if (score === null) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center rounded-pill bg-cream-2 font-display font-black text-ink-2 ${box}`} aria-label="Pas de note">
        ?
      </span>
    )
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-pill font-display font-black ${BAND_CLASSES[bandFor(score)]} ${box}`}
      aria-label={`${score} sur 100`}
    >
      {score}
    </span>
  )
}
