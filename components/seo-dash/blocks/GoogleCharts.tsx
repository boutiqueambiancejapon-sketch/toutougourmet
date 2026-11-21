import Link from 'next/link'
import type { ChartNote } from '@/lib/seo-dash/chart-types'
import type { DayPoint } from '@/lib/seo-dash/server/gsc-core'
import { LineChart } from '../charts/LineChart'
import { Card } from '../ui/Card'

// @cdc tableau de bord SEO — courbe des clics par jour (ou par semaine), période d'avant en gris, notes en pastilles ;
// à côté, affichages et position moyenne (axe inversé), chacun avec sa propre échelle dans son propre graphique.

/** Regroupe par semaine de 7 jours en partant de la fin (la dernière semaine est toujours complète). */
export function weekly(d: DayPoint[]): DayPoint[] {
  const out: DayPoint[] = []
  for (let end = d.length; end > 0; end -= 7) {
    const chunk = d.slice(Math.max(0, end - 7), end)
    const clicks = chunk.reduce((a, x) => a + x.clicks, 0)
    const impressions = chunk.reduce((a, x) => a + x.impressions, 0)
    const position = impressions ? chunk.reduce((a, x) => a + x.position * x.impressions, 0) / impressions : 0
    out.unshift({ day: chunk[0].day, clicks, impressions, ctr: impressions ? clicks / impressions : 0, position })
  }
  return out
}

interface Props {
  daily: DayPoint[]
  prevDaily: DayPoint[]
  notes: ChartNote[]
  prevLabel: string
  curLabel: string
  week: boolean
  dayHref: string
  weekHref: string
  /** Sur Aujourd'hui : un bouton « Détail » vers l'écran Google au lieu du choix jour / semaine. */
  detailHref?: string
}

export function ClicksCard({ daily, prevDaily, notes, prevLabel, curLabel, week, dayHref, weekHref, detailHref }: Props) {
  const cur = week ? weekly(daily) : daily
  const prev = week ? weekly(prevDaily) : prevDaily
  const series = [
    ...(prev.length ? [{ key: 'prev', label: prevLabel, color: 'var(--sd-prev)', values: prev.map((p) => p.clicks), muted: true, days: prev.map((p) => p.day) }] : []),
    { key: 'cur', label: curLabel, color: 'var(--sd-s1)', values: cur.map((p) => p.clicks) },
  ]
  const seg = detailHref ? (
    <Link className="sd-btn" href={detailHref}>
      Détail
    </Link>
  ) : (
    <nav className="sd-seg" aria-label="Pas de temps">
      <Link href={dayHref} aria-current={week ? undefined : 'true'} scroll={false}>
        Jour
      </Link>
      <Link href={weekHref} aria-current={week ? 'true' : undefined} scroll={false}>
        Semaine
      </Link>
    </nav>
  )
  return (
    <Card title={week ? 'Clics par semaine' : 'Clics par jour'} desc="Passer le doigt sur la courbe pour lire un jour ; les pastilles sous l’axe sont vos notes." tools={seg}>
      <LineChart days={cur.map((p) => p.day)} series={series} notes={week ? [] : notes} label="Clics Google par jour" />
    </Card>
  )
}

export function SmallSeries({ title, desc, daily, kind }: { title: string; desc?: string; daily: DayPoint[]; kind: 'impressions' | 'position' }) {
  return (
    <Card title={title} desc={desc}>
      <LineChart
        days={daily.map((p) => p.day)}
        series={[{ key: kind, label: title, color: 'var(--sd-s1)', values: daily.map((p) => (kind === 'position' && !p.impressions ? null : p[kind])) }]}
        format={kind === 'position' ? 'position' : 'count'}
        invert={kind === 'position'}
        height={150}
        legend={false}
        label={title}
      />
    </Card>
  )
}
