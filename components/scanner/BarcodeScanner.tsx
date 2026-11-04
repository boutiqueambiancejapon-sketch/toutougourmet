'use client'

import { useEffect, useRef, useState } from 'react'
import { decodeSource, getDetector } from '@/lib/scanner/barcode-client'
import { ManualEan, ScanFallbackLinks, type CodeVia } from './ManualEan'

// @cdc lot 6 — lecture du code-barres à la caméra (iPhone Safari et Android). Le flux vidéo reste
// dans le navigateur : aucune image n'est envoyée ni gardée. Caméra refusée, absente ou
// navigateur trop ancien : saisie des chiffres ou photo de la galerie (ManualEan).

type CamState = 'starting' | 'live' | 'denied' | 'unavailable'

const MESSAGES: Record<Exclude<CamState, 'live' | 'starting'>, string> = {
  denied:
    "L'accès à la caméra est refusé. Autorise-le dans les réglages du navigateur (sur iPhone : Réglages, Safari, Caméra), ou recopie les chiffres du code-barres ci-dessous.",
  unavailable: "Pas de caméra disponible sur cet appareil. Recopie les chiffres du code-barres ci-dessous, ou lis-le sur une photo.",
}

interface BarcodeScannerProps {
  onCode: (ean: string, via: CodeVia) => void
  onCancel: () => void
  onNoBarcode: () => void
}

export function BarcodeScanner({ onCode, onCancel, onNoBarcode }: BarcodeScannerProps) {
  const video = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<CamState>('starting')
  const found = useRef(onCode)
  useEffect(() => {
    found.current = onCode
  })

  useEffect(() => {
    let stream: MediaStream | null = null
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const stop = () => {
      stopped = true
      clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
    }
    async function scan() {
      if (stopped) return
      const v = video.current
      const ean = v && v.readyState >= 2 ? await decodeSource(v).catch(() => null) : null
      if (ean && !stopped) {
        stop()
        return found.current(ean, 'camera')
      }
      timer = setTimeout(scan, 200)
    }
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) return setState('unavailable')
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
        if (stopped || !video.current) return stop()
        video.current.srcObject = stream
        await video.current.play()
        await getDetector()
        setState('live')
        void scan()
      } catch (err) {
        const name = err instanceof DOMException ? err.name : ''
        setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable')
        stop()
      }
    }
    void start()
    return stop
  }, [])

  const blocked = state === 'denied' || state === 'unavailable'
  return (
    <section aria-label="Lecture du code-barres" className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6">
      {!blocked ? (
        <div className="relative overflow-hidden rounded-box bg-ink">
          <video ref={video} muted playsInline autoPlay aria-label="Image de la caméra" className="aspect-[4/3] w-full object-cover" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-[12%] top-1/2 h-[30%] -translate-y-1/2 rounded-box border-4 border-orange" />
          <p role="status" className="absolute inset-x-0 bottom-0 m-0 bg-ink/80 px-3 py-2 text-center text-sm font-semibold text-cream">
            {state === 'live' ? 'Vise le code-barres du sac, à 15 cm environ' : 'Ouverture de la caméra…'}
          </p>
        </div>
      ) : (
        <p role="alert" className="m-0 rounded-box bg-amber-bg p-3 text-[15px] leading-relaxed text-amber-ink">
          {MESSAGES[state]}
        </p>
      )}
      <ManualEan onCode={onCode} />
      <ScanFallbackLinks onCancel={onCancel} onNoBarcode={onNoBarcode} />
    </section>
  )
}
