'use client'

import { useState } from 'react'
import { MAX_IMAGE_BYTES } from '@/lib/scanner/config'
import { shrinkPhoto } from '@/lib/scanner/resize-client'
import type { PhotoPart, Prefill, ResultOrigin, ScanAnalysis, ScanQuota, ScanResponse } from '@/lib/scanner/result'
import type { ScannerErrorCode } from '@/lib/scanner/types'
import { AnalysisArt, BagFrontArt, IngredientsArt } from './illustrations'
import { PhotoSlot } from './PhotoSlot'
import { ScanProblem } from './ScanProblem'

// @cdc lot 6 — photos guidées (compte connecté) : ① composition (obligatoire), ② constituants
// analytiques (obligatoire sauf s'ils sont sur la photo 1), ③ devant du sac (conseillée).
// Partie manquante : on garde la session (jeton signé), on demande la photo, le renvoi est gratuit.

const SLOTS: { part: PhotoPart; title: string; hint: string; badge: string; art: React.ReactNode }[] = [
  { part: 'ingredients', title: 'Liste des ingrédients', hint: 'Le bloc « Composition », en entier, avec les pourcentages.', badge: 'obligatoire', art: <IngredientsArt /> },
  { part: 'analyse', title: 'Constituants analytiques', hint: 'Le tableau protéines, matières grasses, cendres, fibres, humidité.', badge: 'obligatoire', art: <AnalysisArt /> },
  { part: 'face', title: 'Devant du sac', hint: 'Marque, nom de la recette et code-barres, pour une fiche complète.', badge: 'conseillée', art: <BagFrontArt /> },
]

interface PhotoStepsProps {
  prefill: Prefill
  quota: ScanQuota | null
  onQuota: (q: ScanQuota) => void
  onResult: (analysis: ScanAnalysis, origin: ResultOrigin) => void
  onBack: () => void
}

export function PhotoSteps({ prefill, quota, onQuota, onResult, onBack }: PhotoStepsProps) {
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null])
  const [sameShot, setSameShot] = useState(false)
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<{ code: ScannerErrorCode | 'incomplete' | 'local'; message: string } | null>(null)
  const [session, setSession] = useState('')
  const [missing, setMissing] = useState<PhotoPart[]>([])

  function set(i: number, file: File | null) {
    if (file && file.size > MAX_IMAGE_BYTES) return setProblem({ code: 'local', message: 'Cette photo dépasse 8 Mo. Reprends-la ou choisis une version plus légère.' })
    setProblem(null)
    setPhotos((prev) => prev.map((p, n) => (n === i ? file : p)))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!photos[0]) return setProblem({ code: 'local', message: 'Ajoute la photo de la liste des ingrédients.' })
    if (!photos[1] && !sameShot) return setProblem({ code: 'local', message: 'Ajoute la photo des constituants analytiques, ou coche la case s\'ils sont sur la première photo.' })
    setPending(true)
    setProblem(null)
    try {
      const body = new FormData()
      for (const [i, p] of photos.entries()) if (p) body.append('photo', await shrinkPhoto(p), `etiquette-${i + 1}.jpg`)
      if (prefill.ean) body.append('ean', prefill.ean)
      if (prefill.brand) body.append('brand', prefill.brand)
      if (prefill.product) body.append('product', prefill.product)
      if (session) body.append('session', session)
      const res = await fetch('/api/scanner', { method: 'POST', body })
      const data = (await res.json().catch(() => null)) as ScanResponse | null
      if (!data) throw new Error(String(res.status))
      if (data.quota) onQuota(data.quota)
      if (data.ok) return onResult(data.analysis, data.origin)
      if (data.error === 'incomplete') {
        setSession(data.session)
        setMissing(data.missing)
        if (data.missing.includes('analyse')) setSameShot(false)
      }
      setProblem({ code: data.error, message: data.message })
    } catch {
      setProblem({ code: 'local', message: 'L\'envoi n\'est pas passé. Vérifie ta connexion et réessaie : rien n\'a été décompté.' })
    } finally {
      setPending(false)
    }
  }

  const known = [prefill.brand, prefill.product].filter(Boolean).join(' · ')
  return (
    <form onSubmit={submit} aria-label="Analyser l'étiquette en photos" className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <p className="m-0 font-display text-xl font-black leading-tight text-ink">Prends l&apos;étiquette en photo</p>
        <p className="m-0 text-sm text-ink-2">
          {known ? `${known}${prefill.ean ? ` · ${prefill.ean}` : ''} : ` : prefill.ean ? `Code-barres ${prefill.ean} : ` : ''}
          {'photos nettes, à plat, sans reflet. Elles sont lues puis oubliées, jamais enregistrées.'}
        </p>
      </div>
      <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {SLOTS.map((s, i) =>
          i === 1 && sameShot ? null : (
            <PhotoSlot key={s.part} index={i + 1} {...s} photo={photos[i]} onChange={(f) => set(i, f)} highlight={missing.includes(s.part)} disabled={pending} />
          ),
        )}
      </ol>
      <label className="flex min-h-11 items-center gap-3 text-[15px] text-ink">
        <input type="checkbox" checked={sameShot} onChange={(e) => setSameShot(e.target.checked)} className="size-5 accent-[var(--orange)]" />
        Les constituants analytiques sont sur la photo 1
      </label>
      {problem ? problem.code === 'local' || problem.code === 'incomplete' ? (
        <p role="alert" className="m-0 rounded-box bg-amber-bg p-3 text-[15px] leading-relaxed text-amber-ink">
          {problem.message}
        </p>
      ) : (
        <ScanProblem code={problem.code} message={problem.message} />
      ) : null}
      <button type="submit" disabled={pending} className="min-h-12 rounded-control bg-orange px-5 text-base font-semibold text-ink disabled:opacity-60">
        {pending ? 'Lecture de l\'étiquette…' : session ? 'Envoyer la photo manquante' : 'Analyser l\'étiquette'}
      </button>
      <p className="m-0 flex flex-wrap justify-between gap-2 text-sm text-ink-2">
        <span>{quota ? `Analyses par photo ce mois-ci : ${quota.used} sur ${quota.limit}.` : ' '}</span>
        <button type="button" onClick={onBack} className="min-h-11 underline underline-offset-2">
          Revenir au code-barres
        </button>
      </p>
    </form>
  )
}
