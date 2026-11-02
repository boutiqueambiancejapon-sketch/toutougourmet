'use client'

// Bouton d'impression de la fiche (masqué à l'impression).
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-11 rounded-control bg-orange px-5 text-[15px] font-semibold text-ink print:hidden"
    >
      Imprimer la fiche
    </button>
  )
}
