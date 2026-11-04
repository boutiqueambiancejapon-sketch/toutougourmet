import { deltaShort, type Pair } from '@/lib/dashboard/compare'
import type { Period } from '@/lib/dashboard/period'
import { coverageOf, splitPaths, type ArticlePath, type RobotFilter } from '@/lib/dashboard/robots'
import type { AiData, Row } from '@/lib/server/dashboard-queries'
import type { RobotsData } from '@/lib/server/dashboard-robots'
import { AI_SERIES, AiTimeline } from './AiTimeline'
import { BarList, PlainList } from './BarList'
import { Panel } from './Panel'
import { HourBars, KindShare } from './robots/RobotCharts'
import { RobotFilters } from './robots/RobotFilters'
import { CoverageList, RobotList } from './robots/RobotList'

// @cdc tableau de bord — robots IA (scripts/lib/bots.mjs) : couverture des articles, filtres par
// robot et par type de visite, graphiques, puis pages et erreurs réelles.

const nf = new Intl.NumberFormat('fr-FR')
const SHOWN = 12

/** Cinq lignes visibles, le reste à un toucher : la page reste lisible sur téléphone. */
function TopList({ rows, empty }: { rows: Row[]; empty: string }) {
  return (
    <>
      <BarList rows={rows.slice(0, 5)} empty={empty} />
      {rows.length > 5 ? (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-ink-2">Voir les {rows.length - 5} suivants</summary>
          <div className="mt-3">
            <BarList rows={rows.slice(5, 25)} empty="" />
          </div>
        </details>
      ) : null}
    </>
  )
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-box border border-line bg-paper px-3 py-2.5">
      <dt className="text-sm leading-snug text-ink-2">{label}</dt>
      <dd className="m-0 whitespace-nowrap font-display text-2xl font-black leading-tight tabular-nums text-ink">{value}</dd>
      {note ? <dd className="m-0 text-xs text-ink-2">{note}</dd> : null}
    </div>
  )
}

const evolution = (p: Pair) => `${deltaShort(p)} sur la période d’avant`

interface AiSectionProps {
  data: RobotsData
  ai: AiData
  period: Period
  filter: RobotFilter
  articles: ArticlePath[]
  titles: Map<string, string>
}

export function AiSection({ data, ai, period, filter, articles, titles }: AiSectionProps) {
  const coverage = coverageOf(articles, ai.aiReadPaths)
  const readCount = coverage.reduce((sum, r) => sum + r.read, 0)
  const read = new Set(ai.aiReadPaths.map((p) => p.replace(/\/$/, '')))
  const unread = articles.filter((a) => !read.has(a.path))
  const items = unread.map((a) => ({ key: a.path, label: a.title, href: a.path }))
  const { articles: topArticles, others } = splitPaths(data.paths, titles)
  const landings = ai.landingPages.map((r) => ({ ...r, label: titles.get(r.label.replace(/\/$/, '')) ?? r.label }))
  const direct = data.directPaths.map((r) => ({ ...r, label: titles.get(r.label.replace(/\/$/, '')) ?? r.label }))
  const hourly = period.bucket === 'hour'
  const unit = hourly ? 'par heure' : period.bucket === 'week' ? 'par semaine' : 'par jour'
  const totals = data.timeline.reduce((t, r) => ({ training: t.training + r.training, search: t.search + r.search, user: t.user + r.user }), { training: 0, search: 0, user: 0 })
  const share = AI_SERIES.map((s) => ({ key: { training: 'ai_training', search: 'ai_search', user: 'ai_user' }[s.key], value: totals[s.key], swatch: s.swatch }))
  return (
    <>
      <dl className="m-0 mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <Tile label="Articles déjà lus" value={`${nf.format(readCount)} / ${nf.format(articles.length)}`} note="Depuis le début de la mesure" />
        <Tile label="Visites de robots" value={nf.format(data.visits.current)} note={evolution(data.visits)} />
        <Tile label="Lectures en direct" value={nf.format(data.direct.current)} note={evolution(data.direct)} />
        <Tile label="Pages lues" value={nf.format(data.pages)} note={`${nf.format(data.errors)} erreurs réelles`} />
      </dl>
      <RobotFilters period={period.key} filter={filter} operators={data.operators} />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Panel title={`Visites ${unit}`} wide>
          <AiTimeline rows={data.timeline} hourly={hourly} />
        </Panel>
        <Panel title="Pourquoi ils viennent">
          <KindShare rows={share} />
        </Panel>
        <Panel title="À quelle heure" hint="Heure de Paris.">
          <HourBars hours={data.hours} />
        </Panel>
        <Panel title="Robot par robot" hint="Toucher une ligne filtre toute la page." wide>
          <RobotList robots={data.robots} buckets={data.timeline.map((r) => r.bucket)} hourly={hourly} period={period.key} filter={filter} />
        </Panel>
        <Panel title="Visiteurs envoyés par une IA" hint="Lien suivi depuis une réponse de ChatGPT, Perplexity, Gemini… Ce chiffre ignore les filtres.">
          <BarList rows={ai.referrals} empty="Aucun visiteur venu d’une IA sur la période." />
          {landings.length > 0 ? (
            <div className="mt-4">
              <h4 className="m-0 mb-2 text-sm font-semibold text-ink-2">Leurs pages d’arrivée</h4>
              <BarList rows={landings} empty="" />
            </div>
          ) : null}
        </Panel>
        <Panel title="Ouverts pour répondre à quelqu’un" hint="Pages ouvertes en direct pendant une question posée à une IA.">
          <TopList rows={direct} empty="Aucune lecture en direct sur la période." />
        </Panel>
        <Panel title="Articles les plus lus">
          <TopList rows={topArticles} empty="Aucun article lu pour ce filtre." />
        </Panel>
        <Panel title="Lus par rubrique" hint="Tous robots confondus, depuis le début de la mesure.">
          <CoverageList rows={coverage} />
        </Panel>
        <Panel title="Ce que lisent les robots" hint="Part des pages lues, par type de page.">
          <TopList rows={data.types} empty="Aucune page lue pour ce filtre." />
        </Panel>
        <Panel title="Pages hors articles" hint="Accueil, listes, outils et compte.">
          <TopList rows={others} empty="Aucune page hors articles pour ce filtre." />
        </Panel>
        <Panel title="Vraies erreurs" hint={`Une 404 ici est une page citée qui n’existe plus. Mises de côté : ${nf.format(data.technicalErrors)} erreurs sur des fichiers techniques ou le tableau de bord.`} wide>
          <TopList rows={data.errorPaths} empty="Aucune erreur réelle servie à un robot sur la période." />
        </Panel>
        <Panel title="Articles jamais lus" hint={`${nf.format(unread.length)} sur ${nf.format(articles.length)} articles, tous robots confondus.`} wide>
          <PlainList items={items.slice(0, SHOWN)} empty="Chaque article a reçu au moins une visite de robot IA." />
          {items.length > SHOWN ? (
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-ink-2">Voir les {items.length - SHOWN} autres</summary>
              <PlainList items={items.slice(SHOWN)} empty="" />
            </details>
          ) : null}
        </Panel>
      </div>
    </>
  )
}
