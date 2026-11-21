import { compareLabel, filterQuery } from '@/lib/seo-dash/filters'
import { dayLabel, deltaOf, n0, n1, pct0 } from '@/lib/seo-dash/format'
import { csvHref, hrefOf, pageHref } from '@/lib/seo-dash/nav'
import { frDate } from '@/lib/seo-dash/server/range'
import { openSeoPage, param, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { landingsOf, loadVisits, matchKey, otherEngines, per100, sourcesData } from '@/lib/seo-dash/server/sources'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { SITE } from '@/lib/seo-dash/config'
import { FAMILY_LABEL, parseSourceKey } from '@/lib/seo-dash/source'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Tile } from '@/components/seo-dash/ui/Tile'
import { Card, Section } from '@/components/seo-dash/ui/Card'
import { BarList } from '@/components/seo-dash/ui/BarList'
import { ChannelsCard, DirectTabs, SourceChips, SplitCard } from '@/components/seo-dash/blocks/SourcesBlocks'
import { SourceRows, SourceTable } from '@/components/seo-dash/blocks/SourceTable'

// @cdc tableau de bord SEO — Sources : d'où viennent les visites (moteurs, IA, réseaux, e-mail, sites, direct), sur la
// période et la comparaison de la barre commune. Remplace l'ancienne page Trafic › Acquisition.

export const dynamic = 'force-dynamic'

const sum = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] ?? 0))

