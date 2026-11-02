'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { ScanAnalysis, ScanQuota } from '@/lib/scanner/result'
import { AiNotice } from './AiNotice'
import { LabelData } from './LabelData'
import { ReportError } from './ReportError'
import { ScoreDetail } from './ScoreDetail'

// @cdc lot 6 — résultat d'une analyse : produit, note et détail, mention IA, lecture de
// l'étiquette, lien vers la fiche /croquettes/[slug], signalement d'erreur.

interface ScanResultProps {
  analysis: ScanAnalysis
  fromCache: boolean
  quota: ScanQuota | null
  onRestart: () => void
}

export function ScanResult({ analysis, fromCache, quota, onRestart }: ScanResultProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])
  const name = [analysis.brand, analysis.product].filter(Boolean).join(' · ') || 'Produit sans nom lisible'
  return (
    <section aria-labelledby="scan-resultat" className="flex flex-col gap-5 rounded-card border border-line bg-paper p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 id="scan-resultat" ref={heading} tabIndex={-1} className="m-0 font-display text-2xl font-black leading-tight text-ink outline-none">
          {name}
        </h2>
        <p className="m-0 text-sm text-ink-2">
          {fromCache ? 'Produit déjà analysé : résultat repris tel quel, non décompté.' : 'Analyse terminée.'}
          {analysis.ean ? ` Code-barres ${analysis.ean}.` : ''}
        </p>
      </div>
      <ScoreDetail details={analysis.details} />
      <AiNotice />
      <LabelData label={analysis.label} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/croquettes/${analysis.slug}`}
          className="inline-flex min-h-12 items-center justify-center rounded-control border-2 border-ink px-5 text-[15px] font-semibold text-ink no-underline"
        >
          Voir la fiche de ce produit
        </Link>
        <button type="button" onClick={onRestart} className="min-h-12 rounded-control bg-orange px-5 text-[15px] font-semibold text-ink">
          Analyser une autre étiquette
        </button>
      </div>
      {quota ? <p className="m-0 text-sm text-ink-2">{`Analyses utilisées ce mois-ci : ${quota.used} sur ${quota.limit}.`}</p> : null}
      <ReportError analysisId={analysis.id} />
    </section>
  )
}
