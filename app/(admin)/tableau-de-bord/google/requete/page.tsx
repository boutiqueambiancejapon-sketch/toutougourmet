import Link from 'next/link'
import { expectedCtr } from '@/lib/seo-dash/ctr'
import { dayLabel, deltaOf, n0, n1, pct } from '@/lib/seo-dash/format'
import { csvHref, hrefOf, pageHref } from '@/lib/seo-dash/nav'
import { queryDetail } from '@/lib/seo-dash/server/detail'
import { chartNotes } from '@/lib/seo-dash/server/notes'
import { openSeoPage, param, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { GoogleDelay } from '@/components/seo-dash/ui/GoogleDelay'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Tile } from '@/components/seo-dash/ui/Tile'
import { Card } from '@/components/seo-dash/ui/Card'
import { LineChart } from '@/components/seo-dash/charts/LineChart'
import { Bars } from '@/components/seo-dash/charts/Bars'
import { weekly } from '@/components/seo-dash/blocks/GoogleCharts'
import { QueriesTable } from '@/components/seo-dash/blocks/PageDetailBlocks'
import { PagesOfQuery } from '@/components/seo-dash/blocks/PagesOfQuery'

// @cdc tableau de bord SEO — détail d'une requête (?q=…) : même gabarit pour toutes les requêtes.

export const dynamic = 'force-dynamic'

export default async function QueryDetailPage(props: SeoPageProps) {
  const { filters: f, params, query } = await openSeoPage(props)
  const q = param(params, 'q').slice(0, 300)
  const res = await readBlock('détail requête', null, (pool) => queryDetail(pool, f, q))
  const d = res.value
  const notes = d ? (await readBlock('notes', [], (pool) => chartNotes(pool, { start: d.long[0]?.day ?? d.ranges.cur.start, end: d.ranges.last }))).value : []
  const main = d ? [...d.pages].sort((a, b) => b.impressions - a.impressions)[0] : undefined
  const weeks = d ? weekly(d.long) : []
  return (
    <SeoShell current="google" title={`« ${q} »`} sub="Détail d’une requête · même gabarit pour toutes les requêtes" filters={f} path={hrefOf('google/requete')} keep={{ q }} fresh={d ? `Google : données jusqu’au ${dayLabel(d.ranges.last)}` : undefined}>
      <GoogleDelay filters={f} last={d?.ranges.last} />
      <p className="sd-crumb">
        <Link href={hrefOf('google', query)}>Google</Link> › <Link href={`${hrefOf('google', query)}#requetes`}>Requêtes</Link> › {q}
      </p>
      {d ? (
        <>
          <div className="sd-kv">
            {main ? (
              <span>
                Page qui répond :{' '}
                <Link className="sd-lk" href={pageHref(main.key, query)}>
                  {main.key}
                </Link>
              </span>
            ) : null}
            <span>
              Concurrence interne : <b>{d.pages.length > 1 ? `${d.pages.length} pages` : 'aucune'}</b>
            </span>
          </div>
          <div className="sd-grid sd-g4 k2">
            <Tile label="Clics" value={n0(d.cur.clicks)} delta={d.prev ? deltaOf(d.cur.clicks, d.prev.clicks) : null} against={d.prev ? `contre ${n0(d.prev.clicks)}` : undefined} />
            <Tile label="Affichages" value={n0(d.cur.impressions)} delta={d.prev ? deltaOf(d.cur.impressions, d.prev.impressions) : null} against={d.prev ? `contre ${n0(d.prev.impressions)}` : undefined} />
            <Tile label="Taux de clic" value={pct(d.cur.ctr)} note={d.cur.impressions ? `attendu en position ${n0(Math.round(d.cur.position))} : ${pct(expectedCtr(d.cur.position))}` : undefined} />
            <Tile label="Position" value={d.cur.impressions ? n1(d.cur.position) : '—'} delta={d.prev?.impressions && d.cur.impressions ? deltaOf(d.cur.position, d.prev.position, 'position', false) : null} against={d.prev?.impressions ? `contre ${n1(d.prev.position)}` : undefined} />
          </div>
          <div className="sd-grid sd-g2 sd-gap">
            <Card title="Position sur 3 mois" desc="Axe inversé : plus haut = mieux classé · pastilles = vos notes">
              <LineChart days={d.long.map((x) => x.day)} series={[{ key: 'pos', label: 'Position', color: 'var(--sd-s1)', values: d.long.map((x) => (x.impressions ? x.position : null)) }]} notes={notes} format="position" invert legend={false} label="Position de la requête sur 3 mois" />
            </Card>
            <Card title="Affichages et clics par semaine" desc="Deux graphiques, une échelle chacun">
              <p className="sd-small sd-muted">Affichages</p>
              <Bars labels={weeks.map((w) => dayLabel(w.day))} titles={weeks.map((w) => `semaine du ${dayLabel(w.day)}`)} series={[{ key: 'i', label: 'affichages', color: 'var(--sd-s2)', values: weeks.map((w) => w.impressions) }]} height={140} label="Affichages par semaine" />
              <p className="sd-small sd-muted sd-gap">Clics</p>
              <Bars labels={weeks.map((w) => dayLabel(w.day))} titles={weeks.map((w) => `semaine du ${dayLabel(w.day)}`)} series={[{ key: 'c', label: 'clics', color: 'var(--sd-s1)', values: weeks.map((w) => w.clicks) }]} height={110} label="Clics par semaine" />
            </Card>
          </div>
          <div className="sd-grid sd-g2 sd-gap">
            <PagesOfQuery rows={d.pages} query={query} csv={csvHref('requete-pages', query, { q })} />
            <QueriesTable rows={d.related} query={query} title="Requêtes proches (même page)" desc="Ce que la page qui répond reçoit d’autre" csv={csvHref('page-requetes', query, { u: main?.key ?? '/' })} limit={10} />
          </div>
        </>
      ) : (
        <p className="sd-note warn">Lecture impossible pour cette requête.</p>
      )}
    </SeoShell>
  )
}
