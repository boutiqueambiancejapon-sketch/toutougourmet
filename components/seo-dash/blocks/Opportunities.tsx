import type { LowCtr, Striking } from '@/lib/seo-dash/server/gsc-opps'
import { n0, n1, pct } from '@/lib/seo-dash/format'
import { PageLink, QueryLink, RangeDot } from '../ui/Cells'
import { Card, Empty } from '../ui/Card'
import { Legend } from '../charts/parts'

// @cdc tableau de bord SEO — opportunités sans écrire de nouvelle page : requêtes à portée de main (5 à 20),
// pages qui reçoivent moins de clics que leur position ne le laisse attendre.

export function StrikingCard({ rows, total, query, csv, limit = 10 }: { rows: Striking[]; total: number; query: string; csv: string; limit?: number }) {
  const gain = rows.reduce((a, r) => a + r.gain, 0)
  return (
    <Card title="À portée de main (positions 5 à 20)" desc={`${n0(total)} requêtes avec assez d’affichages · + ${n0(gain)} clics possibles si chacune passait à 5 % de taux de clic`} csv={csv}>
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Requête</th>
                <th className="sd-hide-m">Position 1 → 20</th>
                <th className="num">Pos.</th>
                <th className="num">Affich.</th>
                <th className="num">Clics</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map((r) => (
                <tr key={r.key}>
                  <td className="u">
                    <QueryLink text={r.key} query={query} />
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
        <Empty>Aucune requête entre les positions 5 et 20 avec assez d’affichages.</Empty>
      )}
    </Card>
  )
}

/** Point = taux obtenu, trait = taux attendu à cette position, sur une même échelle (0 → max de la ligne). */
function CtrGauge({ got, expected }: { got: number; expected: number }) {
  const max = Math.max(got, expected) * 1.15 || 1
  const x = (v: number) => 6 + (v / max) * 88
  return (
    <svg width="100" height="12" viewBox="0 0 100 12" aria-hidden="true">
      <line x1="6" x2="94" y1="6" y2="6" stroke="var(--sd-line-2)" />
      <line x1={x(got)} x2={x(expected)} y1="6" y2="6" stroke="var(--sd-s1)" strokeWidth="2" opacity="0.35" />
      <line x1={x(expected)} x2={x(expected)} y1="1" y2="11" stroke="var(--sd-ink-2)" strokeWidth="1.5" />
      <circle cx={x(got)} cy="6" r="4" fill="var(--sd-s1)" stroke="var(--sd-card)" strokeWidth="2" />
    </svg>
  )
}

export function LowCtrCard({ rows, query, csv, limit = 8 }: { rows: LowCtr[]; query: string; csv: string; limit?: number }) {
  return (
    <Card title="Taux de clic sous l’attendu" desc="Pages du top 10 qui reçoivent moins de clics que leur position le laisse attendre : titre et description à revoir." csv={csv}>
      <Legend
        items={[
          { label: 'taux obtenu', color: 'var(--sd-s1)', shape: 'pin' },
          { label: 'attendu à cette position', color: 'var(--sd-ink-2)', shape: 'line' },
        ]}
      />
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th className="sd-hide-m">Taux de clic</th>
                <th className="num">Obtenu</th>
                <th className="num">Pos.</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map((r) => (
                <tr key={r.key}>
                  <td className="u">
                    <PageLink path={r.key} query={query} />
                  </td>
                  <td className="sd-hide-m">
                    <CtrGauge got={r.ctr} expected={r.expected} />
                  </td>
                  <td className="num">{pct(r.ctr)}</td>
                  <td className="num">{n1(r.position)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucune page du top 10 nettement sous le taux attendu.</Empty>
      )}
    </Card>
  )
}
