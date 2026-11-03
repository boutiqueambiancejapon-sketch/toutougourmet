import Link from 'next/link'
import type { ReviewRow } from '@/lib/server/scanner-review'
import { Empty, SectionTitle } from './Panel'

// @cdc lot 6 — « Fiches à relire » : fiches du scanner non relues (noindex), puis fiches relues
// qui ont un signalement à traiter. Chaque ligne ouvre la page de relecture privée.

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Europe/Paris' })
const SOURCE: Record<ReviewRow['source'], string> = { photo: 'Photos (IA)', openpetfoodfacts: 'Open Pet Food Facts', openfoodfacts: 'Open Food Facts' }

export function ReviewSection({ rows, error }: { rows: ReviewRow[]; error: boolean }) {
  return (
    <>
      <SectionTitle
        id="fiches"
        title="Fiches à relire"
        intro="Une fiche relue et validée devient indexable et entre dans le classement /croquettes. Les signalements des lecteurs s'affichent sur chaque fiche."
      />
      <div className="mt-4">
        {error && <Empty>Base du scanner injoignable.</Empty>}
        {!error && rows.length === 0 && <Empty>Aucune fiche à relire.</Empty>}
        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-card border border-line bg-paper">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-2">
                  <th scope="col" className="px-3 py-2 font-semibold">Date</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Marque et produit</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Note</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Source</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Signalements</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 align-top">
                    <td className="whitespace-nowrap px-3 py-2 text-ink-2">
                      <time dateTime={r.createdAt.toISOString()}>{dateFmt.format(r.createdAt)}</time>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/tableau-de-bord/fiches/${r.id}`} className="font-semibold text-ink underline underline-offset-2">
                        {r.brand ?? 'Marque illisible'}
                      </Link>
                      <span className="block text-ink-2">{r.product ?? 'Produit sans nom'}</span>
                      {r.reviewed && <span className="mt-1 inline-block rounded-pill bg-green-bg px-2 py-0.5 text-xs font-semibold text-green-ink">Relue</span>}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-ink">{r.score ?? '?'}</td>
                    <td className="px-3 py-2 text-ink-2">{SOURCE[r.source]}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${r.openReports > 0 ? 'text-rose-ink' : 'text-ink-2'}`}>{r.openReports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
