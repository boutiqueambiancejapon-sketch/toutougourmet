import type { CompareGroup, CompareRow } from './compare-data'
import { Discount, FitLine, OfferButton, PickPill, Warning } from './CompareBits'

// @cdc affiliation — comparatif des fiches races sur ordinateur : le vrai tableau de la version A,
// groupé par profil, la ligne « Notre choix » surlignée.

const TH = 'bg-ink px-3 py-2.5 text-left text-sm font-semibold text-cream'
const TD = 'border-t border-line p-3 align-top'

function Row({ row, priced }: { row: CompareRow; priced: boolean }) {
  return (
    <tr {...(row.pick ? { 'data-cta': 'race-compare-choix' } : {})} className={row.pick ? 'bg-amber-bg' : undefined}>
      <th scope="row" className={`${TD} text-left font-normal`}>
        {row.pick ? <PickPill /> : null}
        <span className={`block font-display text-lg leading-tight font-black text-ink ${row.pick ? 'mt-1' : ''}`}>{row.name}</span>
        {row.format ? <span className="block text-sm text-ink-2">{row.format}</span> : null}
      </th>
      <td className={TD}>
        <div className="grid gap-2">
          <FitLine row={row} />
          {row.warning ? <Warning text={row.warning} /> : null}
        </div>
      </td>
      {priced ? (
        <td className={`${TD} text-sm whitespace-nowrap`}>
          {row.price ? <span className="font-semibold text-ink">{row.price}</span> : <span className="text-ink-2">non chiffré</span>}
        </td>
      ) : null}
      <td className={TD}>{row.offer ? <Discount offer={row.offer} /> : <span className="text-sm text-ink-2">Pas de lien partenaire</span>}</td>
      <td className={`${TD} text-right`}>
        <OfferButton row={row} />
      </td>
    </tr>
  )
}

export function CompareTable({ groups, breed, priced }: { groups: CompareGroup[]; breed: string; priced: boolean }) {
  const cols = priced ? 5 : 4
  return (
    <table className="hidden w-full border-separate border-spacing-0 overflow-hidden rounded-card border-[1.5px] border-ink bg-paper md:table">
      <caption className="sr-only">Marques conseillées pour un {breed}</caption>
      <thead>
        <tr>
          <th scope="col" className={TH}>Marque</th>
          <th scope="col" className={TH}>Pour un {breed}</th>
          {priced ? <th scope="col" className={TH}>Prix par jour</th> : null}
          <th scope="col" className={TH}>Offre</th>
          <th scope="col" className={TH}>
            <span className="sr-only">Lien</span>
          </th>
        </tr>
      </thead>
      {groups.map((g) => (
        <tbody key={g.label}>
          <tr>
            <th scope="colgroup" colSpan={cols} className="border-t border-line bg-cream-2 px-3 py-2 text-left text-xs font-semibold tracking-wide text-ink-2 uppercase">
              {g.label}
            </th>
          </tr>
          {g.rows.map((r) => (
            <Row key={r.key} row={r} priced={priced} />
          ))}
        </tbody>
      ))}
    </table>
  )
}
