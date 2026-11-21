import Link from 'next/link'
import { SITE } from '@/lib/seo-dash/config'
import { filterQuery, isHourly } from '@/lib/seo-dash/filters'
import { dayLabel, n0, pct } from '@/lib/seo-dash/format'
import { csvHref, hrefOf } from '@/lib/seo-dash/nav'
import { exploration } from '@/lib/seo-dash/server/exploration'
import { openSeoPage, param, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Tile } from '@/components/seo-dash/ui/Tile'
import { Card } from '@/components/seo-dash/ui/Card'
import { BarList } from '@/components/seo-dash/ui/BarList'
import { Bars } from '@/components/seo-dash/charts/Bars'
import { LineChart } from '@/components/seo-dash/charts/LineChart'
import { DelaysCard, ErrorsCard, NeverCard } from '@/components/seo-dash/blocks/ExplorationBlocks'

// @cdc tableau de bord SEO — Exploration : ce que Googlebot et les robots d'IA lisent vraiment (journaux du serveur).

export const dynamic = 'force-dynamic'

export default async function ExplorationPage(props: SeoPageProps) {
  const { filters: f, params, query } = await openSeoPage(props)
  const unit = isHourly(f) ? 'heure' : 'jour'
  const robot = param(params, 'robot') === 'bing' ? 'bing' : 'google'
  const res = await readBlock('exploration', null, (pool) => exploration(pool, f, robot))
  const d = res.value
  const path = hrefOf('exploration')
  const keep: Record<string, string> = robot === 'bing' ? { robot } : {}
  const name = robot === 'bing' ? 'Bingbot' : 'Googlebot'
  const seg = (
    <nav className="sd-seg" aria-label="Robot">
      <Link href={`${path}${query}`} aria-current={robot === 'google' ? 'true' : undefined} scroll={false}>
        Googlebot
      </Link>
      <Link href={`${path}${filterQuery(f, {}, { robot: 'bing' })}`} aria-current={robot === 'bing' ? 'true' : undefined} scroll={false}>
        Bingbot
      </Link>
    </nav>
  )
  const labels = d ? d.days.map(dayLabel) : []
  return (
    <SeoShell current="exploration" title="Exploration" sub="Ce que Googlebot et les robots d’IA lisent vraiment, d’après les journaux du serveur" filters={f} path={path} keep={keep} hide={['compare', 'device']} fresh={`Journaux depuis le ${dayLabel(SITE.logsStart)}`}>
      {d ? (
        <>
          <div className="sd-grid sd-g4 k2">
            <Tile label={`${name}, pages par ${unit}`} value={n0(Math.round(d.total / Math.max(1, d.days.filter((x) => x >= SITE.logsStart).length)))} note={`${n0(d.total)} passages en ${d.days.filter((x) => x >= SITE.logsStart).length} ${unit === 'heure' ? 'heures' : 'jours'}`} />
            <Tile label="Réponses correctes (200)" value={d.total ? pct(d.status.ok / d.total) : '—'} note={`${n0(d.status.e404)} erreurs 4xx · ${n0(d.status.e5xx)} erreurs 5xx`} />
            <Tile label="Robots d’IA" value={n0(d.aiTotal)} note={`passages sur la période`} />
            <Tile label="Jamais vues par Google" value={<>{n0(d.never.paths.length)} <small>/ {n0(d.never.sitemap)}</small></>} note="adresses du plan du site" />
          </div>
          <div className="sd-grid sd-g3 sd-gap">
            <div className="sd-span2">
              <Card title={`${name} par ${unit} et type de page`} desc={`Journaux du serveur${robot === 'google' ? ' (Googlebot vérifié par ses adresses)' : ''}`} tools={seg}>
                <Bars
                  labels={labels}
                  series={[
                    { key: 'fiche', label: 'fiches produits', color: 'var(--sd-s1)', values: d.byDay.fiche },
                    { key: 'article', label: 'articles', color: 'var(--sd-s2)', values: d.byDay.article },
                    { key: 'autre', label: 'autres pages', color: 'var(--sd-s3)', values: d.byDay.autre },
                    { key: 'asset', label: 'images et fichiers', color: 'var(--sd-s4)', values: d.byDay.asset },
                  ]}
                  height={230}
                  label={`${name} par ${unit} et type de page`}
                />
              </Card>
            </div>
            <Card title="Robots d’IA par entreprise" desc="Passages sur la période" csv={csvHref('robots-ia', query)}>
              <BarList items={d.ai.map((a) => ({ key: a.label, label: a.label, value: a.n }))} color="var(--sd-s2)" />
            </Card>
          </div>
          <div className="sd-grid sd-g3 sd-gap">
            <div className="sd-span2">
              <Card title={`Robots d’IA par ${unit}`}>
                <LineChart
                  days={d.days}
                  series={[
                    { key: 's', label: 'pour répondre (recherche)', color: 'var(--sd-s2)', values: d.aiDaily.ai_search },
                    { key: 't', label: 'pour entraîner', color: 'var(--sd-s3)', values: d.aiDaily.ai_training },
                    { key: 'u', label: 'demandé par un utilisateur', color: 'var(--sd-s4)', values: d.aiDaily.ai_user },
                  ]}
                  label={`Passages des robots d’IA par ${unit}`}
                />
              </Card>
            </div>
            <ErrorsCard rows={d.errors} csv={csvHref('erreurs-robots', query)} />
          </div>
          <div className="sd-grid sd-g3 sd-gap">
            <NeverCard never={d.never} csv={csvHref('jamais-vues', query)} />
            <div className="sd-span2">
              <DelaysCard rows={d.delays} query={query} csv={csvHref('delais', query)} />
            </div>
          </div>
        </>
      ) : (
        <p className="sd-note warn">Lecture des journaux impossible pour l’instant.</p>
      )}
    </SeoShell>
  )
}
