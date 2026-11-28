import Link from 'next/link'
import { deltaOf, n0, n1, pct0 } from '@/lib/seo-dash/format'
import { hrefOf } from '@/lib/seo-dash/nav'
import { per100, perVisit, type SourceRow } from '@/lib/seo-dash/server/sources'
import { CONVERSIONS } from '@/lib/seo-dash/server/visits'
import { Card, Empty } from '../ui/Card'
import { Sparkline } from '../ui/Tile'
import './sources.css'

// @cdc tableau de bord SEO — Sources : tableau d'une famille (ou des moteurs hors Google). Visites, part, écart contre
// la période d'avant, pages par visite, clics partenaires et inscriptions pour 100 visites ; chaque nom ouvre son détail.

export function sourceHref(key: string, query: string): string {
  const q = new URLSearchParams(query.replace(/^\?/, ''))
  q.set('s', key)
  return hrefOf(`sources/source?${q.toString()}`)
}

const rate = (v: number | null) => (v === null ? '—' : n1(v))

export function Delta({ cur, prev }: { cur: number; prev: number | null }) {
  if (prev === null) return <span className="sd-zero">—</span>
  const d = deltaOf(cur, prev)
  return <span className={`sd-delta ${d.tone}`}>{d.text}</span>
}

interface Props {
  title: string
  desc?: string
  rows: SourceRow[]
  /** Visites de référence pour la part (famille ou total). */
  base: number
  query: string
  csv?: string
  spark?: boolean
  color?: string
  /** Lignes de pages : le lien mène au détail de la page. */
  linkOf?: (r: SourceRow) => string
  labelOf?: (r: SourceRow) => string
  empty?: string
  first?: string
  id?: string
}

export function SourceTable({ title, desc, csv, id, ...rest }: Props) {
  return (
    <Card title={title} desc={desc} csv={csv} id={id}>
      <SourceRows {...rest} />
    </Card>
  )
}

type RowsProps = Omit<Props, 'title' | 'desc' | 'csv' | 'id'>

/** Le tableau seul (dans une carte qui a déjà son titre). */
export function SourceRows({ rows, base, query, spark = false, color, linkOf, labelOf, empty = 'Aucune visite sur la période.', first = 'Source' }: RowsProps) {
  return rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>{first}</th>
                {spark ? <th aria-label="Évolution" /> : null}
                <th className="num">Visites</th>
                <th className="num sd-hide-s">Part</th>
                <th className="num">Écart</th>
                <th className="num sd-hide-s">Pages/visite</th>
                <th className="num" title={`${CONVERSIONS.clicks} pour 100 visites`}>Clics /100</th>
                <th className="num sd-hide-s" title={`${CONVERSIONS.signups} pour 100 visites`}>Inscr. /100</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="u">
                    <Link href={linkOf ? linkOf(r) : sourceHref(r.key, query)} title={linkOf ? r.key : r.name}>
                      {color ? (
                        <span className="sd-fam">
                          <i style={{ background: color }} aria-hidden="true" />
                          {labelOf ? labelOf(r) : r.name}
                        </span>
                      ) : labelOf ? (
                        labelOf(r)
                      ) : (
                        r.name
                      )}
                    </Link>
                    {r.top ? <span className="sd-land">→ {r.top}{r.pages && r.pages > 1 ? ` · +${r.pages - 1} autre${r.pages > 2 ? 's' : ''}` : ''}{r.utm ? ` · campagne ${r.utm}` : ''}</span> : null}
                  </td>
                  {spark ? (
                    <td>
                      <span className="sd-spark">
                        <Sparkline values={r.spark} width={64} height={22} />
                      </span>
                    </td>
                  ) : null}
                  <td className="num">{n0(r.visits)}</td>
                  <td className="num sd-hide-s">{base > 0 ? pct0(r.visits / base) : '—'}</td>
                  <td className="num">
                    <Delta cur={r.visits} prev={r.prev} />
                  </td>
                  <td className="num sd-hide-s">{rate(perVisit(r))}</td>
                  <td className="num">{rate(per100(r.clicks, r.visits))}</td>
                  <td className="num sd-hide-s">{rate(per100(r.signups, r.visits))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  ) : (
    <Empty>{empty}</Empty>
  )
}
