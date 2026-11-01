import { Children, isValidElement, type ReactNode } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

// @cdc seo-geo §2.7 — tableau par gabarit avec des races nommées.
// Vrai <table> rendu côté serveur : chaque ligne porte la race ET la quantité, pour
// qu'une IA qui cherche « [aliment] chihuahua » trouve un passage complet.
// Mobile : chaque ligne devient une carte. Les rôles ARIA gardent la sémantique de
// tableau quand l'affichage change (Safari la perd sinon).

export interface SizeRowProps {
  /** Tranche de poids, ex. « Moins de 5 kg ». */
  weight: string
  /** Deux ou trois races du gabarit, ex. « Chihuahua, Yorkshire, Spitz nain ». */
  breeds: string
  /** Quantité par prise, ex. « 1 rondelle (5 g) ». */
  amount: string
  /** Fréquence, ex. « 1 à 2 fois par semaine ». */
  frequency?: string
  /** Équivalent ou précision, ex. « 11 kcal, plafond friandises 25 kcal ». */
  detail?: string
}

/** Ligne déclarative lue par SizeTable. Seule, elle n'affiche rien. */
export function SizeRow(props: SizeRowProps): null {
  void props
  return null
}

interface SizeTableProps {
  /** Ce que mesure le tableau (affiché au-dessus, lu par les lecteurs d'écran). */
  caption: string
  /** Source ou méthode de calcul des quantités (§2.7 : jamais au hasard). */
  source?: string
  amountLabel?: string
  frequencyLabel?: string
  detailLabel?: string
  locale?: Locale
  children: ReactNode
}

function rowsFrom(children: ReactNode): SizeRowProps[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<SizeRowProps>(child) && child.type === SizeRow ? [child.props] : [],
  )
}

const cell = 'block md:table-cell md:border-b md:border-line md:px-4 md:py-3 md:align-top'
const mobileLabel = 'block text-[13px] font-semibold text-ink-2 md:hidden'

export function SizeTable({
  caption,
  source,
  amountLabel,
  frequencyLabel,
  detailLabel,
  locale = 'fr',
  children,
}: SizeTableProps) {
  const t = getDictionary(locale).article.sizeTable
  const rows = rowsFrom(children)
  const showFrequency = rows.some((r) => r.frequency)
  const showDetail = rows.some((r) => r.detail)
  const labels = {
    amount: amountLabel ?? t.amount,
    frequency: frequencyLabel ?? t.frequency,
    detail: detailLabel ?? t.detail,
  }
  const headers = [
    t.weight,
    t.breeds,
    labels.amount,
    ...(showFrequency ? [labels.frequency] : []),
    ...(showDetail ? [labels.detail] : []),
  ]

  return (
    <figure className="v2 my-8">
      <div className="md:overflow-x-auto md:rounded-card md:border md:border-line md:bg-paper">
        <table role="table" className="block w-full border-separate border-spacing-0 text-left md:table">
          <caption className="block pb-3 text-left font-display text-lg font-bold leading-snug text-balance text-ink md:table-caption md:px-5 md:pt-4">
            {caption}
          </caption>
          <thead role="rowgroup" className="sr-only md:not-sr-only md:table-header-group">
            <tr role="row">
              {headers.map((h) => (
                <th
                  key={h}
                  role="columnheader"
                  scope="col"
                  className="border-b border-line bg-cream-2 px-4 py-3 text-[13px] font-semibold text-ink-2"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            role="rowgroup"
            className="flex flex-col gap-3 md:table-row-group md:[&>tr:last-child>*]:border-b-0"
          >
            {rows.map((r) => (
              <tr
                key={r.weight}
                role="row"
                className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-card border border-line bg-paper p-4 md:table-row md:rounded-none md:border-0 md:bg-transparent md:p-0"
              >
                <th
                  role="rowheader"
                  scope="row"
                  className={`${cell} col-span-2 font-display text-lg font-bold text-ink md:whitespace-nowrap md:text-base`}
                >
                  {r.weight}
                </th>
                <td role="cell" className={`${cell} col-span-2 text-ink-2`}>
                  {r.breeds}
                </td>
                <td
                  role="cell"
                  className={`${cell} ${showFrequency ? '' : 'col-span-2'} rounded-box bg-amber-bg p-3 md:rounded-none md:bg-transparent`}
                >
                  <span aria-hidden="true" className={mobileLabel}>
                    {labels.amount}
                  </span>
                  <span className="font-semibold text-ink">{r.amount}</span>
                </td>
                {showFrequency && (
                  <td role="cell" className={`${cell} rounded-box bg-cream-2 p-3 text-ink md:rounded-none md:bg-transparent`}>
                    <span aria-hidden="true" className={mobileLabel}>
                      {labels.frequency}
                    </span>
                    {r.frequency ?? '—'}
                  </td>
                )}
                {showDetail && (
                  <td role="cell" className={`${cell} col-span-2 text-sm text-ink-2`}>
                    <span aria-hidden="true" className={mobileLabel}>
                      {labels.detail}
                    </span>
                    {r.detail ?? '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {source && <figcaption className="mt-3 text-sm text-ink-2">{source}</figcaption>}
    </figure>
  )
}
