import { n0, pct0 } from '@/lib/seo-dash/format'
import { csvHref } from '@/lib/seo-dash/nav'
import { liveSummary } from '@/lib/seo-dash/server/live'
import { openSeoPage, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Tile } from '@/components/seo-dash/ui/Tile'
import { Card } from '@/components/seo-dash/ui/Card'
import { BarList } from '@/components/seo-dash/ui/BarList'
import { Bars } from '@/components/seo-dash/charts/Bars'
import { LiveFeed } from '@/components/seo-dash/blocks/LiveFeed'

// @cdc tableau de bord SEO — Direct : qui est sur le site maintenant, et d'où il vient (ancienne vue « En direct »).

export const dynamic = 'force-dynamic'

export default async function LivePage(props: SeoPageProps) {
  const { query } = await openSeoPage(props)
  const res = await readBlock('direct', null, (pool) => liveSummary(pool))
  const d = res.value
  return (
    <SeoShell current="en-direct" title="Direct" sub="Qui est sur le site maintenant, et d’où il vient">
      {d ? (
        <div className="sd-grid sd-g4 k2">
          <Tile label="30 dernières minutes" value={n0(d.last30)} note="pages vues par des personnes" />
          <Tile label="Dernière heure" value={n0(d.lastHour)} note="pages vues" />
          <Tile label="Depuis Google" value={pct0(d.googleShare)} note="des pages vues aujourd’hui" />
          <Tile label="Envoyés par une IA" value={n0(d.aiToday)} note="pages vues aujourd’hui" />
        </div>
      ) : null}
      <div className="sd-grid sd-g3 sd-gap">
        <div className="sd-span2">
          <LiveFeed />
        </div>
        <div className="sd-grid">
          {d ? (
            <Card title="Pages vues par tranche de 10 min" desc="3 dernières heures">
              <Bars labels={d.slots.map((s) => s.label)} series={[{ key: 'v', label: 'pages vues', color: 'var(--sd-s1)', values: d.slots.map((s) => s.n) }]} height={150} label="Pages vues par tranche de 10 minutes" />
            </Card>
          ) : null}
          {d ? (
            <Card title="D’où viennent les visites" desc="28 jours, pages vues" csv={csvHref('sources', query)}>
              <BarList items={d.sources.map((s) => ({ key: s.label, label: s.label, value: s.n, text: pct0(s.share) }))} />
            </Card>
          ) : null}
        </div>
      </div>
    </SeoShell>
  )
}
