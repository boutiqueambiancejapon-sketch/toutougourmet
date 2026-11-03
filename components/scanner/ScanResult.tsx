'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ResultOrigin, ScanAnalysis, ScanQuota } from '@/lib/scanner/result'
import { analyseLabel } from '@/lib/scanner/analyse'
import { LabelData } from './LabelData'
import { ReportError } from './ReportError'
import { ScoreDetail } from './ScoreDetail'
import { ShareButton } from './ShareButton'
import { SourceNotice } from './SourceNotice'
import { VerifyFields } from './VerifyFields'
import { DownloadLink } from './DownloadLink'

// @cdc lot 6 — résultat d'un scan : produit, provenance (cache, Open Pet Food Facts, photos),
// note et détail (recalculés dans le navigateur si un chiffre est corrigé), lecture de
// l'étiquette, partage, fiche en PDF, signalement d'erreur.

const ORIGIN_TEXT: Record<ResultOrigin, string> = {
  cache: 'Produit déjà analysé : résultat immédiat, non décompté.',
  openpetfoodfacts: 'Calculé à partir des données d\'Open Pet Food Facts, sans photo : non décompté.',
  openfoodfacts: 'Calculé à partir des données d\'Open Food Facts, sans photo : non décompté.',
  photo: 'Analyse de tes photos terminée.',
}

interface ScanResultProps {
  analysis: ScanAnalysis
  origin: ResultOrigin
  quota: ScanQuota | null
  signedIn: boolean
  onRestart: () => void
}

export function ScanResult({ analysis, origin, quota, signedIn, onRestart }: ScanResultProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])
  const [corrected, setCorrected] = useState(analysis.label)
  const details = useMemo(() => (corrected === analysis.label ? analysis.details : analyseLabel(corrected)), [corrected, analysis])
  const name = [analysis.brand, analysis.product].filter(Boolean).join(' · ') || 'Produit sans nom lisible'
  const changed = details.score !== analysis.details.score
  // Chiffres douteux : l'encart « à vérifier » passe avant le détail de la note.
  const doubtful = (analysis.label.champsDouteux ?? []).some((f) => f !== 'ingredients')
  const verify = <VerifyFields original={analysis.label} analysisId={analysis.id} signedIn={signedIn} onChange={setCorrected} />
  return (
    <section aria-labelledby="scan-resultat" className="flex flex-col gap-5 rounded-card border border-line bg-paper p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 id="scan-resultat" ref={heading} tabIndex={-1} className="m-0 font-display text-2xl font-black leading-tight text-ink outline-none">
          {name}
        </h2>
        <p className="m-0 text-sm text-ink-2">
          {ORIGIN_TEXT[origin]}
          {analysis.ean ? ` Code-barres ${analysis.ean}.` : ''}
        </p>
      </div>
      {changed ? (
        <p role="status" className="m-0 text-sm text-ink-2">{`Note recalculée avec ta correction (lecture d'origine : ${analysis.details.score ?? 'pas de note'}).`}</p>
      ) : null}
      {doubtful ? verify : null}
      <ScoreDetail details={details} />
      {doubtful ? null : verify}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="flex gap-2">
          <DownloadLink slug={analysis.slug} className="flex-1" />
          <ShareButton slug={analysis.slug} name={name} score={analysis.score} className="flex-1" />
        </div>
        <Link href={`/croquettes/${analysis.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-control border-2 border-ink px-5 text-[15px] font-semibold text-ink no-underline">
          Voir la fiche
        </Link>
      </div>
      <SourceNotice source={analysis.source} />
      <LabelData label={analysis.label} source={analysis.source} />
      <button type="button" onClick={onRestart} className="min-h-12 rounded-control bg-orange px-5 text-[15px] font-semibold text-ink">
        Scanner un autre produit
      </button>
      {quota ? <p className="m-0 text-sm text-ink-2">{`Analyses par photo ce mois-ci : ${quota.used} sur ${quota.limit}.`}</p> : null}
      {signedIn ? <ReportError analysisId={analysis.id} /> : null}
    </section>
  )
}
