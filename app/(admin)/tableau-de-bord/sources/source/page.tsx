import Link from 'next/link'
import { countryName } from '@/lib/dashboard/country'
import { dayLabel, deltaOf, n0, n1, shortPath } from '@/lib/seo-dash/format'
import { csvHref, hrefOf, pageHref } from '@/lib/seo-dash/nav'
import { openSeoPage, param, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { countriesOf, DEVICE_KINDS, devicesOf, groupBy, landingsOf, loadVisits, matchKey, per100, perVisit } from '@/lib/seo-dash/server/sources'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { SITE } from '@/lib/seo-dash/config'
import { FAMILIES, FAMILY_LABEL, parseSourceKey } from '@/lib/seo-dash/source'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Tile } from '@/components/seo-dash/ui/Tile'
import { Card, Empty } from '@/components/seo-dash/ui/Card'
import { BarList } from '@/components/seo-dash/ui/BarList'
import { Bars } from '@/components/seo-dash/charts/Bars'
import { DirectTabs } from '@/components/seo-dash/blocks/SourcesBlocks'
import { SourceTable } from '@/components/seo-dash/blocks/SourceTable'

// @cdc tableau de bord SEO — détail d'une source (?s=search:Bing) ou d'un canal (?s=ai) : visites dans le temps, pages
// d'arrivée et leurs conversions, sources du canal, appareils et pays.

export const dynamic = 'force-dynamic'

export default async function SourceDetailPage(props: SeoPageProps) {
  const { filters: f, params, query } = await openSeoPage(props)
  const s = param(params, 's')
  const key = parseSourceKey(s)
  const match = matchKey(s)
  const res = match ? await readBlock('source', null, (pool) => loadVisits(pool, f)) : { value: null, ok: false }
  const l = res.value
  const title = key ? (key.name ?? FAMILY_LABEL[key.family]) : 'Source inconnue'
  const color = FAMILIES.find((x) => x.key === key?.family)?.color ?? 'var(--sd-f1)'
  const [row] = l && match ? groupBy(l, () => s, match) : []
  const visits = l && match ? l.cur.filter(match) : []
  const landings = l && match ? landingsOf(l, match).slice(0, 50) : []
  const names = l && match && key && key.name === null ? groupBy(l, (v) => v.key, match) : []
  const devices = devicesOf(visits)
  return (
    <SeoShell current="sources" title={title} sub={key ? `${FAMILY_LABEL[key.family]} · détail d’une source` : undefined} filters={f} path={hrefOf('sources/source')} keep={{ s }} fresh={`Relevés depuis le ${dayLabel(SITE.logsStart)}`}>
      <DirectTabs current="sources" query={query} />
      <p className="sd-crumb">
        <Link href={hrefOf('sources', query)}>Sources</Link> › {key ? <Link href={`${hrefOf('sources', query)}#canaux`}>{FAMILY_LABEL[key.family]}</Link> : null}
        {key?.name ? ` › ${key.name}` : null}
      </p>
      {!match ? <Empty>Cette source n’existe pas. Reviens à l’écran Sources.</Empty> : null}
      {match && !res.ok ? <p className="sd-note warn">La lecture des visites a échoué.</p> : null}
      {l && row ? (
        <>
          <div className="sd-grid sd-g4 k2">
            <Tile label="Visites" value={n0(row.visits)} delta={row.prev !== null ? deltaOf(row.visits, row.prev) : null} against={row.prev !== null ? `contre ${n0(row.prev)}` : undefined} />
            <Tile label="Pages par visite" value={n1(perVisit(row) ?? 0)} />
            <Tile label="Clics partenaires" value={n1(per100(row.clicks, row.visits) ?? 0)} note={`pour 100 visites · ${n0(row.clicks)} clics`} />
            <Tile label="Inscriptions" value={n1(per100(row.signups, row.visits) ?? 0)} note={`pour 100 visites · ${n0(row.signups)} au total`} />
          </div>
          <div className="sd-grid sd-g3 sd-gap">
            <Card className="sd-span2" title="Visites" desc={`Par ${l.step}`}>
              <Bars labels={l.buckets.map((b) => b.label)} titles={l.buckets.map((b) => b.title)} series={[{ key: 'v', label: 'visites', color, values: row.spark }]} height={180} label={`Visites venues de ${title}`} />
            </Card>
            <div className="sd-grid">
              <Card title="Appareils">
                <BarList items={DEVICE_KINDS.filter((d) => devices[d.key]).map((d) => ({ key: d.key, label: d.label, value: devices[d.key] }))} />
              </Card>
              <Card title="Pays">
                <BarList items={countriesOf(visits).slice(0, 8).map((c) => ({ key: c.code, label: c.code === '??' ? 'Inconnu' : countryName(c.code), value: c.n }))} />
              </Card>
            </div>
          </div>
          {names.length > 1 ? <SourceTable title={`Sources · ${title}`} rows={names} base={row.visits} query={query} spark csv={csvHref('sources-liste', query, { famille: key?.family ?? '' })} /> : null}
          <div className="sd-gap" />
          <SourceTable title="Pages d’arrivée" desc="Première page de chaque visite venue de cette source" first="Page" rows={landings} base={row.visits} query={query} linkOf={(r) => pageHref(r.key, query)} labelOf={(r) => shortPath(r.key, 44)} csv={csvHref('sources-arrivees', query, { s })} />
        </>
      ) : match && res.ok ? (
        <Empty>Aucune visite venue de cette source sur la période.</Empty>
      ) : null}
    </SeoShell>
  )
}
