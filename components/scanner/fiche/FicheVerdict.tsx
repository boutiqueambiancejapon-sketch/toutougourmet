import type { ReactNode } from 'react'
import { verdictText } from '@/lib/scanner/highlights'
import type { FoodNoun, NounWords } from '@/lib/scanner/food-noun'
import { kindOf, type ScoreResult } from '@/lib/scanner/score'
import { ScoreDetail } from '../ScoreDetail'
import { titleTypo } from '@/lib/title-typo'

// @cdc lot 6 — fiche /croquettes/[slug] : « Les croquettes {Marque} sont-elles bonnes pour ton
// chien ? » (pâtée, aliment de type inconnu ou friandise : lib/scanner/food-noun.ts). Verdict en
// une phrase (tranche, points forts et faibles), puis le détail de la note. Les alertes d'une
// friandise sont déjà en tête de fiche : pas de doublon ici.

const COMPARE: Record<FoodNoun, string> = {
  croquettes: 'Compare-la à d’autres croquettes : l’eau d’une pâtée change le calcul.',
  patee: 'Compare-la à d’autres pâtées : l’eau de la recette change le calcul face à des croquettes.',
  friandise: 'Les friandises ont leur propre barème : cette note ne se compare pas à celle d’un repas.',
  aliment: '',
}

export function FicheVerdict({ brand, details, words, noun, children }: { brand: string | null; details: ScoreResult; words: NounWords; noun: FoodNoun; children?: ReactNode }) {
  const treat = kindOf(details) === 'treat'
  return (
    <section aria-labelledby="verdict" className="flex flex-col gap-3">
      <h2 id="verdict" className="m-0 font-display text-2xl font-black text-ink">
        {titleTypo(words.question(brand))}
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">{verdictText(details)}</p>
      {COMPARE[noun] ? <p className="m-0 text-[15px] leading-relaxed text-ink-2">{COMPARE[noun]}</p> : null}
      <ScoreDetail details={details} alerts={!treat && !details.alertes} resume={false} />
      {children}
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {treat
          ? 'La note juge la recette écrite sur le paquet. Une friandise complète la ration sans la remplacer : un chien en surpoids ou malade a des besoins propres, à voir avec ton vétérinaire.'
          : `La note juge la composition écrite sur ${words.pack}. Un chiot, un chien âgé ou malade a des besoins propres, à voir avec ton vétérinaire.`}
      </p>
    </section>
  )
}
