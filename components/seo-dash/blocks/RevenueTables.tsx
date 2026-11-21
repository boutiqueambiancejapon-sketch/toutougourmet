import type { RevenueData } from '@/lib/seo-dash/server/revenue'
import { eur, n0, n1, pct0 } from '@/lib/seo-dash/format'
import { PageLink } from '../ui/Cells'
import { Card, Empty } from '../ui/Card'
import { BarList } from '../ui/BarList'

// @cdc tableau de bord SEO — Revenus : par partenaire, puis par page (visites → clics → clients → euros).

export function ByPartner({ brands, csv }: { brands: RevenueData['brands']; csv: string }) {
  return (
    <Card title="Par partenaire" desc="Valeur d’un client : Dog Chef 50 €, Franklin 10 € ; les autres : valeur inconnue" csv={csv}>
      <BarList items={brands.map((b) => ({ key: b.brand, label: b.brand, value: b.clicks, text: `${n0(b.clicks)} · ${b.revenue === null ? '?' : eur(b.revenue)}` }))} />
    </Card>
  )
}

export function ByPage({ pages, query, csv }: { pages: RevenueData['pages']; query: string; csv: string }) {
  return (
    <Card title="Par page : visites → clics → clients → euros" desc="Une ligne par page, triée par clics partenaires" csv={csv}>
      {pages.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th className="num">Visites</th>
                <th className="num">Clics part.</th>
                <th className="num">Taux</th>
                <th className="num">Clients est.</th>
                <th className="num">Revenu est.</th>
                <th className="sd-hide-m">Marques</th>
              </tr>
            </thead>
            <tbody>
              {pages.slice(0, 15).map((p) => (
                <tr key={p.page}>
                  <td className="u">
                    <PageLink path={p.page} query={query} />
                  </td>
                  <td className="num">{n0(p.visits)}</td>
                  <td className="num">{n0(p.clicks)}</td>
                  <td className="num">{p.visits ? pct0(p.clicks / p.visits) : '—'}</td>
                  <td className="num">{p.clients ? n1(p.clients) : '—'}</td>
                  <td className="num">{p.revenue ? eur(p.revenue) : '—'}</td>
                  <td className="sd-hide-m">
                    <span className="sd-tags">
                      {p.brands.slice(0, 3).map((b) => (
                        <span key={b.brand} className="sd-tag">{`${b.brand} ${b.n}`}</span>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucun clic partenaire sur la période.</Empty>
      )}
    </Card>
  )
}
