import type { PageDetail } from '@/lib/seo-dash/server/detail'
import type { Agg } from '@/lib/seo-dash/server/gsc-core'
import { COVERAGE_FR, groupOf } from '@/lib/seo-dash/server/indexation'
import { dayLabel, n0, n1, pct } from '@/lib/seo-dash/format'
import { QueryLink, RangeDot } from '../ui/Cells'
import { Card, Empty, Pending } from '../ui/Card'
import { StatusIcon, type Status } from '../shell/Icons'

// @cdc tableau de bord SEO — fiche d'une page : état (indexation, titre, liens reçus, vitesse) et requêtes.

function Row({ label, status, text, pending }: { label: string; status: Status; text: string; pending?: string }) {
  return (
    <tr>
      <td>
        {label}
        {pending ? <Pending>{pending}</Pending> : null}
      </td>
      <td>
        <span className="sd-st">
          <StatusIcon status={status} />
          {text}
        </span>
      </td>
    </tr>
  )
}

export function PageState({ d, vitals }: { d: PageDetail; vitals: { lcp: number | null; inp: number | null } }) {
  const insp = d.inspection
  const group = insp ? groupOf(insp.verdict, insp.coverage) : null
  const title = d.audit?.title ?? null
  const tl = title?.length ?? 0
  return (
    <Card title="État de la page">
      <div className="sd-tw">
        <table>
          <tbody>
            {insp ? (
              <Row label="Indexée dans Google" status={group === 'indexee' ? 'good' : 'warn'} text={group === 'indexee' ? 'Oui' : (COVERAGE_FR[insp.coverage ?? ''] ?? insp.coverage ?? 'Non')} />
            ) : (
              <Row label="Indexée dans Google" status="info" text="relevé de nuit à venir" pending="à collecter" />
            )}
            {vitals.lcp !== null ? (
              <Row label="Affichage mobile (LCP)" status={vitals.lcp <= 2500 ? 'good' : vitals.lcp <= 4000 ? 'warn' : 'crit'} text={`${n1(vitals.lcp / 1000)} s`} />
            ) : (
              <Row label="Affichage mobile (LCP)" status="info" text="pas encore assez de visites" pending="à collecter" />
            )}
            {vitals.inp !== null ? <Row label="Réactivité (INP)" status={vitals.inp <= 200 ? 'good' : vitals.inp <= 500 ? 'warn' : 'crit'} text={`${n0(vitals.inp)} ms`} /> : null}
            {title !== null ? <Row label="Titre" status={tl > 0 && tl <= 65 ? 'good' : 'warn'} text={`${tl} signes`} /> : <Row label="Titre" status="info" text="audit de nuit à venir" pending="à collecter" />}
            {d.audit ? <Row label="Liens internes reçus" status={d.audit.linksIn >= 3 ? 'good' : d.audit.linksIn > 0 ? 'warn' : 'crit'} text={`${n0(d.audit.linksIn)} page${d.audit.linksIn > 1 ? 's' : ''}`} /> : null}
            <Row label="Passages de Googlebot" status={d.googlebot.hits ? 'good' : 'warn'} text={d.googlebot.hits ? `${n0(d.googlebot.hits)}, dernier le ${dayLabel(d.googlebot.last ?? '')}` : 'aucun sur la période'} />
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function QueriesTable({ rows, query, title, desc, csv, limit = 15 }: { rows: Agg[]; query: string; title: string; desc: string; csv: string; limit?: number }) {
  return (
    <Card title={title} desc={desc} csv={csv}>
      {rows.length ? (
        <div className="sd-tw">
          <table>
            <thead>
              <tr>
                <th>Requête</th>
                <th className="sd-hide-m">Position (1 → 20)</th>
                <th className="num">Pos.</th>
                <th className="num">Affichages</th>
                <th className="num">Clics</th>
                <th className="num sd-hide-m">Taux</th>
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
                  <td className="num sd-hide-m">{pct(r.ctr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucune requête relevée sur la période.</Empty>
      )}
    </Card>
  )
}
