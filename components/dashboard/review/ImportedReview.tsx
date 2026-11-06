import Link from 'next/link'
import { decideImportedFiche } from '@/app/(admin)/tableau-de-bord/fiches/actions'
import { NOUNS } from '@/lib/scanner/food-noun'
import type { ImportedRow } from '@/lib/server/scanner-review'
import { Empty } from '../Panel'

// @cdc lot 6 — « Fiches à relire », vue « Fiches importées d'Open Pet Food Facts » : fiches
// pré-notées par l'import, ni relues ni écartées. Valider = relue, donc indexable comme une fiche
// relue ; Écarter = gardée pour le scanner, jamais indexée, même après un ré-import
// (food_analysis.discarded). Formulaires sans JavaScript, actions protégées (assertDashboardAction).

const BUTTON = 'min-h-11 rounded-control px-4 text-sm font-semibold'

function Decision({ row }: { row: ImportedRow }) {
  const name = [row.brand, row.product].filter(Boolean).join(' ') || 'cette fiche'
  return (
    <div className="flex flex-wrap gap-2">
      <form action={decideImportedFiche.bind(null, row.id, 'validate')}>
        <button type="submit" aria-label={`Valider ${name}`} className={`${BUTTON} bg-ink text-cream`}>
          Valider
        </button>
      </form>
      <form action={decideImportedFiche.bind(null, row.id, 'discard')}>
        <button type="submit" aria-label={`Écarter ${name}`} className={`${BUTTON} border-2 border-line-2 text-ink`}>
          Écarter
        </button>
      </form>
    </div>
  )
}

export function ImportedReview({ data }: { data: { rows: ImportedRow[]; total: number } | null }) {
  return (
    <section aria-labelledby="fiches-importees" className="mt-8 flex flex-col gap-3">
      <h3 id="fiches-importees" className="scroll-mt-20 font-display text-lg font-bold text-ink">
        Fiches importées d&apos;Open Pet Food Facts
      </h3>
      <p className="m-0 max-w-prose text-sm text-ink-2">
        Fiches notées par l&apos;import hebdomadaire, ni relues ni écartées. Valider rend la fiche indexable, comme une fiche relue.
        Écarter la garde pour le scanner sans jamais l&apos;indexer, même après un nouvel import.
        {data && data.total > data.rows.length ? ` ${data.rows.length} affichées sur ${data.total}.` : ''}
      </p>
      {data === null && <Empty>Base du scanner injoignable.</Empty>}
      {data !== null && data.rows.length === 0 && <Empty>Aucune fiche importée à relire.</Empty>}
      {data !== null && data.rows.length > 0 && (
        <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
          {data.rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 rounded-card border border-line bg-paper p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-col gap-1 text-sm">
                <Link href={`/tableau-de-bord/fiches/${r.id}`} className="font-semibold text-ink underline underline-offset-2">
                  {r.brand ?? 'Marque illisible'}
                </Link>
                <span className="text-ink-2">{r.product ?? 'Produit sans nom'}</span>
                <span className="flex flex-wrap gap-2 text-xs text-ink-2">
                  <span className="font-semibold text-ink">{`${r.score ?? '?'}/100`}</span>
                  <span>{NOUNS[r.noun].title}</span>
                  <span>{r.indexable ? 'Règle d\'indexation remplie' : 'Constituants incomplets'}</span>
                  <a href={`https://www.toutou-gourmet.com/croquettes/${r.slug}`} target="_blank" rel="noopener" className="underline underline-offset-2">
                    Voir la fiche
                  </a>
                </span>
              </div>
              <Decision row={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
