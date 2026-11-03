import type { ReactNode } from 'react'
import { verdictText } from '@/lib/scanner/highlights'
import { kindOf, type ScoreResult } from '@/lib/scanner/score'
import { ScoreDetail } from '../ScoreDetail'

// @cdc lot 6 — fiche /croquettes/[slug] : « Les croquettes {Marque} sont-elles bonnes pour ton
// chien ? » (friandise : « Cette friandise {Marque} est-elle bonne pour ton chien ? »). Verdict en
// une phrase (tranche, points forts et faibles), puis le détail de la note. Les alertes d'une
// friandise sont déjà en tête de fiche : pas de doublon ici.

export function FicheVerdict({ brand, details, children }: { brand: string | null; details: ScoreResult; children?: ReactNode }) {
  const treat = kindOf(details) === 'treat'
  return (
    <section aria-labelledby="verdict" className="flex flex-col gap-3">
      <h2 id="verdict" className="m-0 font-display text-2xl font-black text-ink">
        {treat ? (brand ? `Cette friandise ${brand} est-elle bonne pour ton chien ?` : 'Cette friandise est-elle bonne pour ton chien ?') : `Les croquettes ${brand ?? 'de cette marque'} sont-elles bonnes pour ton chien ?`}
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">{verdictText(details)}</p>
      <ScoreDetail details={details} alerts={!treat} />
      {children}
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {treat
          ? 'La note juge la recette écrite sur le paquet. Une friandise complète la ration sans la remplacer : un chien en surpoids ou malade a des besoins propres, à voir avec ton vétérinaire.'
          : 'La note juge la composition écrite sur le sac. Un chiot, un chien âgé ou malade a des besoins propres, à voir avec ton vétérinaire.'}
      </p>
    </section>
  )
}
