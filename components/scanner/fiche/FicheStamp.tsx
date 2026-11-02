import { BAND_SHORT } from '@/lib/scanner/highlights'
import type { Band } from '@/lib/scanner/score'

// @cdc lot 6 — note en tampon orange incliné (même motif que MidArticleCta et la fiche story).

export function FicheStamp({ score, band }: { score: number | null; band: Band | null }) {
  return (
    <p
      aria-label={score === null ? 'Pas de note' : `${score} sur 100, ${band ? BAND_SHORT[band] : ''}`}
      className="m-0 flex size-28 shrink-0 rotate-[-8deg] flex-col items-center justify-center rounded-full border-4 border-ink bg-orange text-ink shadow-[4px_4px_0_var(--cream)] print:size-24 print:shadow-none"
    >
      <span className="font-display text-4xl font-black leading-none print:text-3xl">{score ?? '?'}</span>
      <span className="text-xs font-bold leading-tight">{score === null ? 'pas de note' : '/100'}</span>
      {band ? <span className="text-xs font-bold leading-tight">{BAND_SHORT[band]}</span> : null}
    </p>
  )
}
