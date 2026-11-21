import { SITE } from '@/lib/seo-dash/config'
import { lastLabel, isHourly } from '@/lib/seo-dash/filters'
import { dayLabel, eur, n0, n1, pct, pct0 } from '@/lib/seo-dash/format'
import { csvHref, hrefOf } from '@/lib/seo-dash/nav'
import { openSeoPage, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { revenueData } from '@/lib/seo-dash/server/revenue'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Tile } from '@/components/seo-dash/ui/Tile'
import { Card } from '@/components/seo-dash/ui/Card'
import { Bars } from '@/components/seo-dash/charts/Bars'
import { ByPage, ByPartner } from '@/components/seo-dash/blocks/RevenueTables'

// @cdc tableau de bord SEO — Revenus : quelles pages rapportent, et combien (estimation, ventes réelles du mois quand
// elles sont enregistrées). Objectif du premier palier : SITE.goalMonthly par mois.

export const dynamic = 'force-dynamic'

const COLORS = ['var(--sd-s1)', 'var(--sd-s2)', 'var(--sd-s3)', 'var(--sd-s4)']

export default async function RevenuePage(props: SeoPageProps) {
  const { filters: f, query } = await openSeoPage(props)
  const unit = isHourly(f) ? 'heure' : 'jour'
  const res = await readBlock('revenus', null, (pool) => revenueData(pool, f))
  const d = res.value
  const share = d ? Math.min(1, d.month.amount / SITE.goalMonthly) : 0
  return (
    <SeoShell current="revenus" title="Revenus" sub="Quelles pages rapportent, et combien (estimation)" filters={f} path={hrefOf('revenus')} hide={['compare']} fresh={`Clics suivis depuis le ${dayLabel(SITE.logsStart)}`}>
      {d ? (
        <>
          <div className="sd-grid sd-g4 k2">
            <Tile label={`Revenus estimés, ${lastLabel(f.period)}`} value={eur(d.revenue)} hero note="estimation : clients estimés × valeur d’un client">
              <div className="sd-meter" role="img" aria-label={`${pct0(share)} de l’objectif`}>
                <i style={{ width: `${share * 100}%` }} />
              </div>
              <div className="sd-cmp">{`${eur(d.month.amount)} en ${d.month.label} (${d.month.note}) · ${pct(share)} du premier objectif (${n0(SITE.goalMonthly)} € par mois)`}</div>
            </Tile>
            <Tile label="Visites des pages qui vendent" value={n0(d.sellingVisits)} note="les 10 pages avec le plus de clics partenaires" />
            <Tile label="Clics partenaires" value={n0(d.clicks)} note={d.views ? `${pct(d.clicks / d.views)} des pages vues` : undefined} />
            <Tile label="Clients estimés" value={n1(d.clients)} note="Dog Chef et Franklin seulement" />
          </div>
          <div className="sd-grid sd-g3 sd-gap">
            <div className="sd-span2">
              <Card title={`Clics partenaires par ${unit}`} desc="Les revenus suivent les clics Dog Chef et Franklin ; les autres n’ont pas encore de valeur">
                <Bars labels={d.days.map(dayLabel)} series={d.byBrandDay.map((b, i) => ({ key: b.brand, label: b.brand, color: COLORS[i] ?? 'var(--sd-prev)', values: b.values }))} label={`Clics partenaires par ${unit} et par marque`} />
              </Card>
            </div>
            <ByPartner brands={d.brands} csv={csvHref('partenaires', query)} />
          </div>
          <div className="sd-gap">
            <ByPage pages={d.pages} query={query} csv={csvHref('revenus-pages', query)} />
          </div>
          <p className="sd-note sd-gap">
            Ventes réelles : le total du mois reprend les commissions saisies dans le centre de contrôle quand il y en a. Les taux de clients (Dog Chef {pct0(SITE.clientRate['Dog Chef'] ?? 0)}, Franklin {pct0(SITE.clientRate.Franklin ?? 0)}) sont recalés chaque mois.
          </p>
        </>
      ) : (
        <p className="sd-note warn">Lecture des revenus impossible pour l’instant.</p>
      )}
    </SeoShell>
  )
}
