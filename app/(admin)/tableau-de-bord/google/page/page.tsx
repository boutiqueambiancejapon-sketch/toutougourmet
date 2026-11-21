import Link from 'next/link'
import { cleanPath, pageTypeLabel, pageTypeOf, SITE } from '@/lib/seo-dash/config'
import { dayLabel, deltaOf, n0, n1 } from '@/lib/seo-dash/format'
import { csvHref, hrefOf } from '@/lib/seo-dash/nav'
import { publications } from '@/lib/seo-dash/server/content'
import { pageDetail } from '@/lib/seo-dash/server/detail'
import { chartNotes } from '@/lib/seo-dash/server/notes'
import { openSeoPage, param, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { pageVitals } from '@/lib/seo-dash/server/vitals'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Tile } from '@/components/seo-dash/ui/Tile'
import { Card } from '@/components/seo-dash/ui/Card'
import { BarList } from '@/components/seo-dash/ui/BarList'
import { LineChart } from '@/components/seo-dash/charts/LineChart'
import { PageState, QueriesTable } from '@/components/seo-dash/blocks/PageDetailBlocks'

// @cdc tableau de bord SEO — détail d'une page (?u=/chemin) : même gabarit pour toutes les pages du site.

export const dynamic = 'force-dynamic'

const avg7 = (v: number[]) => v.map((_, i) => Math.round((v.slice(Math.max(0, i - 6), i + 1).reduce((a, b) => a + b, 0) / Math.min(7, i + 1)) * 10) / 10)

export default async function PageDetailPage(props: SeoPageProps) {
  const { filters: f, params, query } = await openSeoPage(props)
  const path = cleanPath(param(params, 'u') || '/')
  const pub = publications().find((p) => p.path === path)
  const res = await readBlock('détail page', null, (pool) => pageDetail(pool, f, path))
  const vitals = (await readBlock('vitals page', { lcp: null, inp: null }, (pool) => pageVitals(pool, path))).value
  const d = res.value
  const notes = d ? (await readBlock('notes', [], (pool) => chartNotes(pool, { start: d.long[0]?.day ?? d.ranges.cur.start, end: d.ranges.last }))).value : []
  const title = pub?.title ?? path
  const clicks = d?.partnerClicks.reduce((a, x) => a + x.n, 0) ?? 0
  return (
    <SeoShell current="google" title={title} sub="Détail d’une page · même gabarit pour toutes les pages" filters={f} path={hrefOf('google/page')} keep={{ u: path }} fresh={d ? `Google : données jusqu’au ${dayLabel(d.ranges.last)}` : undefined}>
      <p className="sd-crumb">
        <Link href={hrefOf('google', query)}>Google</Link> › <Link href={`${hrefOf('google', query)}#requetes`}>Pages</Link> › {pageTypeLabel(pageTypeOf(path))}
      </p>
      <div className="sd-kv">
        <span>
          Adresse : <b>{path}</b>
        </span>
        {pub ? (
          <span>
            Publiée le <b>{dayLabel(pub.date)}</b>
          </span>
        ) : d?.firstImpression ? (
          <span>
            Dans Google depuis le <b>{dayLabel(d.firstImpression)}</b>
          </span>
        ) : null}
        <a className="sd-lk" href={`${SITE.baseUrl}${path}`} target="_blank" rel="noopener noreferrer">
          Ouvrir la page
        </a>
      </div>
      {d ? (
        <>
          <div className="sd-grid sd-g5 k2">
            <Tile label="Clics Google" value={n0(d.cur.clicks)} delta={d.prev ? deltaOf(d.cur.clicks, d.prev.clicks) : null} against={d.prev ? `contre ${n0(d.prev.clicks)}` : undefined} />
            <Tile label="Position" value={d.cur.impressions ? n1(d.cur.position) : '—'} delta={d.prev && d.prev.impressions && d.cur.impressions ? deltaOf(d.cur.position, d.prev.position, 'position', false) : null} against={d.prev?.impressions ? `contre ${n1(d.prev.position)}` : undefined} />
            <Tile label="Visites" value={n0(d.visits)} note={`depuis le ${dayLabel(SITE.logsStart)} au plus tôt`} />
            <Tile label="Clics partenaires" value={n0(clicks)} note={d.partnerClicks.length ? d.partnerClicks.map((c) => `${c.brand} ${c.n}`).join(' · ') : 'aucun clic partenaire sur cette page'} />
            <Tile label="Passages de Googlebot" value={n0(d.googlebot.hits)} note={d.googlebot.last ? `dernier le ${dayLabel(d.googlebot.last)}` : 'aucun sur la période'} />
          </div>
          <div className="sd-grid sd-g3 sd-gap">
            <div className="sd-span2">
              <Card title="Clics Google par jour, 3 mois">
                <LineChart
                  days={d.long.map((x) => x.day)}
                  series={[
                    { key: 'day', label: 'clics du jour', color: 'var(--sd-prev)', values: d.long.map((x) => x.clicks), muted: true },
                    { key: 'avg', label: 'moyenne sur 7 jours', color: 'var(--sd-s1)', values: avg7(d.long.map((x) => x.clicks)) },
                  ]}
                  notes={notes}
                  format="decimal"
                  label="Clics Google par jour sur 3 mois"
                />
              </Card>
            </div>
            <PageState d={d} vitals={vitals} />
          </div>
          <div className="sd-grid sd-g3 sd-gap">
            <Card title="Position moyenne" desc="Axe inversé : plus haut = mieux classé">
              <LineChart days={d.long.map((x) => x.day)} series={[{ key: 'pos', label: 'Position', color: 'var(--sd-s1)', values: d.long.map((x) => (x.impressions ? x.position : null)) }]} format="position" invert height={170} legend={false} label="Position moyenne sur 3 mois" />
            </Card>
            <div className="sd-span2">
              <QueriesTable rows={d.queries} query={query} title="Requêtes qui amènent sur la page" desc={`${f.days} jours · ancres (#section) regroupées avec la page`} csv={csvHref('page-requetes', query, { u: path })} />
            </div>
          </div>
          <div className="sd-grid sd-g2 sd-gap">
            <Card title="Robots d’IA qui la lisent" desc={`Passages depuis le ${dayLabel(SITE.logsStart)}`}>
              <BarList items={d.ai.map((a) => ({ key: a.label, label: a.label, value: a.n }))} color="var(--sd-s2)" empty="Aucun robot d’IA n’a lu cette page." />
            </Card>
            <Card title="Ce qu’elle rapporte">
              <p>
                {n0(d.visits)} visites, {n0(clicks)} clic{clicks > 1 ? 's' : ''} partenaire{clicks > 1 ? 's' : ''}
                {clicks === 0 && d.visits >= 50 ? ' : la page attire du monde mais n’envoie vers aucun aliment.' : '.'}
              </p>
            </Card>
          </div>
        </>
      ) : (
        <p className="sd-note warn">Lecture impossible pour cette page.</p>
      )}
    </SeoShell>
  )
}
