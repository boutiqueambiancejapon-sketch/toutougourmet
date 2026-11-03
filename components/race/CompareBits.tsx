import { FIT_LABELS, type CompareOffer, type CompareRow, type Fit } from './compare-data'

// @cdc affiliation — petites pièces du comparatif des fiches races : pastilles, remise, boutons.
// Liens partenaires en rel="sponsored noopener" (comme components/mdx/MdxLink.tsx) ; le clic est
// mesuré par components/analytics/Tracking.tsx (Affiliate Click, place = data-cta le plus proche).

const FIT_CLASS: Record<Fit, string> = {
  'tres-adapte': 'bg-green text-green-ink',
  adapte: 'bg-green-bg text-green-ink',
  correct: 'bg-amber text-amber-ink',
}

const PILL = 'inline-block whitespace-nowrap rounded-pill px-2.5 py-0.5 text-xs font-semibold'

export function PickPill() {
  return <span className={`${PILL} bg-orange text-ink`}>Notre choix</span>
}

export function FitLine({ row }: { row: CompareRow }) {
  return (
    <p className="m-0 text-sm leading-snug text-ink">
      <span className={`${PILL} ${FIT_CLASS[row.fit]} mr-1.5`}>{FIT_LABELS[row.fit]}</span>
      {row.reason}
    </p>
  )
}

export function Warning({ text }: { text: string }) {
  return <p className="m-0 rounded-tile bg-rose-bg px-2.5 py-1.5 text-sm leading-snug text-rose-ink">{text}</p>
}

export function Discount({ offer }: { offer: CompareOffer }) {
  if (!offer.discount && !offer.code) return null
  return (
    <span className="text-sm font-semibold text-green-ink">
      {offer.discount}
      {offer.code ? (
        <>
          {offer.discount ? ' · ' : null}
          <span className="sr-only">code </span>
          <span className="whitespace-nowrap rounded-tile bg-ink px-1.5 py-0.5 font-mono text-xs text-amber">{offer.code}</span>
        </>
      ) : null}
    </span>
  )
}

const BUTTON =
  'inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-control px-4 font-semibold text-ink no-underline'

/** Bouton orange plein (« Notre choix ») ou bordé (les autres). */
export function OfferButton({ row, full = false }: { row: CompareRow; full?: boolean }) {
  if (!row.offer) return null
  const solid = row.pick
  return (
    <a
      href={row.offer.url}
      target="_blank"
      rel="sponsored noopener"
      className={`${BUTTON} ${solid ? 'bg-orange shadow-[0_3px_0_var(--orange-ink)]' : 'border-[1.5px] border-ink bg-paper'} ${full ? 'w-full' : ''}`}
    >
      {solid ? (
        <>
          Voir l&apos;offre<span className={full ? '' : 'sr-only'}>&nbsp;{row.name}</span>
        </>
      ) : (
        <>
          Voir<span className="sr-only"> l&apos;offre {row.name}</span>
        </>
      )}
    </a>
  )
}

export function Disclosure() {
  return (
    <p className="m-0 mt-3 text-xs text-ink-2">Liens partenaires&nbsp;: on touche une commission, ton prix ne change pas.</p>
  )
}
