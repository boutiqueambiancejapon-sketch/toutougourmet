'use client'

import { ProductSearch } from './ProductSearch'

// @cdc lot 6 — bouton principal du scanner, sa réassurance et la saisie à la main. Seul bouton de
// scan du site : les pages de consultation n'ont qu'un lien vers /scanner.

function BarcodeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3M7 8v8M10 8v8M13 8v8M17 8v8" />
    </svg>
  )
}

export function ScanStart({ monthlyLimit, onStart, onManual, onPhoto }: { monthlyLimit: number; onStart: () => void; onManual: () => void; onPhoto: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-card bg-ink p-4 text-cream sm:p-5">
      <button
        type="button"
        onClick={onStart}
        className="inline-flex min-h-14 w-full items-center justify-center gap-3 whitespace-nowrap rounded-control bg-orange px-5 text-lg font-bold text-ink shadow-[0_3px_0_var(--orange-ink)] transition-transform active:translate-y-[3px] active:shadow-none"
      >
        <BarcodeIcon />
        Scanner un paquet
      </button>
      <p className="m-0 text-sm leading-relaxed text-cream/90">{`Code-barres sans compte. Photo de l'étiquette avec un compte gratuit, ${monthlyLimit} par mois.`}</p>
      <button type="button" onClick={onManual} className="min-h-11 text-sm font-semibold text-cream underline underline-offset-2">
        Saisir le code-barres à la main
      </button>
      <ProductSearch onPhoto={onPhoto} />
    </div>
  )
}
