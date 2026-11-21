import { INDEX_GROUPS, type IndexationData } from '@/lib/seo-dash/server/indexation'
import { n0, pct0 } from '@/lib/seo-dash/format'
import { Card, Empty } from '../ui/Card'
import { Legend } from '../charts/parts'

// @cdc tableau de bord SEO — indexation par type de page : une barre segmentée par type (parts proportionnelles,
// 2 px de fond entre parts, nom et nombre de chaque part au survol), puis les raisons données par Google.

export function SegBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  return (
    <div className="sd-seg-bar" role="img" aria-label={INDEX_GROUPS.map((g) => `${g.label} : ${counts[g.key] ?? 0}`).join(', ')}>
      {INDEX_GROUPS.map((g) => {
        const n = counts[g.key] ?? 0
        return n ? <i key={g.key} title={`${g.label} : ${n0(n)}`} style={{ flexGrow: n / Math.max(1, total), background: g.color }} /> : null
      })}
    </div>
  )
}

export function IndexationCard({ data, csv }: { data: IndexationData; csv: string }) {
  return (
    <Card
      title="État dans Google par type de page"
      desc={
        data.checked
          ? `Inspection d’URL de Google, ${n0(data.checked)} adresses relevées (au plus 2 000 par nuit).`
          : 'À collecter : l’inspection d’URL de Google tourne chaque nuit (2 000 adresses au plus) ; les premiers résultats arrivent demain matin.'
      }
      csv={data.checked ? csv : undefined}
    >
      <Legend items={INDEX_GROUPS.map((g) => ({ label: g.label, color: g.color, shape: 'box' as const }))} />
      {data.types.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Type de page</th>
                <th className="sd-hide-m">État dans Google</th>
                <th className="num">Indexées</th>
                <th className="num">Pages</th>
              </tr>
            </thead>
            <tbody>
              {data.types.map((t) => (
                <tr key={t.type}>
                  <td>{t.label}</td>
                  <td className="sd-hide-m sd-wide">
                    <SegBar counts={t.counts} total={t.total} />
                  </td>
                  <td className="num">{pct0(t.counts.indexee / Math.max(1, t.total))}</td>
                  <td className="num">{n0(t.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Pas encore de relevé.</Empty>
      )}
      {data.reasons.length ? (
        <>
          <h3 className="sd-gap">Raisons données par Google</h3>
          <div className="sd-tw">
            <table>
              <tbody>
                {data.reasons.slice(0, 8).map((r) => (
                  <tr key={r.reason}>
                    <td>{r.reason}</td>
                    <td className="num">{n0(r.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </Card>
  )
}
