import type { TechniqueData } from '@/lib/seo-dash/server/technique'
import { pageTypeLabel } from '@/lib/seo-dash/config'
import { n0, shortPath } from '@/lib/seo-dash/format'
import { PageLink } from '../ui/Cells'
import { Card, Empty } from '../ui/Card'

// @cdc tableau de bord SEO — Technique : liens cassés, pages orphelines, titres et descriptions (signalés, jamais
// réécrits sans l'accord du propriétaire).

export function BrokenCard({ d, csv }: { d: TechniqueData; csv: string }) {
  const rows = [
    ...d.broken.map((b) => ({ path: b.path, status: b.status, n: b.from, cause: `lien interne depuis ${b.from} page${b.from > 1 ? 's' : ''}`, example: b.example })),
    ...d.robot404.filter((r) => !d.broken.some((b) => b.path === r.path)).map((r) => ({ path: r.path, status: r.status, n: r.hits, cause: 'demandée par un robot', example: null })),
  ]
  return (
    <Card title="Liens cassés" desc="Liens internes qui mènent à une erreur (audit de nuit), puis adresses en erreur demandées par Googlebot ou Bingbot" csv={csv}>
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Adresse</th>
                <th>Code</th>
                <th className="num">Fois</th>
                <th>Cause probable</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 12).map((r) => (
                <tr key={`${r.path}-${r.status}`}>
                  <td className="u" title={r.example ? `ex. depuis ${r.example}` : r.path}>
                    {shortPath(r.path, 36)}
                  </td>
                  <td>
                    <span className="sd-code">{r.status}</span>
                  </td>
                  <td className="num">{n0(r.n)}</td>
                  <td className="sd-small">{r.cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucun lien cassé repéré.</Empty>
      )}
    </Card>
  )
}

export function OrphansCard({ d, query, csv }: { d: TechniqueData; query: string; csv: string }) {
  return (
    <Card title="Pages orphelines" desc="Pages du plan du site qu’aucune autre page ne cite (liens internes relevés chaque nuit)" csv={csv}>
      {d.orphans.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {d.orphans.slice(0, 12).map((o) => (
                <tr key={o.path}>
                  <td className="u">
                    <PageLink path={o.path} query={query} />
                  </td>
                  <td>{pageTypeLabel(o.type)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{d.audited ? 'Aucune page orpheline.' : 'Audit de nuit à venir : premiers résultats demain matin.'}</Empty>
      )}
    </Card>
  )
}

export function TitlesCard({ d, csv }: { d: TechniqueData; csv: string }) {
  return (
    <Card title="Titres et descriptions" desc={`Lu dans les pages à chaque audit de nuit (${n0(d.audited)} pages) · signalé seulement, rien n’est réécrit sans votre accord`} csv={csv}>
      {d.titles.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Problème</th>
                <th className="num">Pages</th>
                <th className="sd-hide-m">Exemples</th>
              </tr>
            </thead>
            <tbody>
              {d.titles.map((t) => (
                <tr key={t.kind}>
                  <td>{t.label}</td>
                  <td className="num">{n0(t.pages.length)}</td>
                  <td className="u sd-hide-m sd-small">{t.pages.slice(0, 3).map((p) => `${p.path.split('/').pop()}${p.detail ? ` (${p.detail})` : ''}`).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{d.audited ? 'Rien à signaler.' : 'Audit de nuit à venir : premiers résultats demain matin.'}</Empty>
      )}
    </Card>
  )
}
