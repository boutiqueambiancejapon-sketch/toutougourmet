'use client'

import Image from 'next/image'
import { useEffect, useId, useMemo } from 'react'
import { ACCEPTED_TYPES, MAX_IMAGES } from '@/lib/scanner/config'

// @cdc lot 6 — choix des photos : appareil photo (capture arrière sur mobile) ou galerie,
// 2 photos au plus, aperçus locaux (URL blob:, rien n'est envoyé avant le clic sur « Analyser »).

const ACCEPT = [...ACCEPTED_TYPES, '.heic', '.heif'].join(',')

interface PhotoPickerProps {
  photos: File[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
  disabled?: boolean
}

export function PhotoPicker({ photos, onAdd, onRemove, disabled }: PhotoPickerProps) {
  const id = useId()
  const urls = useMemo(() => photos.map((p) => URL.createObjectURL(p)), [photos])
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls])
  const full = photos.length >= MAX_IMAGES

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    onAdd(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const btn =
    'relative inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-control px-4 text-[15px] font-semibold has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-amber'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className={`${btn} bg-ink text-cream`}>
          {photos.length === 0 ? 'Prendre l\'étiquette en photo' : 'Ajouter une photo'}
          <input id={`${id}-cam`} type="file" accept="image/*" capture="environment" onChange={pick} disabled={disabled || full} className="sr-only" />
        </label>
        <label className={`${btn} border-2 border-ink text-ink`}>
          Choisir dans la galerie
          <input id={`${id}-gal`} type="file" accept={ACCEPT} multiple onChange={pick} disabled={disabled || full} className="sr-only" />
        </label>
      </div>
      <p className="m-0 text-sm text-ink-2">
        {`Une ou deux photos nettes : la composition et les constituants analytiques. JPEG, PNG, WebP ou HEIC, 8 Mo au plus. ${photos.length}/${MAX_IMAGES}`}
      </p>
      {photos.length > 0 ? (
        <ul role="list" className="m-0 grid list-none grid-cols-2 gap-3 p-0">
          {photos.map((p, i) => (
            <li key={`${p.name}-${p.size}-${i}`} className="flex flex-col gap-1">
              <Image
                src={urls[i]}
                alt={`Photo ${i + 1} de l'étiquette`}
                width={320}
                height={320}
                unoptimized
                className="aspect-square w-full rounded-box border border-line bg-cream-2 object-cover"
              />
              <button type="button" onClick={() => onRemove(i)} disabled={disabled} className="min-h-11 text-sm font-semibold text-ink underline underline-offset-2">
                Retirer
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
