'use client'

import { useState } from 'react'
import type { BarSeries, ValueFormat } from '@/lib/seo-dash/chart-types'
import { labelIndices, niceTicks } from '@/lib/seo-dash/scale'
import { fmt, Legend, TableView, tickText, Tip, TipRow, useWidth } from './parts'

// @cdc tableau de bord SEO — colonnes (empilées si plusieurs séries) : 24 px au plus, bout arrondi de 4 px, coin
// carré sur la ligne de base, 2 px de fond entre segments. Chaque colonne est sa propre cible de survol.

interface Props {
  labels: string[]
  /** Libellé long pour l'infobulle et la vue tableau (date complète), sinon labels. */
  titles?: string[]
  series: BarSeries[]
  format?: ValueFormat
  height?: number
  label: string
}

const M = { l: 34, r: 8, t: 8, b: 22 }

/** Rectangle au haut arrondi (4 px), bas carré. */
function topRounded(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, h, w / 2)
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`
}

export function Bars({ labels, titles, series, format = 'count', height = 200, label }: Props) {
  const [ref, w] = useWidth()
  const [hover, setHover] = useState<number | null>(null)
  const ih = height - M.t - M.b
  const iw = w - M.l - M.r
  const totals = labels.map((_, i) => series.reduce((a, s) => a + (s.values[i] ?? 0), 0))
  const ticks = niceTicks(0, Math.max(...totals, 1))
  const top = ticks[ticks.length - 1]
  const band = iw / Math.max(1, labels.length)
  const bw = Math.max(2, Math.min(24, band * 0.7))
  const y = (v: number) => M.t + ih - (v / top) * ih
  const names = titles ?? labels
  return (
    <div>
      {series.length > 1 ? <Legend items={series.map((s) => ({ label: s.label, color: s.color, shape: 'box' }))} /> : null}
      <div className="sd-chart" ref={ref}>
        <svg width={w} height={height} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.l} x2={w - M.r} y1={y(t)} y2={y(t)} stroke="var(--sd-line)" strokeWidth="1" />
              <text x={M.l - 6} y={y(t) + 4} textAnchor="end">
                {tickText(t, format)}
              </text>
            </g>
          ))}
          {labels.map((_, i) => {
            const x = M.l + i * band + (band - bw) / 2
            let base = M.t + ih
            const segs = series.map((s) => ({ s, v: s.values[i] ?? 0 })).filter((p) => p.v > 0)
            return (
              <g key={i} opacity={hover === null || hover === i ? 1 : 0.55}>
                {segs.map(({ s, v }, k) => {
                  const h = (v / top) * ih
                  const gap = k > 0 ? 2 : 0
                  const yTop = base - h
                  const d = k === segs.length - 1 ? topRounded(x, yTop, bw, Math.max(0, h - gap), 4) : `M${x},${yTop}h${bw}v${Math.max(0, h - gap)}h${-bw}Z`
                  base = yTop
                  return <path key={s.key} d={d} fill={s.color} />
                })}
                <rect x={M.l + i * band} y={M.t} width={band} height={ih} fill="transparent" onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} />
              </g>
            )
          })}
          {labelIndices(labels.length, Math.max(3, Math.floor(iw / 64))).map((i) => (
            <text key={i} x={M.l + i * band + band / 2} y={height - 6} textAnchor="middle">
              {labels[i]}
            </text>
          ))}
        </svg>
        {hover !== null ? (
          <Tip x={M.l + hover * band + band / 2} w={w} title={names[hover]}>
            {series.length > 1 ? <TipRow color="var(--sd-ink)" label="total" value={fmt(totals[hover], format)} /> : null}
            {series.map((s) => (
              <TipRow key={s.key} color={s.color} label={s.label} value={fmt(s.values[hover] ?? 0, format)} />
            ))}
          </Tip>
        ) : null}
      </div>
      <TableView head={['', ...series.map((s) => s.label)]} rows={names.map((n, i) => [n, ...series.map((s) => fmt(s.values[i] ?? 0, format))])} />
    </div>
  )
}
