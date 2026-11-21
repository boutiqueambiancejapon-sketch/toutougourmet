import { compareLabel, filterQuery, lastLabel, PERIOD_LABEL, prevPeriodLabel } from '@/lib/seo-dash/filters'
import { dayLabel } from '@/lib/seo-dash/format'
import { csvHref, hrefOf } from '@/lib/seo-dash/nav'
import { EMPTY_GOOGLE, googleData } from '@/lib/seo-dash/server/google'
import { indexation } from '@/lib/seo-dash/server/indexation'
import { chartNotes } from '@/lib/seo-dash/server/notes'
import { openSeoPage, param, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { gscRanges, rangesFrom } from '@/lib/seo-dash/server/range'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { SITE } from '@/lib/seo-dash/config'
import { GoogleDelay } from '@/components/seo-dash/ui/GoogleDelay'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { GoogleTiles } from '@/components/seo-dash/blocks/GoogleTiles'
import { ClicksCard, SmallSeries } from '@/components/seo-dash/blocks/GoogleCharts'
import { DeltaTable } from '@/components/seo-dash/blocks/DeltaTable'
import { LowCtrCard, StrikingCard } from '@/components/seo-dash/blocks/Opportunities'
import { CannibalCard, DecayCard } from '@/components/seo-dash/blocks/Opportunities2'
import { IndexationCard } from '@/components/seo-dash/blocks/IndexationCard'
import { GoogleTabs } from '@/components/seo-dash/blocks/GoogleTabs'
import { Section } from '@/components/seo-dash/ui/Card'

// @cdc tableau de bord SEO — écran Google : ce que Google montre du site et où gagner des clics. Données de la
// Search Console relevées chaque nuit (analytics.gsc_*), ancres #section fusionnées avec leur page.

export const dynamic = 'force-dynamic'

export default async function GooglePage(props: SeoPageProps) {
  const { filters: f, params, query } = await openSeoPage(props)
  const fallbackRanges = rangesFrom(new Date().toISOString().slice(0, 10), f, SITE.gscStart)
  const [data, idx] = await Promise.all([
    readBlock('google', { ...EMPTY_GOOGLE, ranges: fallbackRanges }, async (pool) => googleData(pool, f)),
    readBlock('indexation', { checked: 0, lastCheck: null, types: [], reasons: [] }, (pool) => indexation(pool)),
  ])
  const d = data.value
  const notes = (await readBlock('notes', [], async (pool) => chartNotes(pool, (await gscRanges(pool, f)).cur))).value
  const week = param(params, 'pas') === 'semaine'
  const path = hrefOf('google')
  const prevLabel = f.compare === 'annee' ? 'l’an dernier' : prevPeriodLabel(f.period)
  return (
    <SeoShell current="google" title="Google" sub="Search Console : ce que Google montre du site, et où gagner des clics" filters={f} path={path} fresh={`Google : données jusqu’au ${dayLabel(d.ranges.last)}`}>
      <GoogleDelay filters={f} last={d.ranges.last} />
      <GoogleTabs />
      <div id="vue" />
      {data.ok ? null : <p className="sd-note warn">La lecture des données Google a échoué : les blocs restent vides.</p>}
      <GoogleTiles cur={d.cur} prev={d.ranges.partial ? null : d.prev} daily={d.daily} prevDaily={d.prevDaily} />
      <div className="sd-grid sd-g3 sd-gap">
        <div className="sd-span2">
          <ClicksCard
            daily={d.daily}
            prevDaily={d.prevDaily}
            notes={notes}
            curLabel={lastLabel(f.period)}
            prevLabel={prevLabel}
            week={week}
            dayHref={`${path}${query}`}
            weekHref={`${path}${filterQuery(f, {}, { pas: 'semaine' })}`}
          />
        </div>
        <div className="sd-grid">
          <SmallSeries title="Affichages" daily={d.daily} kind="impressions" />
          <SmallSeries title="Position moyenne" desc="Axe inversé : plus haut = mieux classé" daily={d.daily} kind="position" />
        </div>
      </div>
      {d.ranges.note ? <p className="sd-note sd-gap">{d.ranges.note}</p> : null}
      <Section id="requetes" title="Requêtes et pages" desc={`Écart de clics entre ${PERIOD_LABEL[f.period]} et ${compareLabel(f) || 'rien'} · ${d.queries.tracked} requêtes suivies`} />
      <div className="sd-grid sd-g2">
        <DeltaTable title="Requêtes gagnées et perdues" desc="Plus fortes hausses, puis plus fortes baisses de clics" up={d.queries.up} down={d.queries.down} kind="query" query={query} csv={csvHref('requetes-ecarts', query)} />
        <DeltaTable title="Pages en hausse et en baisse" desc="Ancres (#section) regroupées avec leur page" up={d.pages.up} down={d.pages.down} kind="page" query={query} csv={csvHref('pages-ecarts', query)} />
      </div>
      <Section id="opportunites" title="Opportunités" desc="Ce qui peut rapporter des clics sans écrire de nouvelle page" />
      <div className="sd-grid sd-g2">
        <StrikingCard rows={d.striking.rows} total={d.striking.total} query={query} csv={csvHref('a-portee', query)} />
        <LowCtrCard rows={d.lowCtr} query={query} csv={csvHref('taux-de-clic', query)} />
        <CannibalCard rows={d.cannibals.rows} total={d.cannibals.total} query={query} csv={csvHref('concurrence', query)} />
        <DecayCard rows={d.decays} query={query} csv={csvHref('essoufflement', query)} />
      </div>
      <Section id="indexation" title="Indexation par type de page" />
      <IndexationCard data={idx.value} csv={csvHref('indexation', query)} />
    </SeoShell>
  )
}
