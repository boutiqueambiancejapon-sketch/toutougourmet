import type { Agg } from '@/lib/seo-dash/server/gsc-core'
import { n0, n1 } from '@/lib/seo-dash/format'
import { PageLink, RangeDot } from '../ui/Cells'
import { Card, Empty } from '../ui/Card'

// @cdc tableau de bord SEO — pages du site que Google montre pour une requête (plusieurs = concurrence interne).

export function PagesOfQuery({ rows, query, csv }: { rows: Agg[]; query: string; csv: string }) {
  return (
    <Card title="Pages du site sur cette requête" csv={csv}>
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th className="sd-hide-m">Position (1 → 20)</th>
                <th className="num">Pos.</th>
                <th className="num">Affich.</th>
                <th className="num">Clics</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="u">
                    <PageLink path={r.key} query={query} max={36} />
                  </td>
                  <td className="sd-hide-m">
                    <RangeDot position={r.position} />
                  </td>
                  <td className="num">{n1(r.position)}</td>
                  <td className="num">{n0(r.impressions)}</td>
                  <td className="num">{n0(r.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucune page relevée sur la période.</Empty>
      )}
    </Card>
  )
}
