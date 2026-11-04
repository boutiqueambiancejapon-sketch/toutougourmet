'use client'

import { useId, useState } from 'react'
import { decodeFile, normalizeCode } from '@/lib/scanner/barcode-client'

// @cdc lot 6 — secours de la caméra : saisie des chiffres du code-barres, ou lecture du code
// sur une photo choisie dans la galerie (décodée dans le navigateur, la photo ne part pas).

export type CodeVia = 'camera' | 'manual' | 'photo'

/** Secours sous la caméra et sous la saisie à la main : photos de l'étiquette ou retour. */
export function ScanFallbackLinks({ onCancel, onNoBarcode }: { onCancel: () => void; onNoBarcode: () => void }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:justify-between">
      <button type="button" onClick={onNoBarcode} className="min-h-11 text-left text-[15px] font-semibold text-ink underline underline-offset-2">
        Pas de code-barres : analyser par photos
      </button>
      <button type="button" onClick={onCancel} className="min-h-11 text-left text-[15px] text-ink-2 underline underline-offset-2">
        Annuler
      </button>
    </div>
  )
}

/** Saisie ouverte depuis le premier écran, sans passer par la caméra. */
export function ManualStep({ onCode, onCancel, onNoBarcode }: { onCode: (ean: string, via: CodeVia) => void; onCancel: () => void; onNoBarcode: () => void }) {
  return (
    <section aria-label="Saisir le code-barres" className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6">
      <ManualEan onCode={onCode} />
      <ScanFallbackLinks onCancel={onCancel} onNoBarcode={onNoBarcode} />
    </section>
  )
}

export function ManualEan({ onCode }: { onCode: (ean: string, via: CodeVia) => void }) {
  const id = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const ean = normalizeCode(value)
    if (!ean) return setError('Ce code ne correspond pas à un code-barres valide. Recopie les 13 chiffres (ou 8) écrits sous les barres.')
    setError('')
    onCode(ean, 'manual')
  }

  async function fromPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setReading(true)
    setError('')
    const ean = await decodeFile(file).catch(() => null)
    setReading(false)
    if (ean) onCode(ean, 'photo')
    else setError('Aucun code-barres lisible sur cette photo. Cadre les barres de plus près, ou recopie les chiffres.')
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex flex-col gap-1.5" aria-label="Saisir le code-barres">
        <label htmlFor={`${id}-ean`} className="text-sm font-semibold text-ink">
          Chiffres du code-barres
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-ean`}
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="search"
            maxLength={18}
            placeholder="3 760000 000017"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-describedby={error ? `${id}-err` : undefined}
            className="min-h-12 w-full min-w-0 rounded-control border-2 border-ink bg-paper px-4 text-base tabular-nums text-ink outline-none focus-visible:ring-4 focus-visible:ring-amber"
          />
          <button type="submit" className="min-h-12 shrink-0 rounded-control bg-ink px-4 text-[15px] font-semibold text-cream">
            Valider
          </button>
        </div>
      </form>
      <label className="inline-flex min-h-11 cursor-pointer items-center self-start text-[15px] font-semibold text-ink underline underline-offset-2 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-amber">
        {reading ? 'Lecture de la photo…' : 'Lire le code sur une photo de la galerie'}
        <input type="file" accept="image/*" onChange={fromPhoto} disabled={reading} className="sr-only" />
      </label>
      {error ? (
        <p id={`${id}-err`} role="alert" className="m-0 rounded-box bg-rose-bg p-3 text-[15px] text-rose-ink">
          {error}
        </p>
      ) : null}
    </div>
  )
}
