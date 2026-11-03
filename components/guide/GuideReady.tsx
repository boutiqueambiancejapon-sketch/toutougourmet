'use client'

import { track } from '@/lib/analytics'
import { IconCheck, IconDownload } from '@/components/icons'
import { GUIDE_PDF_PATH, type GuidePlace } from '@/lib/guide/config'
import { BUTTON_CLASS } from './GuideForm'

// @cdc guide — écran « Ton guide est prêt » (maquette validée) : lien direct vers le PDF,
// téléchargement mesuré (Guide Download + place). L'e-mail part en parallèle côté serveur.

export function GuideDownloadLink({ place }: { place: GuidePlace }) {
  return (
    <a
      href={GUIDE_PDF_PATH}
      download
      onClick={() => track('Guide Download', { place })}
      className={`${BUTTON_CLASS} bg-ink text-cream hover:brightness-110`}
    >
      <IconDownload className="size-5" />
      Télécharger le PDF
    </a>
  )
}

export function GuideReady({ place }: { place: GuidePlace }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 rounded-card bg-green-bg p-4 text-center">
      <IconCheck className="size-9 text-green-ink" />
      <p className="m-0 font-display text-[1.4rem] font-black leading-tight text-ink">Ton guide est prêt</p>
      <p className="m-0 mb-2 text-[15px] text-ink-2">On te l&apos;envoie aussi par e-mail, pour le retrouver plus tard.</p>
      <GuideDownloadLink place={place} />
    </div>
  )
}
