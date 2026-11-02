'use client'

import Link from 'next/link'
import { track } from '@/lib/analytics'

// @cdc lot 6 — accès à la fiche A4 imprimable, et son bouton d'impression (PDF par le navigateur).

export function DownloadLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/croquettes/${slug}/fiche`}
      onClick={() => track('Scan Download', { step: 'ouverture' })}
      className="inline-flex min-h-12 items-center justify-center rounded-control border-2 border-ink px-5 text-[15px] font-semibold text-ink no-underline"
    >
      Fiche à imprimer
    </Link>
  )
}

export function PrintFicheButton() {
  return (
    <button
      type="button"
      onClick={() => {
        track('Scan Download', { step: 'impression' })
        window.print()
      }}
      className="min-h-12 rounded-control bg-orange px-5 text-[15px] font-semibold text-ink print:hidden"
    >
      Télécharger la fiche (PDF)
    </button>
  )
}
