'use client'

import { StickyBar, STICKY_BUTTON } from './StickyBar'

// @cdc 04-pages — bandeau collant à deux marques : sur mobile, deux boutons côte à côte sur une
// seule ligne ; l'accroche et la preuve n'apparaissent qu'à partir de md.
interface CtaBrand {
  label: string
  href: string
}

interface StickyCtaDoubleProps {
  brandA: CtaBrand
  brandB: CtaBrand
  eyebrow?: string
  /** Ligne sous l'accroche — affichée uniquement en lg+ pour ne pas surcharger */
  subProof?: string
}

export function StickyCtaDouble({ brandA, brandB, eyebrow, subProof }: StickyCtaDoubleProps) {
  return (
    <StickyBar>
      {eyebrow || subProof ? (
        <div className="hidden min-w-0 flex-1 md:block">
          {eyebrow ? <p className="m-0 truncate text-sm font-semibold leading-snug text-cream">{eyebrow}</p> : null}
          {subProof ? <p className="m-0 mt-0.5 hidden truncate text-xs leading-snug text-cream/70 lg:block">{subProof}</p> : null}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 gap-2 md:flex-none">
        <a href={brandA.href} target="_blank" rel="noopener noreferrer sponsored" className={`${STICKY_BUTTON} min-w-0 flex-1 md:flex-none`}>
          <span className="truncate">{brandA.label}</span>
        </a>
        <a
          href={brandB.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-control border border-cream/40 px-3.5 text-sm font-semibold text-cream no-underline hover:border-cream md:flex-none md:px-4"
        >
          <span className="truncate">{brandB.label}</span>
        </a>
      </div>
    </StickyBar>
  )
}
