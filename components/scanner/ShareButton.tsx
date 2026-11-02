'use client'

import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'

// @cdc lot 6 — partager la fiche : Web Share API avec l'image story (1080×1920) quand le
// téléphone sait partager un fichier, sinon le lien seul, sinon copie du lien. L'image est
// chargée à l'avance : Safari refuse le partage si une attente sépare le clic de l'appel.

interface ShareButtonProps {
  slug: string
  name: string
  score: number | null
  className?: string
}

export function ShareButton({ slug, name, score, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const file = useRef<File | null>(null)
  const text = score === null ? `${name} : composition lue par le scanner de Toutou Gourmet` : `${name} : ${score}/100 au scanner de Toutou Gourmet`

  useEffect(() => {
    let alive = true
    fetch(`/croquettes/${slug}/story.png`)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (alive && blob) file.current = new File([blob], `${slug}.png`, { type: 'image/png' })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [slug])

  async function share() {
    const url = `${window.location.origin}/croquettes/${slug}`
    const f = file.current
    try {
      if (f && navigator.canShare?.({ files: [f] })) {
        await navigator.share({ files: [f], title: name, text: `${text} ${url}` })
        return track('Scan Share', { method: 'image' })
      }
      if (navigator.share) {
        await navigator.share({ title: name, text, url })
        return track('Scan Share', { method: 'lien' })
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      track('Scan Share', { method: 'copie' })
    } catch {
      window.prompt('Copie le lien de la fiche :', url)
    }
  }

  return (
    <button type="button" onClick={share} className={`inline-flex min-h-12 items-center justify-center rounded-control bg-ink px-5 text-[15px] font-semibold text-cream ${className}`}>
      {copied ? 'Lien copié' : 'Partager'}
    </button>
  )
}
