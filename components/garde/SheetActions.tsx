'use client'

import { useState } from 'react'
import { IconDownload, IconShare } from '@/components/icons'
import { btnOutline, btnOutlineBlock, btnPrimary } from '@/components/compte/espace/ui'

// @cdc fiche de garde — côté propriétaire : « Envoyer le lien » (feuille de partage du téléphone :
// WhatsApp, SMS, e-mail ; sinon copie du lien), PDF d'une page, aperçu de la page du gardien.

interface SheetActionsProps {
  token: string
  name: string
}

export function SheetActions({ token, name }: SheetActionsProps) {
  const [copied, setCopied] = useState(false)
  const path = `/garde/${token}`

  async function share() {
    const url = `${window.location.origin}${path}`
    const text = `Fiche de garde de ${name} : repas, interdits et numéros utiles`
    try {
      if (navigator.share) {
        await navigator.share({ title: `Fiche de garde de ${name}`, text, url })
        return
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt('Copie le lien de la fiche :', url)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
        <button type="button" onClick={share} className={btnPrimary}>
          <IconShare className="size-5" />
          <span aria-live="polite">{copied ? 'Lien copié' : 'Envoyer le lien'}</span>
        </button>
        <a href={`${path}/fiche.pdf`} className={btnOutline}>
          <IconDownload className="size-5" />
          PDF
        </a>
      </div>
      <a href={path} target="_blank" rel="noopener noreferrer" className={btnOutlineBlock}>
        Voir ce qu&apos;il reçoit
      </a>
    </div>
  )
}

export function DeleteSheetButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm('Supprimer cette fiche ? Le lien cessera de fonctionner tout de suite.')) e.preventDefault()
      }}
      className="border-t border-line pt-4"
    >
      <button type="submit" className="min-h-11 text-[15px] font-semibold text-orange-ink underline underline-offset-2">
        Supprimer la fiche
      </button>
    </form>
  )
}
