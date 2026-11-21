import type { ReactNode } from 'react'
import type { DeltaText } from '@/lib/seo-dash/format'

// @cdc tableau de bord SEO — tuile chiffrée : libellé, valeur, écart signé contre la période nommée (couleur =
// sens × bon ou mauvais, avec une flèche), petite courbe : période d'avant en gris, période en cours en orange.

interface TileProps {
  label: ReactNode
  value: ReactNode
  delta?: DeltaText | null
  /** « contre 1 546 » */
  against?: string
  /** Lignes sous la valeur quand il n'y a pas d'écart (ex. « suivi depuis le 2 nov. »). */
  note?: ReactNode
  spark?: number[]
  sparkPrev?: number[]
  /** Pour une position : plus bas = mieux, la courbe est inversée. */
  invert?: boolean
  hero?: boolean
  children?: ReactNode
}

function Arrow({ dir }: { dir: DeltaText['dir'] }) {
  if (dir === 'flat') return null
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="sd-arrow">
      <path d={dir === 'up' ? 'M5 9V1M1.5 4.5L5 1l3.5 3.5' : 'M5 1v8M1.5 5.5L5 9l3.5-3.5'} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function DeltaLine({ delta, against }: { delta: DeltaText; against?: string }) {
  return (
    <div className="sd-cmp">
      <span className={`sd-delta ${delta.tone}`}>
        <Arrow dir={delta.dir} />
        {delta.text}
      </span>
      {against ? ` ${against}` : ''}
    </div>
  )
}

export function Sparkline({ values, prev, invert = false, width = 120, height = 28 }: { values: number[]; prev?: number[]; invert?: boolean; width?: number; height?: number }) {
  if (values.length < 2) return null
  const all = [...values, ...(prev ?? [])]
  const min = Math.min(...all)
  const max = Math.max(...all)
  const span = max - min || 1
  const x = (i: number, n: number) => 2 + (i / (n - 1)) * (width - 6)
  const y = (v: number) => {
    const t = (v - min) / span
    return 3 + (invert ? t : 1 - t) * (height - 6)
  }
  const path = (s: number[]) => s.map((v, i) => `${i ? 'L' : 'M'}${x(i, s.length).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const last = values[values.length - 1]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Évolution sur la période">
      {prev && prev.length > 1 ? <path d={path(prev)} fill="none" stroke="var(--sd-prev)" strokeWidth="1.5" strokeLinejoin="round" /> : null}
      <path d={path(values)} fill="none" stroke="var(--sd-s1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(values.length - 1, values.length)} cy={y(last)} r="3" fill="var(--sd-s1)" stroke="var(--sd-card)" strokeWidth="1.5" />
    </svg>
  )
}

export function Tile({ label, value, delta, against, note, spark, sparkPrev, invert, hero = false, children }: TileProps) {
  return (
    <div className="sd-card sd-tile">
      <div className="sd-lab">{label}</div>
      <div className={hero ? 'sd-hero' : 'sd-val'}>{value}</div>
      {delta ? <DeltaLine delta={delta} against={against} /> : null}
      {note ? <div className="sd-cmp">{note}</div> : null}
      {spark ? <Sparkline values={spark} prev={sparkPrev} invert={invert} /> : null}
      {children}
    </div>
  )
}
