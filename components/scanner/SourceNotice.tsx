import Link from 'next/link'
import type { AnalysisSource } from '@/db/schema'
import { AiNotice } from './AiNotice'

// @cdc lot 6 — provenance des données sous le résultat et sur les fiches. Open Pet Food Facts ou
// Open Food Facts : mention de la base et de sa licence ODbL (obligation d'attribution, y compris
// pour les fiches pré-notées par l'import hebdomadaire). Photos : mention IA (AI Act).

export const OPFF_CREDIT = 'Données : Open Pet Food Facts, licence ODbL'
export const OFF_CREDIT = 'Données : Open Food Facts, licence ODbL'

const OPEN_DATA = {
  openpetfoodfacts: { name: 'Open Pet Food Facts', url: 'https://world.openpetfoodfacts.org', credit: OPFF_CREDIT },
  openfoodfacts: { name: 'Open Food Facts', url: 'https://world.openfoodfacts.org', credit: OFF_CREDIT },
} as const

/** Mention ODbL d'une fiche issue d'une base ouverte, null pour une lecture de photos. */
export function openDataCredit(source: AnalysisSource): string | null {
  return source === 'photo' ? null : OPEN_DATA[source].credit
}

export function SourceNotice({ source, reviewed = false }: { source: AnalysisSource; reviewed?: boolean }) {
  if (source === 'photo') return <AiNotice reviewed={reviewed} />
  const base = OPEN_DATA[source]
  return (
    <p className="m-0 rounded-box border border-line bg-paper p-3 text-sm leading-relaxed text-ink-2">
      <strong className="font-semibold text-ink">
        {'Données : '}
        <a href={base.url} className="text-ink underline underline-offset-2" rel="noopener">
          {base.name}
        </a>
        {', licence '}
        <a href="https://opendatacommons.org/licenses/odbl/1-0/" className="text-ink underline underline-offset-2" rel="noopener license">
          ODbL
        </a>
        .
      </strong>{' '}
      Composition et constituants viennent de cette base ouverte, remplie par ses contributeurs : compare avec ton paquet. La note est
      calculée par notre barème, publié sur la page du{' '}
      <Link href="/scanner#methode" className="font-semibold text-orange-ink underline underline-offset-2">
        scanner
      </Link>
      .
    </p>
  )
}
