import type { ReactNode } from 'react'
import { verdictText } from '@/lib/scanner/highlights'
import type { NounWords } from '@/lib/scanner/food-noun'
import { kindOf, type ScoreResult } from '@/lib/scanner/score'
import { ScoreDetail } from '../ScoreDetail'

// @cdc lot 6 — fiche /croquettes/[slug] : « Les croquettes {Marque} sont-elles bonnes pour ton
// chien ? » (pâtée, aliment de type inconnu ou friandise : lib/scanner/food-noun.ts). Verdict en
// une phrase (tranche, points forts et faibles), puis le détail de la note. Les alertes d'une
// friandise sont déjà en tête de fiche : pas de doublon ici.

export function FicheVerdict({ brand, details, words, children }: { brand: string | null; details: ScoreResult; words: NounWords; children?: ReactNode }) {
  const treat = kindOf(details) === 'treat'
  return (
    <section aria-labelledby="verdict" className="flex flex-col gap-3">
      <h2 id="verdict" className="m-0 font-display text-2xl font-black text-ink">
        {words.question(brand)}
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">{verdictText(details)}</p>
      <ScoreDetail details={details} alerts={!treat} />
      {children}
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {treat
          ? 'La note juge la recette écrite sur le paquet. Une friandise complète la ration sans la remplacer : un chien en surpoids ou malade a des besoins propres, à voir avec ton vétérinaire.'
          : `La note juge la composition écrite sur ${words.pack}. Un chiot, un chien âgé ou malade a des besoins propres, à voir avec ton vétérinaire.`}
      </p>
    </section>
  )
}
