'use client'

import Image from 'next/image'
import { useState } from 'react'
import { IconDog } from '@/components/icons'

// @cdc scanner — photo du produit dans un rond. Décorative : le nom du produit est toujours écrit à côté.
// Pas de photo, ou photo qui ne charge pas : un petit chien (demande du propriétaire, 2026-11-05).

export function ProductPhoto({ src, size = 'sm' }: { src?: string | null; size?: 'sm' | 'lg' }) {
  const [broken, setBroken] = useState(false)
  const px = size === 'lg' ? 80 : 44
  const box = size === 'lg' ? 'size-20' : 'size-11'
  if (!src || broken) {
    return (
      <span aria-hidden="true" className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full border border-line bg-paper text-ink-2`}>
        <IconDog className={size === 'lg' ? 'size-10' : 'size-6'} />
      </span>
    )
  }
  return (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      sizes={`${px}px`}
      onError={() => setBroken(true)}
      className={`shrink-0 rounded-full border border-line bg-paper object-contain p-0.5 ${box}`}
    />
  )
}
