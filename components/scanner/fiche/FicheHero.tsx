import type { ReactNode } from 'react'
import type { BuyLink } from '@/lib/scanner/buy-link'
import { BAND_LABELS, bandFor, type ScoreResult } from '@/lib/scanner/score'
import { titleTypo } from '@/lib/title-typo'
import { ProductPhoto } from '../ProductPhoto'
import { BAND_CLASSES } from '../ScoreBadge'
import { KindTag } from '../treat/KindTag'
import { FIABILITE_LABEL } from './FicheFiabilite'

// @cdc scanner — haut de fiche : photo, note en anneau, verdict en un mot et bouton d'achat, visibles sans défiler.

const ANNEAU: Record<ReturnType<typeof bandFor>, string> = {
  'tres-bon': 'text-green-ink',
  correct: 'text-blue-ink',
  moyen: 'text-amber-ink',
  faible: 'text-rose-ink',
}
const RAYON = 44
const TOUR = 2 * Math.PI * RAYON

function NoteAnneau({ score }: { score: number | null }) {
  const couleur = score === null ? 'text-line-2' : ANNEAU[bandFor(score)]
  return (
    <div className="relative size-28 shrink-0" role="img" aria-label={score === null ? 'Pas de note' : `${score} sur 100`}>
      <svg viewBox="0 0 100 100" className={`size-full -rotate-90 ${couleur}`} aria-hidden="true">
        <circle cx="50" cy="50" r={RAYON} fill="none" strokeWidth="9" className="stroke-cream-2" />
        <circle cx="50" cy="50" r={RAYON} fill="none" strokeWidth="9" strokeLinecap="round" stroke="currentColor" strokeDasharray={TOUR} strokeDashoffset={TOUR * (1 - (score ?? 0) / 100)} />
      </svg>
      <p className="absolute inset-0 m-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-4xl font-black text-ink">{score ?? '?'}</span>
        <span className="mt-0.5 text-xs font-semibold text-ink-2">sur 100</span>
      </p>
    </div>
  )
}

interface FicheHeroProps {
  h1: string
  image: string | null
  details: ScoreResult
  categorie: string | null
  buy: BuyLink | null
  children?: ReactNode
}

export function FicheHero({ h1, image, details, categorie, buy, children }: FicheHeroProps) {
  const { score } = details
  const fiabilite = details.bareme?.simple ? undefined : details.bareme?.fiabilite
  return (
    <header className="flex flex-col gap-4">
      <h1 className="m-0 font-display text-[clamp(1.85rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">{titleTypo(h1)}</h1>
      <div className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <ProductPhoto src={image} size="xl" />
          <NoteAnneau score={score} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {score !== null ? <span className={`rounded-pill px-3 py-1 text-sm font-bold ${BAND_CLASSES[bandFor(score)]}`}>{BAND_LABELS[bandFor(score)]}</span> : null}
          {fiabilite ? <span className="rounded-pill border border-line px-3 py-1 text-sm text-ink-2">{FIABILITE_LABEL[fiabilite]}</span> : null}
          <KindTag details={details} />
        </div>
        {categorie ? <p className="m-0 text-sm text-ink-2">{`Note calculée sur l'étiquette, à comparer ${categorie}.`}</p> : null}
        {buy ? (
          <a href={buy.href} rel="sponsored nofollow noopener" target="_blank" data-cta="fiche-achat-haut" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-control bg-orange px-5 font-semibold text-ink no-underline hover:underline">
            {`Voir chez ${buy.store}`}
          </a>
        ) : null}
        {children}
      </div>
    </header>
  )
}
