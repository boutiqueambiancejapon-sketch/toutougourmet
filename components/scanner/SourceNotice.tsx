import Link from 'next/link'
import type { AnalysisSource } from '@/db/schema'
import { AiNotice } from './AiNotice'

// @cdc lot 6 — provenance des données sous le résultat et sur les fiches. Open Pet Food Facts :
// mention de la base et de sa licence ODbL (obligation d'attribution). Photos : mention IA (AI Act).

export const OPFF_CREDIT = 'Données : Open Pet Food Facts, licence ODbL'

export function SourceNotice({ source, reviewed = false }: { source: AnalysisSource; reviewed?: boolean }) {
  if (source === 'photo') return <AiNotice reviewed={reviewed} />
  return (
    <p className="m-0 rounded-box border border-line bg-paper p-3 text-sm leading-relaxed text-ink-2">
      <strong className="font-semibold text-ink">
        {'Données : '}
        <a href="https://world.openpetfoodfacts.org" className="text-ink underline underline-offset-2" rel="noopener">
          Open Pet Food Facts
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
