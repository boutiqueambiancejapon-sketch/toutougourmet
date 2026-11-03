import type { CompareGroup, CompareRow } from './compare-data'
import { Discount, FitLine, OfferButton, PickPill, Warning } from './CompareBits'

// @cdc affiliation — comparatif des fiches races sur mobile (hybride validé le 2026-11-03) :
// « Notre choix » en grande carte (façon B), puis les autres marques en lignes compactes
// groupées par profil (façon A). Pas de carrousel : on compare mal ce qu'on ne voit pas.

function Price({ row, priced }: { row: CompareRow; priced: boolean }) {
  if (!priced) return null
  return (
    <p className="m-0 shrink-0 text-right text-sm font-semibold whitespace-nowrap text-ink">
      {row.price ?? <span className="font-normal text-ink-2">non chiffré</span>}
      {row.price ? <span className="block text-xs font-normal text-ink-2">par jour</span> : null}
    </p>
  )
}

function NameBlock({ row }: { row: CompareRow }) {
  return (
    <div className="min-w-0">
      <p className="m-0 font-display text-lg leading-tight font-black text-ink">{row.name}</p>
      {row.format ? <p className="m-0 text-sm text-ink-2">{row.format}</p> : null}
    </div>
  )
}

function PickCard({ row, label, priced }: { row: CompareRow; label: string; priced: boolean }) {
  return (
    <div data-cta="race-compare-choix" className="grid gap-2.5 rounded-card border-[1.5px] border-ink bg-paper p-4 shadow-[4px_4px_0_var(--orange)]">
      <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold tracking-wide text-ink-2 uppercase">
        <PickPill />
        <span>{label}</span>
      </p>
      <div className="flex items-start justify-between gap-3">
        <NameBlock row={row} />
        <Price row={row} priced={priced} />
      </div>
      <FitLine row={row} />
      {row.warning ? <Warning text={row.warning} /> : null}
      {row.offer ? <Discount offer={row.offer} /> : null}
      <OfferButton row={row} full />
    </div>
  )
}

function CompactRow({ row, priced }: { row: CompareRow; priced: boolean }) {
  return (
    <li className="grid gap-2 border-t border-line p-3.5">
      <div className="flex items-start justify-between gap-3">
        <NameBlock row={row} />
        <Price row={row} priced={priced} />
      </div>
      <FitLine row={row} />
      {row.warning ? <Warning text={row.warning} /> : null}
      {row.offer ? (
        <div className="flex items-center justify-between gap-3">
          <Discount offer={row.offer} />
          <OfferButton row={row} />
        </div>
      ) : null}
    </li>
  )
}

export function CompareMobile({ groups, priced }: { groups: CompareGroup[]; priced: boolean }) {
  const pickGroup = groups.find((g) => g.rows.some((r) => r.pick))
  const pick = pickGroup?.rows.find((r) => r.pick)
  const rest = groups.map((g) => ({ ...g, rows: g.rows.filter((r) => !r.pick) })).filter((g) => g.rows.length)
  return (
    <div className="md:hidden">
      {pick && pickGroup ? <PickCard row={pick} label={pickGroup.label} priced={priced} /> : null}
      {rest.length ? (
        <div className="mt-5 overflow-hidden rounded-card border-[1.5px] border-ink bg-paper">
          {rest.map((g) => (
            <section key={g.label} aria-label={g.label} className="[&:not(:first-child)]:border-t [&:not(:first-child)]:border-line">
              <p className="m-0 bg-cream-2 px-3.5 py-2 text-xs font-semibold tracking-wide text-ink-2 uppercase">{g.label}</p>
              <ul role="list" className="m-0 list-none p-0">
                {g.rows.map((r) => (
                  <CompactRow key={r.key} row={r} priced={priced} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  )
}
