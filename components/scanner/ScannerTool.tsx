'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { hasSessionHint } from '@/lib/account-hint'
import { track } from '@/lib/analytics'
import type { Prefill, ResultOrigin, ScanAnalysis, ScanQuota, ScanResponse } from '@/lib/scanner/result'
import { AccountGate, PREFILL_KEY } from './AccountGate'
import type { CodeVia } from './ManualEan'
import { PhotoSteps } from './PhotoSteps'
import { ScanProblem } from './ScanProblem'
import { ScanResult } from './ScanResult'
import { ScanStart, START_EVENT } from './ScanStart'

// @cdc lot 6 — parcours du scanner sur /scanner : code-barres d'abord (caméra, chiffres ou photo),
// résultat immédiat s'il est en cache ou sur Open Pet Food Facts (sans compte, non décompté),
// sinon photos guidées avec un compte. Le lecteur de code-barres (et son polyfill) n'est chargé
// qu'au clic. La page reste rendue côté serveur : ce composant ne porte que l'interaction.

const BarcodeScanner = dynamic(() => import('./BarcodeScanner').then((m) => m.BarcodeScanner), {
  ssr: false,
  loading: () => <p role="status" className="m-0 rounded-card border border-line bg-paper p-4 text-[15px] text-ink">Ouverture de la caméra…</p>,
})

type Step =
  | { name: 'idle' }
  | { name: 'camera' }
  | { name: 'looking'; ean: string }
  | { name: 'photos'; prefill: Prefill; notice?: { code: 'not_found' | 'cat_food' | 'treat'; message: string } }
  | { name: 'result'; analysis: ScanAnalysis; origin: ResultOrigin }

const noop = () => () => {}
const EMPTY: Prefill = { ean: null, brand: null, product: null }

export function ScannerTool({ monthlyLimit }: { monthlyLimit: number }) {
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  const [step, setStep] = useState<Step>({ name: 'idle' })
  const [quota, setQuota] = useState<ScanQuota | null>(null)
  const top = useRef<HTMLDivElement>(null)

  // Retour de connexion (?photos=1) : reprendre les photos avec le code-barres gardé.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('photos')) return
    let prefill = EMPTY
    try {
      prefill = { ...EMPTY, ...(JSON.parse(sessionStorage.getItem(PREFILL_KEY) ?? 'null') as Prefill | null) }
      sessionStorage.removeItem(PREFILL_KEY)
    } catch {}
    // Après l'hydratation (la page servie est la même pour tous) : prochain tour de boucle.
    const t = setTimeout(() => setStep({ name: 'photos', prefill }), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const start = () => {
      setStep({ name: 'camera' })
      top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.addEventListener(START_EVENT, start)
    return () => window.removeEventListener(START_EVENT, start)
  }, [])

  useEffect(() => {
    if (!signedIn || step.name !== 'photos' || quota) return
    fetch('/api/scanner', { cache: 'no-store' })
      .then((r) => r.json() as Promise<{ quota?: ScanQuota }>)
      .then((d) => d.quota && setQuota(d.quota))
      .catch(() => {})
  }, [signedIn, step.name, quota])

  function showResult(analysis: ScanAnalysis, origin: ResultOrigin) {
    setStep({ name: 'result', analysis, origin })
    track('Scan Result', { origin, score: analysis.score ?? -1 })
  }

  async function lookup(ean: string, via: CodeVia) {
    track('Scan Barcode', { via })
    setStep({ name: 'looking', ean })
    const data = await fetch('/api/scanner/code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ean }) })
      .then((r) => r.json() as Promise<ScanResponse>)
      .catch(() => null)
    if (data?.ok) return showResult(data.analysis, data.origin)
    const code = data && !data.ok && data.error !== 'incomplete' ? data.error : null
    const notice = code === 'not_found' || code === 'cat_food' || code === 'treat' ? { code, message: data?.message ?? '' } : undefined
    const prefill = data && !data.ok && data.error !== 'incomplete' && data.prefill ? data.prefill : { ...EMPTY, ean }
    setStep({ name: 'photos', prefill, notice })
  }

  const restart = () => setStep({ name: 'camera' })
  return (
    <div ref={top} id="scan" className="flex scroll-mt-24 flex-col gap-4">
      {step.name === 'idle' ? <ScanStart monthlyLimit={monthlyLimit} onStart={() => setStep({ name: 'camera' })} /> : null}
      {step.name === 'camera' ? (
        <BarcodeScanner onCode={lookup} onCancel={() => setStep({ name: 'idle' })} onNoBarcode={() => setStep({ name: 'photos', prefill: EMPTY })} />
      ) : null}
      {step.name === 'looking' ? (
        <p role="status" className="m-0 rounded-card border border-line bg-paper p-4 text-[15px] text-ink">{`Recherche du code-barres ${step.ean}…`}</p>
      ) : null}
      {step.name === 'photos' ? (
        <>
          {step.notice ? <ScanProblem code={step.notice.code} message={step.notice.message} /> : null}
          {step.notice?.code === 'cat_food' || step.notice?.code === 'treat' ? (
            <button type="button" onClick={restart} className="min-h-12 rounded-control bg-orange px-5 text-base font-semibold text-ink">
              Scanner un autre produit
            </button>
          ) : signedIn ? (
            <PhotoSteps prefill={step.prefill} quota={quota} onQuota={setQuota} onResult={showResult} onBack={restart} />
          ) : (
            <AccountGate prefill={step.prefill} monthlyLimit={monthlyLimit} onBack={restart} />
          )}
        </>
      ) : null}
      {step.name === 'result' ? <ScanResult analysis={step.analysis} origin={step.origin} quota={quota} signedIn={signedIn} onRestart={restart} /> : null}
    </div>
  )
}
