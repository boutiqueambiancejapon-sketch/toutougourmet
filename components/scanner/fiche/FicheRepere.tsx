import type { FoodAnalysis } from '@/db/schema'
import { phrasesChien, phrasesPlace, questionsFiche } from '@/lib/scanner/fiche-texte'
import type { FoodNoun } from '@/lib/scanner/food-noun'
import { displayBrand } from '@/lib/scanner/rankings'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { fichePlace } from '@/lib/server/fiche-place'
import { titleTypo } from '@/lib/title-typo'
import { RankRow } from '../rankings/RankRow'

// @cdc seo — ce qui distingue une fiche des autres : sa place, le chien visé, des produits à comparer, ses questions.

const H2 = 'm-0 font-display text-2xl font-black text-ink'
const TEXT = 'm-0 text-base leading-relaxed text-ink-2'

export async function FichePlaceBlock({ row, noun, nom }: { row: FoodAnalysis; noun: FoodNoun; nom: string }) {
  const place = await fichePlace(row, noun)
  if (!place || !row.brand || row.score === null) return null
  const phrases = phrasesPlace({ ...place, marque: displayBrand(row.brand), note: row.score })
  if (phrases.length === 0) return null
  return (
    <section aria-labelledby="place" className="flex flex-col gap-2 rounded-card bg-cream-2 p-4">
      <h2 id="place" className="m-0 font-display text-xl font-black text-ink">{titleTypo(`Comment se place ${nom} ?`)}</h2>
      <p className={TEXT}>{phrases.join(' ')}</p>
    </section>
  )
}

export function FicheChien({ label, nom }: { label: ExtractedLabel; nom: string }) {
  const phrases = phrasesChien(nom, label)
  if (phrases.length === 0) return null
  return (
    <section aria-labelledby="pour-quel-chien" className="flex flex-col gap-3">
      <h2 id="pour-quel-chien" className={H2}>{titleTypo(`Pour quel chien est fait ${nom} ?`)}</h2>
      <p className={TEXT}>{phrases.join(' ')}</p>
    </section>
  )
}

export async function FicheComparer({ row, noun, nom }: { row: FoodAnalysis; noun: FoodNoun; nom: string }) {
  const place = await fichePlace(row, noun)
  if (!place || place.comparer.length === 0) return null
  return (
    <section aria-labelledby="comparer" className="flex flex-col gap-3">
      <h2 id="comparer" className={H2}>{titleTypo(`Que comparer à ${nom} ?`)}</h2>
      <p className={TEXT}>Ces recettes d&apos;autres marques notent au moins autant, avec le même barème.</p>
      <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {place.comparer.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
      </ol>
    </section>
  )
}

export function FicheQuestions({ label, nom, note, magasin }: { label: ExtractedLabel; nom: string; note: number | null; magasin: string | null }) {
  const questions = questionsFiche(nom, label, note, magasin)
  if (questions.length === 0) return null
  return (
    <section aria-labelledby="questions" className="flex flex-col gap-3">
      <h2 id="questions" className={H2}>{titleTypo(`Questions fréquentes sur ${nom}`)}</h2>
      <div className="flex flex-col gap-2">
        {questions.map((q) => (
          <details key={q.q} className="rounded-card border border-line bg-paper p-4">
            <summary className="cursor-pointer font-semibold text-ink">{titleTypo(q.q)}</summary>
            <p className="m-0 mt-2 text-[15px] leading-relaxed text-ink-2">{titleTypo(q.r)}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
