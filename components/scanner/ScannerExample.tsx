import { PREMIUM_LABEL } from '@/lib/scanner/fixtures'
import { scoreLabel } from '@/lib/scanner/score'
import { ScoreDetail } from './ScoreDetail'

// @cdc lot 6 — exemple de résultat sur /scanner, calculé par le vrai barème à partir d'une
// étiquette inventée (marque fictive) : pas de produit réel noté sans relecture.

export function ScannerExample() {
  const details = scoreLabel(PREMIUM_LABEL)
  return (
    <section aria-labelledby="exemple" className="flex flex-col gap-3">
      <h2 id="exemple" className="m-0 font-display text-2xl font-black text-ink">
        À quoi ressemble un résultat ?
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        {`Exemple calculé avec une étiquette inventée (marque fictive ${PREMIUM_LABEL.marque}, recette « ${PREMIUM_LABEL.produit} ») : saumon et poulet en tête, ${PREMIUM_LABEL.constituants.proteines} % de protéines et ${PREMIUM_LABEL.constituants.humidite} % d'humidité sur le paquet.`}
      </p>
      <div className="rounded-card border border-line bg-paper p-4 sm:p-6">
        <ScoreDetail details={details} />
      </div>
    </section>
  )
}
