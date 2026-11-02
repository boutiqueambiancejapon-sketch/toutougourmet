'use client'

import type { ReactNode } from 'react'

// @cdc lot 6 — bouton d'envoi qui demande confirmation (suppression d'une fiche).

export function ConfirmSubmit({ message, children }: { message: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
      className="min-h-11 rounded-control border-2 border-rose-ink px-5 font-semibold text-rose-ink hover:underline"
    >
      {children}
    </button>
  )
}
