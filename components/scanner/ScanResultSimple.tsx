import type { ScanAnalysis, ScanQuota } from '@/lib/scanner/result'
import { ProductPhoto } from './ProductPhoto'
import { ScoreDetail } from './ScoreDetail'

// @cdc scanner — complément ou huile : la note sur 100 et le message, rien d'autre (décision du
// 2026-11-05). Ni détail, ni lecture de l'étiquette, ni lien d'achat, aucune promesse de soin.

interface ScanResultSimpleProps {
  analysis: ScanAnalysis
  name: string
  quota: ScanQuota | null
  onRestart: () => void
}

export function ScanResultSimple({ analysis, name, quota, onRestart }: ScanResultSimpleProps) {
  return (
    <section aria-labelledby="scan-resultat" className="flex flex-col gap-5 rounded-card border border-line bg-paper p-4 sm:p-6">
      <h2 id="scan-resultat" className="m-0 font-display text-2xl font-black leading-tight text-ink">
        {name}
      </h2>
      <ProductPhoto src={analysis.imageUrl} size="lg" />
      <ScoreDetail details={analysis.details} />
      <button type="button" onClick={onRestart} className="min-h-12 rounded-control bg-orange px-5 text-[15px] font-semibold text-ink">
        Scanner un autre produit
      </button>
      {quota ? <p className="m-0 text-sm text-ink-2">{`Analyses par photo ce mois-ci : ${quota.used} sur ${quota.limit}.`}</p> : null}
    </section>
  )
}
