'use client'

import { useState } from 'react'
import { NOTE_LABEL, type ChartNote, type LineSeries, type ValueFormat } from '@/lib/seo-dash/chart-types'
import { labelIndices, niceTicks } from '@/lib/seo-dash/scale'
import { dayText, fmt, Legend, noteLegend, NoteMarks, TableView, tickText, Tip, TipRow, useWidth } from './parts'

// @cdc tableau de bord SEO — courbe par jour : trait de 2 px, période de comparaison en gris dessous, filet
// vertical qui suit le doigt et se cale sur le jour le plus proche, infobulle avec toutes les séries et les notes
// du jour. Une seule échelle. invert : axe retourné pour une position (en haut = mieux classé).

interface Props {
  days: string[]
  series: LineSeries[]
  notes?: ChartNote[]
  format?: ValueFormat
  invert?: boolean
  height?: number
  /** Une série seule n'a pas de légende : le titre de la carte la nomme. */
  legend?: boolean
  label: string
}

const M = { l: 34, r: 12, t: 8, b: 22 }

export function LineChart({ days, series, notes = [], format = 'count', invert = false, height = 220, legend = true, label }: Props) {
  const [ref, w] = useWidth()
  const [hover, setHover] = useState<number | null>(null)
  const pinsBand = notes.length ? 30 : 0
  const ih = height - M.t - M.b
  const iw = w - M.l - M.r
  const vals = series.flatMap((s) => s.values.filter((v): v is number => v !== null))
  const ticks = invert ? niceTicks(Math.max(1, Math.floor(Math.min(...vals, 20))), Math.ceil(Math.max(...vals, 2))) : niceTicks(0, Math.max(...vals, 1))
  const t0 = ticks[0]
  const t1 = ticks[ticks.length - 1]
  const x = (i: number) => M.l + (days.length > 1 ? (i / (days.length - 1)) * iw : iw / 2)
  const y = (v: number) => {
    const t = (v - t0) / (t1 - t0 || 1)
    return M.t + (invert ? t : 1 - t) * ih
  }
  const idx = new Map(days.map((d, i) => [d, i]))
  const xOfDay = (d: string) => (idx.has(d) ? x(idx.get(d) ?? 0) : null)
  const path = (vs: (number | null)[]) => {
    let d = ''
    vs.forEach((v, i) => {
      if (v === null) return
      d += `${d && vs[i - 1] !== null ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`
    })
    return d
  }
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left) / r.width) * (days.length - 1))
    setHover(Math.max(0, Math.min(days.length - 1, i)))
  }
  const main = series.filter((s) => !s.muted)
  const items = [...series.map((s) => ({ label: s.label, color: s.color, shape: 'line' as const })), ...noteLegend(notes)]
  return (
    <div>
      {legend || notes.length ? <Legend items={legend ? items : noteLegend(notes)} /> : null}
      <div className="sd-chart" ref={ref}>
        <svg width={w} height={height + pinsBand} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.l} x2={w - M.r} y1={y(t)} y2={y(t)} stroke="var(--sd-line)" strokeWidth="1" />
              <text x={M.l - 6} y={y(t) + 4} textAnchor="end">
                {tickText(t, format)}
              </text>
            </g>
          ))}
          <NoteMarks notes={notes} xOf={xOfDay} top={M.t} bottom={M.t + ih} />
          {labelIndices(days.length, Math.max(3, Math.floor(iw / 70))).map((i) => (
            <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === days.length - 1 ? 'end' : 'middle'}>
              {dayText(days[i])}
            </text>
          ))}
          {series.map((s) => (
            <path key={s.key} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={s.muted ? 1.5 : 2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {main.map((s) => {
            const last = s.values.length - 1
            const v = s.values[last]
            return v === null ? null : <circle key={s.key} cx={x(last)} cy={y(v)} r="4" fill={s.color} stroke="var(--sd-card)" strokeWidth="2" />
          })}
          {hover !== null ? <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={M.t + ih} stroke="var(--sd-ink-3)" strokeWidth="1" /> : null}
          {hover !== null
            ? series.map((s) => {
                const v = s.values[hover]
                return v === null || v === undefined ? null : <circle key={s.key} cx={x(hover)} cy={y(v)} r="4" fill={s.color} stroke="var(--sd-card)" strokeWidth="2" />
              })
            : null}
          <rect x={M.l} y={0} width={iw} height={height} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
        </svg>
        {hover !== null ? (
          <Tip x={x(hover)} w={w} title={dayText(days[hover])}>
            {series.map((s) => (
              <TipRow key={s.key} color={s.color} label={s.days?.[hover] ? `${s.label} (${dayText(s.days[hover])})` : s.label} value={fmt(s.values[hover], format)} />
            ))}
            {notes
              .filter((n) => n.day === days[hover])
              .map((n) => (
                <div key={n.text} className="note">{`${NOTE_LABEL[n.kind]} : ${n.text}`}</div>
              ))}
          </Tip>
        ) : null}
      </div>
      <TableView head={['Jour', ...series.map((s) => s.label)]} rows={days.map((d, i) => [dayText(d), ...series.map((s) => fmt(s.values[i], format))])} />
    </div>
  )
}
