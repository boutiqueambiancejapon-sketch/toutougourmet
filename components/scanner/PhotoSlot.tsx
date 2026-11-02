'use client'

import Image from 'next/image'
import { useEffect, useMemo, type ReactNode } from 'react'
import { ACCEPTED_TYPES } from '@/lib/scanner/config'

// @cdc lot 6 — un emplacement de photo guidée : illustration de la photo attendue, prise de vue
// (caméra arrière sur mobile) ou galerie, aperçu local (blob:), reprise avant envoi.

const ACCEPT = [...ACCEPTED_TYPES, '.heic', '.heif'].join(',')

interface PhotoSlotProps {
  index: number
  title: string
  hint: string
  badge: string
  art: ReactNode
  photo: File | null
  onChange: (file: File | null) => void
  highlight?: boolean
  disabled?: boolean
}

export function PhotoSlot({ index, title, hint, badge, art, photo, onChange, highlight, disabled }: PhotoSlotProps) {
  const url = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])
  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url])

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    e.target.value = ''
    if (file) onChange(file)
  }

  const btn =
    'relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control px-3 text-sm font-semibold has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-amber'
  return (
    <li className={`flex gap-3 rounded-box border-2 p-3 ${highlight ? 'border-orange bg-amber-bg' : 'border-line bg-paper'}`}>
      <div className="w-20 shrink-0 sm:w-24">
        {url ? (
          <Image src={url} alt={`Photo ${index} : ${title}`} width={96} height={96} unoptimized className="aspect-square w-full rounded-box border border-line object-cover" />
        ) : (
          art
        )}
      </div>
      <div className="flex min-w-0 grow flex-col gap-1.5">
        <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-[15px] font-semibold leading-snug text-ink">
          <span>{`${index}. ${title}`}</span>
          <span className="text-xs font-semibold text-ink-2">{badge}</span>
        </p>
        <p className="m-0 text-sm leading-snug text-ink-2">{hint}</p>
        <div className="flex flex-wrap gap-2">
          <label className={`${btn} ${photo ? 'border-2 border-ink text-ink' : 'bg-ink text-cream'}`}>
            {photo ? 'Reprendre' : 'Prendre la photo'}
            <input type="file" accept="image/*" capture="environment" onChange={pick} disabled={disabled} className="sr-only" />
          </label>
          {photo ? (
            <button type="button" onClick={() => onChange(null)} disabled={disabled} className="min-h-11 px-2 text-sm font-semibold text-ink underline underline-offset-2">
              Retirer
            </button>
          ) : (
            <label className={`${btn} text-ink underline underline-offset-2`}>
              Galerie
              <input type="file" accept={ACCEPT} onChange={pick} disabled={disabled} className="sr-only" />
            </label>
          )}
        </div>
      </div>
    </li>
  )
}
