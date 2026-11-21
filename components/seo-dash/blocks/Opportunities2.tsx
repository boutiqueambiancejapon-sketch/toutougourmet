import { Fragment } from 'react'
import type { Cannibal, Decay } from '@/lib/seo-dash/server/gsc-opps'
import { n0, n1 } from '@/lib/seo-dash/format'
import { PageLink, QueryLink, RangeDot } from '../ui/Cells'
import { Card, Empty } from '../ui/Card'
import { Sparkline } from '../ui/Tile'

// @cdc tableau de bord SEO — pages qui se font concurrence sur une même recherche, pages qui s'essoufflent
// (13 semaines, premier mois contre dernier mois).

export function CannibalCard({ rows, total, query, csv, limit = 5 }: { rows: Cannibal[]; total: number; query: string; csv: string; limit?: number }) {
  return (
    <Card title="Pages qui se font concurrence" desc={`Une même recherche, plusieurs pages du site dans Google · ${n0(total)} cas`} csv={csv}>
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th className="sd-hide-m">Position 1 → 20</th>
                <th className="num">Pos.</th>
                <th className="num">Affich.</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map((c) => (
                <Fragment key={c.query}>
                  <tr>
                    <td className="grp u" colSpan={4}>
                      « <QueryLink text={c.query} query={query} /> » <span className="sd-muted sd-small">· {c.pages.length} pages</span>
                    </td>
                  </tr>
                  {c.pages.map((p) => (
                    <tr key={p.key}>
                      <td className="u">
                        <PageLink path={p.key} query={query} max={38} />
                      </td>
                      <td className="sd-hide-m">
                        <RangeDot position={p.position} />
                      </td>
                      <td className="num">{n1(p.position)}</td>
                      <td className="num">{n0(p.impressions)}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucune recherche partagée entre plusieurs pages.</Empty>
      )}
    </Card>
  )
}

export function DecayCard({ rows, query, csv, limit = 6 }: { rows: Decay[]; query: string; csv: string; limit?: number }) {
  return (
    <Card title="Pages qui s’essoufflent (3 mois)" desc="Dernier mois au moins 30 % sous le premier mois des 13 dernières semaines (clics par semaine)." csv={csv}>
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th className="sd-hide-m">13 semaines</th>
                <th className="num">1er mois</th>
                <th className="num">Dernier</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map((d) => (
                <tr key={d.page}>
                  <td className="u">
                    <PageLink path={d.page} query={query} />
                  </td>
                  <td className="sd-hide-m">
                    <Sparkline values={d.weeks} width={90} height={22} />
                  </td>
                  <td className="num">{n0(d.first)}</td>
                  <td className="num">{n0(d.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucune page en net recul sur trois mois.</Empty>
      )}
    </Card>
  )
}
