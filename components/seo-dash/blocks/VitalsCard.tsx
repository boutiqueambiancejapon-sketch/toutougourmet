import type { CruxResult } from '@/lib/seo-dash/server/crux'
import type { GroupVitals, VitalName, VitalStat } from '@/lib/seo-dash/server/vitals'
import { n0, n1, n2, pct0 } from '@/lib/seo-dash/format'
import { StatusIcon } from '../shell/Icons'
import { Card, Empty, Pending } from '../ui/Card'
import { Legend } from '../charts/parts'

// @cdc tableau de bord SEO — Core Web Vitals : mesures de nos visiteurs mobiles (balise web-vitals), une barre
// bon / à améliorer / mauvais par métrique, 75e centile au survol, verdict par groupe. CrUX en second, si la clé existe.

const METRICS: { key: VitalName; label: string }[] = [
  { key: 'LCP', label: 'Affichage (LCP)' },
  { key: 'INP', label: 'Réactivité (INP)' },
  { key: 'CLS', label: 'Stabilité (CLS)' },
]

const p75Text = (k: VitalName, v: number) => (k === 'CLS' ? n2(v) : k === 'LCP' ? `${n1(v / 1000)} s` : `${n0(v)} ms`)

function Stack({ s, k }: { s: Pick<VitalStat, 'good' | 'needs' | 'poor'> & { p75: number }; k: VitalName }) {
  const parts = [
    { v: s.good, c: 'var(--sd-good)', l: 'bon' },
    { v: s.needs, c: 'var(--sd-warn)', l: 'à améliorer' },
    { v: s.poor, c: 'var(--sd-crit)', l: 'mauvais' },
  ]
  return (
    <div className="sd-seg-bar" role="img" aria-label={`${k} : 75e centile ${p75Text(k, s.p75)}, ${parts.map((p) => `${p.l} ${pct0(p.v)}`).join(', ')}`} title={`75e centile : ${p75Text(k, s.p75)}`}>
      {parts.map((p) => (p.v > 0 ? <i key={p.l} style={{ flexGrow: p.v, background: p.c }} /> : null))}
    </div>
  )
}

function verdict(m: GroupVitals['metrics']): 'good' | 'warn' | 'crit' {
  const all = Object.values(m)
  if (all.some((s) => s && s.poor > 0.25)) return 'crit'
  if (all.every((s) => s && s.good >= 0.75)) return 'good'
  return 'warn'
}
const VERDICT = { good: 'Réussi', warn: 'À améliorer', crit: 'Mauvais' }

export function VitalsCard({ groups, samples, crux }: { groups: GroupVitals[]; samples: number; crux: { configured: boolean; phone: CruxResult | null; error: string | null } }) {
  return (
    <Card title="Core Web Vitals par groupe de pages" desc={`Mesurés chez nos visiteurs sur mobile, 28 jours (${n0(samples)} mesures) · seuils de Google`}>
      <Legend items={[{ label: 'bon', color: 'var(--sd-good)', shape: 'box' }, { label: 'à améliorer', color: 'var(--sd-warn)', shape: 'box' }, { label: 'mauvais', color: 'var(--sd-crit)', shape: 'box' }]} />
      {groups.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Groupe de pages</th>
                {METRICS.map((m) => (
                  <th key={m.key}>{m.label}</th>
                ))}
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const v = verdict(g.metrics)
                return (
                  <tr key={g.group}>
                    <td>{g.group}</td>
                    {METRICS.map((m) => (
                      <td key={m.key} className="sd-vital">
                        {g.metrics[m.key] ? <Stack s={g.metrics[m.key] as VitalStat} k={m.key} /> : <span className="sd-muted sd-small">trop peu</span>}
                      </td>
                    ))}
                    <td>
                      <span className="sd-st">
                        <StatusIcon status={v} />
                        {VERDICT[v]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Collecte en cours : les premières mesures arrivent avec les visites (5 par groupe au moins).</Empty>
      )}
      <h3 className="sd-gap">
        Données Chrome (CrUX), tout le site sur mobile {crux.configured ? null : <Pending>À connecter</Pending>}
      </h3>
      {crux.phone && Object.keys(crux.phone.metrics).length ? (
        <div className="sd-kv">
          {METRICS.map((m) => {
            const s = crux.phone?.metrics[m.key]
            return s ? (
              <span key={m.key}>
                {m.label} : <b>{p75Text(m.key, s.p75)}</b> ({pct0(s.good)} bon)
              </span>
            ) : null
          })}
        </div>
      ) : (
        <p className="sd-small sd-muted">
          {crux.configured ? (crux.error ? `CrUX ne répond pas (${crux.error}).` : 'Chrome n’a pas encore assez de visites pour ce site.') : 'Il faut une clé gratuite Google (API CrUX) dans le fichier de secrets du serveur.'}
        </p>
      )}
    </Card>
  )
}
