import type { ScoreResult } from '@/lib/scanner/score'

// @cdc scanner — fiabilité de la note : la note dit ce qu'on lit, ce repère dit combien on a pu lire.

const TEXTE = {
  haute: ['Données complètes', 'La note s\'appuie sur toute l\'étiquette.'],
  moyenne: ['Données partielles', 'Il manque des informations sur l\'étiquette, souvent le calcium, le phosphore ou une part de viande chiffrée.'],
  faible: ['Données limitées', 'Trop d\'informations manquent : compare cette note avec prudence.'],
} as const

export const FIABILITE_LABEL = { haute: TEXTE.haute[0], moyenne: TEXTE.moyenne[0], faible: TEXTE.faible[0] }

export function FicheFiabilite({ details }: { details: ScoreResult }) {
  const f = details.bareme?.fiabilite
  if (!f || details.score === null || details.bareme?.simple) return null
  const [label, texte] = TEXTE[f]
  return <p className="m-0 text-[15px] leading-relaxed text-ink-2"><strong className="font-semibold text-ink">{label}.</strong> {texte}</p>
}
