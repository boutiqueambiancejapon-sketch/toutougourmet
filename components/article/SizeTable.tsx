import { Children, isValidElement, type ReactNode } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

// @cdc seo-geo §2.7 — tableau par gabarit avec des races nommées.
// Vrai <table> rendu côté serveur : chaque ligne porte la race ET la quantité, pour
// qu'une IA qui cherche « [aliment] chihuahua » trouve un passage complet.
// Mobile : une ligne par poids, le poids à gauche et la dose à droite, races, fréquence et précision
// à la suite en petit dessous (audit mobile 2026-11-04 : 7 cartes prenaient deux écrans). Une fréquence commune à
// toutes les lignes passe en note au-dessus. Les rôles ARIA gardent la sémantique de tableau quand
// l'affichage change (Safari la perd sinon).

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

const cell = 'md:table-cell md:border-b md:border-line md:px-4 md:py-3 md:align-top'
const small = 'text-[13px] leading-snug text-ink-2 md:text-base md:leading-normal'

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
  const sameFrequency = showFrequency && rows.every((r) => r.frequency === rows[0].frequency) ? rows[0].frequency : undefined
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
            {sameFrequency ? (
              <span className="mt-1 block font-body text-sm font-normal text-ink-2 md:hidden">{`${labels.frequency} : ${sameFrequency}`}</span>
            ) : null}
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
          <tbody role="rowgroup" className="block rounded-card border border-line bg-paper px-3.5 md:table-row-group md:rounded-none md:border-0 md:bg-transparent md:px-0 md:[&>tr:last-child>*]:border-b-0">
            <tr aria-hidden="true" className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-xs font-semibold text-ink-2 md:hidden">
              <td>{t.weight}</td>
              <td className="text-right">{labels.amount}</td>
            </tr>
            {rows.map((r) => (
              <tr
                key={r.weight}
                role="row"
                className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 border-b border-line py-2.5 before:order-2 before:h-0 before:basis-full last:border-b-0 md:table-row md:before:hidden"
              >
                <th role="rowheader" scope="row" className={`${cell} text-left font-semibold text-ink md:whitespace-nowrap md:font-display md:font-bold`}>
                  {r.weight}
                </th>
                <td role="cell" className={`${cell} ${small} order-3`}>
                  {r.breeds}
                </td>
                <td role="cell" className={`${cell} order-1 ml-auto max-w-[72%] text-right font-semibold text-ink md:ml-0 md:max-w-none md:text-left`}>
                  {r.amount}
                </td>
                {showFrequency && (
                  <td role="cell" className={`${cell} ${small} order-4 ${sameFrequency ? 'hidden' : ''} md:text-ink`}>
                    <span aria-hidden="true" className="md:hidden">·&nbsp;</span>
                    {r.frequency ?? '—'}
                  </td>
                )}
                {showDetail && (
                  <td role="cell" className={`${cell} ${small} order-5 md:text-sm`}>
                    <span aria-hidden="true" className="md:hidden">·&nbsp;</span>
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
