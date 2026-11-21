import type { DeltaRow } from '@/lib/seo-dash/server/gsc-core'
import { n0 } from '@/lib/seo-dash/format'
import { BarIn, PageLink, QueryLink } from '../ui/Cells'
import { Card, Empty } from '../ui/Card'
import { Legend } from '../charts/parts'

// @cdc tableau de bord SEO — gagnées et perdues : écart de clics entre les deux périodes, en hausse (bleu) puis en
// baisse (rouge), une paire qui se lit comme opposée ; le signe est aussi écrit dans la colonne Écart.

interface Props {
  title: string
  desc: string
  up: DeltaRow[]
  down: DeltaRow[]
  kind: 'query' | 'page'
  query: string
  csv: string
}

const sign = (n: number) => (n > 0 ? `+${n0(n)}` : n < 0 ? `−${n0(-n)}` : '0')

export function DeltaTable({ title, desc, up, down, kind, query, csv }: Props) {
  const rows = [...up, ...down]
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.diff)))
  return (
    <Card title={title} desc={desc} csv={csv}>
      <Legend
        items={[
          { label: 'en hausse', color: 'var(--sd-up)', shape: 'box' },
          { label: 'en baisse', color: 'var(--sd-down)', shape: 'box' },
        ]}
      />
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>{kind === 'query' ? 'Requête' : 'Page'}</th>
                <th className="sd-hide-m" aria-hidden="true" />
                <th className="num">Écart</th>
                <th className="num">Clics</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="u">{kind === 'query' ? <QueryLink text={r.key} query={query} /> : <PageLink path={r.key} query={query} />}</td>
                  <td className="sd-hide-m">
                    <BarIn value={r.diff} max={max} color={r.diff > 0 ? 'var(--sd-up)' : 'var(--sd-down)'} />
                  </td>
                  <td className="num">{sign(r.diff)}</td>
                  <td className="num">{n0(r.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Pas d’écart à montrer sur cette période.</Empty>
      )}
    </Card>
  )
}
