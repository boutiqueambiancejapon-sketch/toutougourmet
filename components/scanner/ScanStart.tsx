'use client'

// @cdc lot 6 — bouton principal du scanner et sa réassurance. Le bouton répété en bas de page
// (ScanAgainButton) remonte au parcours et ouvre la caméra par un événement de fenêtre.

export const START_EVENT = 'tg-scan-start'

function BarcodeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3M7 8v8M10 8v8M13 8v8M17 8v8" />
    </svg>
  )
}

const big =
  'inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-control bg-orange px-6 text-lg font-bold text-ink shadow-[5px_5px_0_var(--ink)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_var(--ink)] sm:w-auto'

export function ScanStart({ monthlyLimit, onStart }: { monthlyLimit: number; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={onStart} className={big}>
        <BarcodeIcon />
        Scanner le code-barres
      </button>
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        {`Sans compte si le produit est déjà connu. Pour un produit inconnu, l'analyse par photo demande un compte gratuit (${monthlyLimit} par mois). Ta photo n'est jamais enregistrée.`}
      </p>
    </div>
  )
}

export function ScanAgainButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(START_EVENT))} className={big}>
      <BarcodeIcon />
      Scanner le sac
    </button>
  )
}
