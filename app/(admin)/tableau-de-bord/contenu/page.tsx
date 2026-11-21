import Link from 'next/link'
import { dayLabel, n0 } from '@/lib/seo-dash/format'
import { csvHref, hrefOf, pageHref } from '@/lib/seo-dash/nav'
import { publications } from '@/lib/seo-dash/server/content'
import { gscDaily } from '@/lib/seo-dash/server/gsc-core'
import { chartNotes, journal } from '@/lib/seo-dash/server/notes'
import { openSeoPage, type SeoPageProps } from '@/lib/seo-dash/server/page'
import { addDays, gscLastDay, logRanges } from '@/lib/seo-dash/server/range'
import { readBlock } from '@/lib/seo-dash/server/sql'
import { SeoShell } from '@/components/seo-dash/shell/SeoShell'
import { Card, Empty } from '@/components/seo-dash/ui/Card'
import { LineChart } from '@/components/seo-dash/charts/LineChart'
import { Calendar } from '@/components/seo-dash/charts/Calendar'
import { Journal, NoteForm } from '@/components/seo-dash/blocks/NotesBlocks'

// @cdc tableau de bord SEO — Contenu & notes : ce qui a été publié ou changé, et quand, pour relier une hausse ou une
// baisse à sa cause. Les notes posées ici apparaissent en pastilles sur toutes les courbes du tableau de bord.

export const dynamic = 'force-dynamic'

const avg7 = (v: number[]) => v.map((_, i) => Math.round((v.slice(Math.max(0, i - 6), i + 1).reduce((a, b) => a + b, 0) / Math.min(7, i + 1)) * 10) / 10)

export default async function ContentPage(props: SeoPageProps) {
  const { filters: f, query } = await openSeoPage(props)
  const today = logRanges(f).last
  const res = await readBlock('contenu', null, async (pool) => {
    const last = await gscLastDay(pool)
    const range = { start: addDays(last, -120), end: last }
    const [daily, notes, items, fiches] = await Promise.all([
      gscDaily(pool, { ...f, pages: 'toutes' }, range),
      chartNotes(pool, range),
      journal(pool, { start: addDays(today, -120), end: today }),
      pool.query<{ day: string; n: number }>(`SELECT updated_at::date::text AS day, count(*)::int AS n FROM app.fiche_index WHERE actif GROUP BY 1`),
    ])
    const seen = await pool.query<{ page: string; d: string }>(`SELECT page, min(day)::text AS d FROM analytics.gsc_page_daily WHERE impressions > 0 GROUP BY 1`)
    return { daily, notes, items, fiches: Object.fromEntries(fiches.rows.map((r) => [r.day, r.n])), seen: new Map(seen.rows.map((r) => [r.page, r.d])) }
  })
  const pubs = publications()
  const byDay: Record<string, number> = {}
  for (const p of pubs) byDay[p.date] = (byDay[p.date] ?? 0) + 1
  const d = res.value
  return (
    <SeoShell current="contenu" title="Contenu & notes" sub="Ce qui a été publié ou changé, et quand : pour relier une hausse ou une baisse à sa cause">
      <div className="sd-grid sd-g3">
        <div className="sd-span2">
          {d ? (
            <Card title="Toutes les notes sur la courbe des clics" desc="4 mois · les mêmes pastilles apparaissent sur chaque graphique du tableau de bord">
              <LineChart
                days={d.daily.map((x) => x.day)}
                series={[
                  { key: 'day', label: 'clics du jour', color: 'var(--sd-prev)', values: d.daily.map((x) => x.clicks), muted: true },
                  { key: 'avg', label: 'clics Google, moyenne 7 jours', color: 'var(--sd-s1)', values: avg7(d.daily.map((x) => x.clicks)) },
                ]}
                notes={d.notes}
                format="decimal"
                label="Clics Google sur 4 mois avec les notes"
              />
            </Card>
          ) : null}
        </div>
        <NoteForm today={today} />
      </div>
      <div className="sd-grid sd-g3 sd-gap">
        <div className="sd-span2 sd-grid">
          <Card title="Calendrier des publications" desc={`${n0(pubs.length)} articles en ligne · survol d’une case pour le détail`}>
            <Calendar counts={byDay} end={today} unit="articles publiés" />
          </Card>
          {d ? (
            <Card title="Fiches produits ouvertes à Google" desc="Lots quotidiens de l’index des fiches (tableau de bord, fiches)">
              <Calendar counts={d.fiches} end={today} unit="fiches ouvertes" />
            </Card>
          ) : null}
        </div>
        {d ? <Journal items={d.items} /> : null}
      </div>
      <Card title="Derniers articles publiés" csv={csvHref('publications', query)} className="sd-gap">
        {pubs.length ? (
          <div className="sd-tw">
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th className="sd-hide-m">Rubrique</th>
                  <th className="num">Publié</th>
                  <th>1er affichage</th>
                </tr>
              </thead>
              <tbody>
                {pubs.slice(0, 12).map((p) => {
                  const seen = d?.seen.get(p.path)
                  return (
                    <tr key={p.path}>
                      <td className="u">
                        <Link href={pageHref(p.path, query)} title={p.title}>
                          {p.title}
                        </Link>
                      </td>
                      <td className="sd-hide-m">{p.category}</td>
                      <td className="num">{dayLabel(p.date)}</td>
                      <td className={seen ? 'sd-nw' : 'sd-nw sd-muted'}>{seen ? dayLabel(seen) : 'pas encore'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Aucun article.</Empty>
        )}
      </Card>
      <p className="sd-small sd-muted sd-gap">
        Messages du formulaire, tâche de nuit et fiches à relire : <Link className="sd-lk" href={hrefOf('relecture')}>Messages et relecture</Link>.
      </p>
    </SeoShell>
  )
}
