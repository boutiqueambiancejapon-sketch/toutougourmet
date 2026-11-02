'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { track } from '@/lib/analytics'
import { MAX_IMAGE_BYTES, MAX_IMAGES } from '@/lib/scanner/config'
import { readBarcode, shrinkPhoto } from '@/lib/scanner/resize-client'
import type { ScanAnalysis, ScanQuota, ScanResponse } from '@/lib/scanner/result'
import { PhotoPicker } from './PhotoPicker'
import { ScanResult } from './ScanResult'

// @cdc lot 6 — formulaire d'analyse (compte connecté) : photos réduites dans le navigateur,
// code-barres facultatif (lu sur la photo quand le navigateur sait le faire) qui permet de
// resservir une analyse déjà faite sans la décompter.

export function ScanForm() {
  const id = useId()
  const [photos, setPhotos] = useState<File[]>([])
  const [ean, setEan] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [quota, setQuota] = useState<ScanQuota | null>(null)
  const [result, setResult] = useState<{ analysis: ScanAnalysis; fromCache: boolean } | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    fetch('/api/scanner', { cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 401) return setExpired(true)
        const data = (await res.json()) as { quota?: ScanQuota }
        if (data.quota) setQuota(data.quota)
      })
      .catch(() => {})
  }, [])

  async function add(files: File[]) {
    setError('')
    const tooBig = files.some((f) => f.size > MAX_IMAGE_BYTES)
    if (tooBig) setError('Une photo dépasse 8 Mo. Reprends-la ou envoie une version plus légère.')
    const ok = files.filter((f) => f.size <= MAX_IMAGE_BYTES)
    setPhotos((prev) => [...prev, ...ok].slice(0, MAX_IMAGES))
    if (!ean)
      for (const f of ok) {
        const code = await readBarcode(f)
        if (code) return setEan(code)
      }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (photos.length === 0) return setError('Ajoute au moins une photo de l\'étiquette.')
    setPending(true)
    setError('')
    try {
      const body = new FormData()
      for (const [i, p] of photos.entries()) body.append('photo', await shrinkPhoto(p), `etiquette-${i + 1}.jpg`)
      if (ean.trim()) body.append('ean', ean.trim())
      const res = await fetch('/api/scanner', { method: 'POST', body })
      const data = (await res.json().catch(() => null)) as ScanResponse | null
      if (!data) throw new Error(String(res.status))
      if (data.quota) setQuota(data.quota)
      if (!data.ok) return setError(data.message)
      setResult({ analysis: data.analysis, fromCache: data.fromCache })
      track('Tool Result', { tool: 'scanner', cache: data.fromCache })
    } catch {
      setError('L\'envoi n\'est pas passé. Vérifie ta connexion et réessaie.')
    } finally {
      setPending(false)
    }
  }

  function restart() {
    setResult(null)
    setPhotos([])
    setEan('')
  }

  if (result) return <ScanResult {...result} quota={quota} onRestart={restart} />
  if (expired)
    return (
      <p className="m-0 rounded-card border border-line bg-paper p-4 text-[15px] text-ink">
        Ta session a expiré.{' '}
        <Link href="/compte/connexion?retour=%2Fscanner" className="font-semibold text-orange-ink underline underline-offset-2">
          Reconnecte-toi
        </Link>{' '}
        pour lancer une analyse.
      </p>
    )

  return (
    <form onSubmit={onSubmit} aria-label="Analyser une étiquette" className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6">
      <PhotoPicker photos={photos} onAdd={add} onRemove={(i) => setPhotos((p) => p.filter((_, n) => n !== i))} disabled={pending} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-ean`} className="text-sm font-semibold text-ink">
          Code-barres <span className="font-normal text-ink-2">(facultatif)</span>
        </label>
        <input
          id={`${id}-ean`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={18}
          value={ean}
          onChange={(e) => setEan(e.target.value)}
          aria-describedby={`${id}-ean-hint`}
          className="min-h-12 w-full rounded-control border-2 border-ink bg-paper px-4 text-base text-ink outline-none focus-visible:ring-4 focus-visible:ring-amber"
        />
        <p id={`${id}-ean-hint`} className="m-0 text-sm text-ink-2">
          Les chiffres sous le code-barres. Si ce produit a déjà été analysé, le résultat s&apos;affiche tout de suite et ne compte pas dans tes analyses du mois.
        </p>
      </div>
      {error ? (
        <p role="alert" className="m-0 rounded-box bg-rose-bg p-3 text-[15px] text-rose-ink">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="min-h-12 rounded-control bg-orange px-5 text-base font-semibold text-ink disabled:opacity-60">
        {pending ? 'Lecture de l\'étiquette…' : 'Analyser l\'étiquette'}
      </button>
      {quota ? <p className="m-0 text-sm text-ink-2">{`Analyses utilisées ce mois-ci : ${quota.used} sur ${quota.limit}.`}</p> : null}
    </form>
  )
}
