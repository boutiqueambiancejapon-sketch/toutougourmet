// @cdc tableau de bord — total de la liste en tête, et nombre de résultats pendant une recherche.

const nf = new Intl.NumberFormat('fr-FR')

interface SummaryProps {
  total: number
  matched: number
  query: string
  /** Mis au pluriel selon le nombre. */
  noun: 'inscrit' | 'compte' | 'adresse'
  source: string
}

export function ListSummary({ total, matched, query, noun, source }: SummaryProps) {
  const plural = (n: number) => `${noun}${n > 1 ? 's' : ''}`
  return (
    <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p className="m-0 font-display text-3xl font-black tabular-nums text-ink">
        {nf.format(total)} <span className="text-lg font-bold">{plural(total)}</span>
      </p>
      <p className="m-0 text-sm text-ink-2">
        {query ? `${nf.format(matched)} ${matched > 1 ? 'résultats' : 'résultat'} pour la recherche. ` : ''}
        {source}
      </p>
    </div>
  )
}
