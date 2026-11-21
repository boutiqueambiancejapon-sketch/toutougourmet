'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NOTE_COLOR, NOTE_LABEL, type ChartNote, type NoteKind, type ValueFormat } from '@/lib/seo-dash/chart-types'
import { axisNum, dayLabel, eur, n0, n1, pct } from '@/lib/seo-dash/format'

// @cdc tableau de bord SEO — pièces communes des graphiques : mesure de la largeur, légende, pastilles des
// notes sous l'axe, infobulle (valeur en gras d'abord, nom ensuite), vue tableau qui ne dépend pas du survol.

export function useWidth(initial = 640): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [w, setW] = useState(initial)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

export function fmt(v: number | null | undefined, f: ValueFormat): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—'
  if (f === 'position' || f === 'decimal') return n1(v)
  if (f === 'pct') return pct(v)
  if (f === 'eur') return eur(v)
  return n0(v)
}

export const tickText = (v: number, f: ValueFormat): string => (f === 'pct' ? pct(v) : axisNum(v))

export interface LegendItem {
  label: string
  color: string
  shape: 'line' | 'box' | 'pin'
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="sd-legend">
      {items.map((it) => (
        <li key={it.label}>
          {it.shape === 'line' ? <i className="ln" style={{ background: it.color }} /> : it.shape === 'box' ? <i className="bx" style={{ background: it.color }} /> : <i className="mk" style={{ borderColor: it.color }} />}
          {it.label}
        </li>
      ))}
    </ul>
  )
}

export function noteLegend(notes: ChartNote[]): LegendItem[] {
  const kinds = [...new Set(notes.map((n) => n.kind))] as NoteKind[]
  return kinds.map((k) => ({ label: NOTE_LABEL[k], color: NOTE_COLOR[k], shape: 'pin' }))
}

/** Pastilles sous l'axe et filets verticaux : une par jour noté (la plus importante si plusieurs). */
export function NoteMarks({ notes, xOf, top, bottom }: { notes: ChartNote[]; xOf: (day: string) => number | null; top: number; bottom: number }) {
  const seen = new Set<string>()
  return (
    <g aria-hidden="true">
      {notes.map((n) => {
        const x = xOf(n.day)
        if (x === null || seen.has(n.day)) return null
        seen.add(n.day)
        return (
          <g key={`${n.day}-${n.kind}`}>
            <line x1={x} x2={x} y1={top} y2={bottom} stroke="var(--sd-line-2)" strokeWidth="1" />
            <circle cx={x} cy={bottom + 24} r="5" fill="var(--sd-card)" stroke={NOTE_COLOR[n.kind]} strokeWidth="2" />
          </g>
        )
      })}
    </g>
  )
}

export function Tip({ x, w, title, children }: { x: number; w: number; title: string; children: ReactNode }) {
  const left = x > w - 190 ? Math.max(0, x - 180) : x + 12
  return (
    <div className="sd-tip" style={{ left, top: 8 }} role="status">
      <div className="t">{title}</div>
      {children}
    </div>
  )
}

export function TipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="r">
      <b>{value}</b>
      <span>
        {label}
        <i style={{ background: color }} />
      </span>
    </div>
  )
}

export function TableView({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="sd-tview">
      <summary>Voir en tableau</summary>
      <div className="sd-tw">
        <table>
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={h} className={i ? 'num' : undefined}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j ? 'num' : undefined}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

export const dayText = (d: string | undefined): string => (d ? dayLabel(d) : '')
