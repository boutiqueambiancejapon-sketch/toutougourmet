import type { ExplorationData } from '@/lib/seo-dash/server/exploration'
import type { ErrorRow } from '@/lib/seo-dash/server/crawl'
import { daysBetween } from '@/lib/seo-dash/server/range'
import { dayLabel, n0, shortPath } from '@/lib/seo-dash/format'
import { PageLink } from '../ui/Cells'
import { Card, Empty } from '../ui/Card'
import { BarList } from '../ui/BarList'

// @cdc tableau de bord SEO — Exploration : erreurs vues par les robots, pages jamais visitées, délais de prise en compte.

export function ErrorsCard({ rows, csv, title = 'Erreurs vues par les robots', limit = 10 }: { rows: ErrorRow[]; csv: string; title?: string; limit?: number }) {
  return (
    <Card title={title} desc="Googlebot (vérifié) et Bingbot · sondes de pirates retirées" csv={csv}>
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Adresse</th>
                <th>Code</th>
                <th className="num">Fois</th>
                <th className="num">Dernière</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map((r) => (
                <tr key={`${r.path}-${r.status}`}>
                  <td className="u" title={r.path}>
                    {shortPath(r.path, 34)}
                  </td>
                  <td>
                    <span className="sd-code">{r.status}</span>
                  </td>
                  <td className="num">{n0(r.hits)}</td>
                  <td className="num">{dayLabel(r.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucune erreur vue par les robots sur la période.</Empty>
      )}
    </Card>
  )
}

export function NeverCard({ never, csv }: { never: ExplorationData['never']; csv: string }) {
  return (
    <Card title="Pages jamais visitées par Googlebot" desc={`${n0(never.paths.length)} adresses du plan du site (sur ${n0(never.sitemap)}) sans aucun passage depuis le début des journaux`} csv={csv}>
      <BarList items={never.groups.slice(0, 10).map((g) => ({ key: g.group, label: g.group, value: g.count }))} empty="Toutes les adresses du plan du site ont été visitées." />
    </Card>
  )
}

function delay(from: string, to: string | null): string {
  if (!to) return 'pas encore'
  const n = daysBetween(from, to)
  return n <= 0 ? 'le jour même' : `+${n} j`
}

export function DelaysCard({ rows, query, csv }: { rows: ExplorationData['delays']; query: string; csv: string }) {
  return (
    <Card title="De la publication à Google" desc="Délai entre la mise en ligne, la première visite du robot et la première apparition dans les résultats" csv={csv}>
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th className="num">Publié</th>
                <th>1er passage Googlebot</th>
                <th>1er affichage</th>
                <th className="num">Clics</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.path}>
                  <td className="u">
                    <PageLink path={r.path} query={query} max={40} />
                  </td>
                  <td className="num">{dayLabel(r.date)}</td>
                  <td className={r.crawl ? 'sd-nw' : 'sd-nw sd-muted'}>{delay(r.date, r.crawl)}</td>
                  <td className={r.seen ? 'sd-nw' : 'sd-nw sd-muted'}>{delay(r.date, r.seen)}</td>
                  <td className="num">{n0(r.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Pas d’article récent.</Empty>
      )}
    </Card>
  )
}
