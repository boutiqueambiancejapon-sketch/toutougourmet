import type { ReactNode } from 'react'

// @cdc tableau de bord — briques de la fiche d'un compte et de la santé du scanner : carte, paires
// libellé et valeur, ligne de liste, bloc illisible. Lisibles à 390 px : tout passe à la ligne.

export function Card({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4">
      {title ? <h2 className="m-0 font-display text-lg font-black text-ink">{title}</h2> : null}
      {children}
    </section>
  )
}

export function KeyValues({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      {rows.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-ink-2">{key}</dt>
          <dd className="m-0 min-w-0 break-words font-semibold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Ligne : à gauche le sujet et son détail, à droite une note ou une pastille. */
export function ListRow({ main, detail, aside }: { main: ReactNode; detail?: ReactNode; aside?: ReactNode }) {
  return (
    <li className="flex items-start justify-between gap-3 border-t border-line py-2 text-sm first:border-t-0 first:pt-0">
      <span className="min-w-0 break-words text-ink">
        {main}
        {detail ? <small className="block text-xs text-ink-2">{detail}</small> : null}
      </span>
      {aside ? <span className="shrink-0">{aside}</span> : null}
    </li>
  )
}

export function Rows({ children }: { children: ReactNode }) {
  return <ul className="m-0 list-none p-0">{children}</ul>
}

export function Unreadable({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="m-0 rounded-box border border-amber bg-amber-bg px-3 py-2 text-sm text-amber-ink">
      {children}
    </p>
  )
}

export function Score({ value }: { value: number | null }) {
  return <b className="whitespace-nowrap font-display text-lg font-black text-ink">{value ?? '?'}</b>
}

const dayFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
const shortFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })

export const longDay = (d: Date): string => dayFmt.format(d)
export const shortMoment = (d: Date): string => shortFmt.format(d)