export default async function SourcesPage(props: SeoPageProps) {
  const { filters: f, params, query } = await openSeoPage(props)
  const res = await readBlock('sources', null, (pool) => loadVisits(pool, f))
  const l = res.value
  const d = l ? sourcesData(l) : null
  const path = hrefOf('sources')
  const fam = (k: string) => d?.families.find((x) => x.family === k)
  const engines = d ? otherEngines(d) : []
  const search = fam('search')
  const ai = fam('ai')
  const engineVisits = engines.reduce((a, r) => a + r.visits, 0)
  const enginePrev = d?.compare ? engines.reduce((a, r) => a + (r.prev ?? 0), 0) : null
  const chips = d
    ? [...d.families.filter((x) => x.visits > 0).map((x) => ({ key: x.family, label: x.label })), ...d.families.flatMap((x) => x.rows.filter((r) => r.visits > 0 && x.rows.length > 1).slice(0, 2)).sort((a, b) => b.visits - a.visits).slice(0, 5).map((r) => ({ key: r.key, label: r.name }))]
    : []
  const voirRaw = param(params, 'voir')
  const voir = voirRaw && matchKey(voirRaw) ? voirRaw : (chips[0]?.key ?? 'search')
  const voirKey = parseSourceKey(voir)
  const voirLabel = voirKey ? (voirKey.name ?? FAMILY_LABEL[voirKey.family]) : voir
  const match = matchKey(voir)
  const landings = l && match ? landingsOf(l, match).slice(0, 25) : []
  const vs = d?.compare ? compareLabel(f) : ''
  const total = d?.total
  return (
    <SeoShell current="sources" title="Sources" sub="D’où viennent les visites : moteurs, assistants IA, réseaux, e-mails, sites, accès direct" filters={f} path={path} keep={voirRaw ? { voir: voirRaw } : undefined} fresh={`Relevés depuis le ${dayLabel(SITE.logsStart)}`}>
      <DirectTabs current="sources" query={query} />
      {res.ok ? null : <p className="sd-note warn">La lecture des visites a échoué : les blocs restent vides.</p>}
      {d && total ? (
        <>
          <div className="sd-grid sd-g4 k2">
            <Tile label="Visites" value={n0(total.visits)} delta={total.prev !== null ? deltaOf(total.visits, total.prev) : null} against={total.prev !== null ? `contre ${n0(total.prev)}` : undefined} spark={d.families.reduce((a, x) => sum(a, x.spark), d.buckets.map(() => 0))} />
            <Tile label="Moteurs hors Google" value={n0(engineVisits)} delta={enginePrev !== null ? deltaOf(engineVisits, enginePrev) : null} against={enginePrev !== null ? `contre ${n0(enginePrev)}` : undefined} note={search?.visits ? `${pct0(engineVisits / search.visits)} de la recherche` : undefined} />
            <Tile label="Assistants IA" value={n0(ai?.visits ?? 0)} delta={ai && ai.prev !== null ? deltaOf(ai.visits, ai.prev) : null} against={ai && ai.prev !== null ? `contre ${n0(ai.prev)}` : undefined} />
            <Tile label="Clics partenaires" value={n1(per100(total.clicks, total.visits) ?? 0)} note={`pour 100 visites · ${n0(total.clicks)} clics`} />
          </div>
          {!d.compare && f.compare !== 'aucune' ? <p className="sd-note sd-gap">Pas d’écart affiché : les relevés commencent le {frDate(SITE.logsStart)}, la période d’avant n’est pas complète.</p> : null}
          <div className="sd-grid sd-g3 sd-gap">
            <div className="sd-span2">
              <ChannelsCard families={d.families} buckets={d.buckets} week={d.week} csv={csvHref('sources-canaux', query)} />
            </div>
            <Card title="Part de chaque canal" desc={vs ? `Écart contre ${vs} dans les tableaux` : 'Visites de la période'}>
              <BarList items={d.families.filter((x) => x.visits > 0).map((x) => ({ key: x.family, label: x.label, value: x.visits, text: `${n0(x.visits)} · ${pct0(total.visits ? x.visits / total.visits : 0)}` }))} empty="Aucune visite sur la période." />
              {d.internal ? <p className="sd-small sd-muted">{n0(d.internal)} visites reprises depuis une page du site (onglet resté ouvert) ne comptent pas comme entrées.</p> : null}
            </Card>
          </div>
          <Section id="moteurs" title="Moteurs de recherche hors Google" desc="Bing, DuckDuckGo, Ecosia, Qwant, Yahoo, Brave… même quand ils envoient peu de monde" />
          <SourceTable title="Autres moteurs" desc="Part : dans les visites venues de la recherche" rows={engines} base={search?.visits ?? 0} query={query} csv={csvHref('sources-moteurs', query)} spark empty="Aucune visite venue d’un autre moteur que Google sur la période." />
          <Section id="canaux" title="Par canal" desc="Chaque source avec ses visites, son écart et ce qu’elle rapporte pour 100 visites" />
          <div className="sd-grid sd-g2">
            {d.families.map((x) => (
              <SourceTable key={x.family} title={x.label} desc={`${n0(x.visits)} visites · ${pct0(total.visits ? x.visits / total.visits : 0)} du total`} rows={x.rows} base={x.visits} query={query} color={x.color} csv={csvHref('sources-liste', query, { famille: x.family })} empty="Aucune visite sur la période." />
            ))}
          </div>
          <Section id="arrivees" title="Pages d’arrivée par source" desc="Où arrivent les visites de chaque source, et ce qu’elles rapportent" />
          <Card title={`Pages d’arrivée · ${voirLabel}`} csv={csvHref('sources-arrivees', query, { s: voir })}>
            <SourceChips items={chips} current={voir} hrefFor={(k) => `${path}${filterQuery(f, {}, { voir: k })}#arrivees`} />
            <SourceRows rows={landings} base={landings.reduce((a, r) => a + r.visits, 0)} query={query} first="Page" linkOf={(r) => pageHref(r.key, query)} labelOf={(r) => r.key} empty="Aucune page d’arrivée pour cette source sur la période." />
          </Card>
          <Section id="appareils" title="Appareils et pays" />
          <SplitCard families={d.families} csv={csvHref('sources-appareils-pays', query)} />
        </>
      ) : null}
    </SeoShell>
  )
}
