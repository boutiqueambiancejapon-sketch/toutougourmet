'use client'

import { IconDownload } from '@/components/icons'
import { track } from '@/lib/analytics'

// @cdc lot 6 — téléchargement direct de la fiche en PDF d'une page A4 (route fiche.pdf), en un
// geste, sans passer par l'impression du navigateur. Libellé court sous 24rem (écrans étroits,
// texte agrandi) : le bouton reste sur une ligne à côté de « Partager ».

const base = 'inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 text-[15px] font-semibold no-underline'

export function DownloadLink({ slug, primary = false, className = '' }: { slug: string; primary?: boolean; className?: string }) {
  return (
    <a
      href={`/croquettes/${slug}/fiche.pdf`}
      download={`toutou-gourmet-${slug}.pdf`}
      onClick={() => track('Scan Download', { step: 'pdf' })}
      className={`${base} ${primary ? 'bg-orange text-ink' : 'border-2 border-ink text-ink'} ${className}`}
    >
      <IconDownload className="size-5" />
      <span className="min-[24rem]:hidden">PDF</span>
      <span className="hidden min-[24rem]:inline">Télécharger le PDF</span>
    </a>
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
      className="min-h-12 whitespace-nowrap rounded-control px-2 text-[15px] font-semibold text-ink underline underline-offset-2 print:hidden"
    >
      Imprimer
    </button>
  )
}
