import type { WeightPoint } from '@/lib/weight-trend'
import { formatDateFr, formatKg } from '@/lib/dog-profile'

// @cdc premium — courbe de poids, SVG rendu serveur (aucune dépendance, aucun script).
// Une seule série : pas de légende, le titre la nomme. Ligne 2 px, points de 8 px cernés de
// blanc, grille discrète, zone de poids adulte de la race si data/breeds.ts la donne. Survol :
// infobulle native (<title>) sur une cible plus large que le point. Tableau des valeurs replié.

const W = 340
const H = 200
const PAD = { top: 16, right: 44, bottom: 28, left: 40 }

const day = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86_400_000
}

const shortDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

/** Graduations « rondes » entre min et max (pas de 0,5, 1, 2, 5 ou 10 kg). */
function ticks(min: number, max: number): number[] {
  const span = max - min
  const step = [0.5, 1, 2, 5, 10, 20].find((s) => span / s <= 4) ?? 20
  const out: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Math.round(v * 10) / 10)
  return out
}

interface WeightChartProps {
  name: string
  /** Pesées triées de la plus ancienne à la plus récente */
  points: WeightPoint[]
  ideal?: { min: number; max: number; label: string }
}

export function WeightChart({ name, points, ideal }: WeightChartProps) {
  if (points.length === 0) return null
  if (points.length < 2)
    return <p className="m-0 rounded-box bg-cream-2 px-4 py-3 text-[15px] text-ink-2">La courbe s&apos;affiche dès la deuxième pesée, à une autre date.</p>
  const weights = points.map((p) => p.weightKg)
  // La zone de la race n'élargit l'échelle que si elle reste proche des pesées (sinon un chiot écrase la courbe).
  const near = ideal && ideal.min <= Math.max(...weights) * 1.5 && ideal.max >= Math.min(...weights) * 0.67
  const lo = Math.min(...weights, ...(near && ideal ? [ideal.min] : []))
  const hi = Math.max(...weights, ...(near && ideal ? [ideal.max] : []))
  const pad = Math.max((hi - lo) * 0.15, 0.5)
  const yMin = Math.max(0, lo - pad)
  const yMax = hi + pad
  const x0 = day(points[0].date)
  const x1 = day(points[points.length - 1].date)
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const x = (iso: string) => (x1 === x0 ? PAD.left + plotW / 2 : PAD.left + ((day(iso) - x0) / (x1 - x0)) * plotW)
  const y = (kg: number) => PAD.top + (1 - (kg - yMin) / (yMax - yMin)) * plotH
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.date).toFixed(1)},${y(p.weightKg).toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  const titleId = `courbe-${name.replace(/\W+/g, '-')}`
  const bandTop = ideal ? y(Math.min(ideal.max, yMax)) : 0
  const bandBottom = ideal ? y(Math.max(ideal.min, yMin)) : 0
  const showBand = ideal && near && bandBottom > bandTop

  return (
    <figure className="m-0 flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={titleId} className="h-auto w-full overflow-visible">
        <title id={titleId}>{`Courbe de poids de ${name} : ${points.length} pesée${points.length > 1 ? 's' : ''}, dernière ${formatKg(last.weightKg)} le ${formatDateFr(last.date)}${showBand ? `. ${ideal.label}` : ''}`}</title>
        {showBand ? (
          <g>
            <rect x={PAD.left} y={bandTop} width={plotW} height={bandBottom - bandTop} fill="var(--green-bg)" />
            <text x={PAD.left + 4} y={bandTop + 12} fontSize="10" fill="var(--green-ink)">
              {ideal.label}
            </text>
          </g>
        ) : null}
        {ticks(yMin, yMax).map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y(t) + 3} fontSize="10" textAnchor="end" fill="var(--ink-2)">
              {String(t).replace('.', ',')}
            </text>
          </g>
        ))}
        <text x={PAD.left - 6} y={PAD.top - 6} fontSize="10" textAnchor="end" fill="var(--ink-2)">
          kg
        </text>
        <text x={x1 === x0 ? PAD.left + plotW / 2 : PAD.left} y={H - 8} fontSize="10" textAnchor={x1 === x0 ? 'middle' : 'start'} fill="var(--ink-2)">
          {shortDate(points[0].date)}
        </text>
        {x1 !== x0 ? (
          <text x={W - PAD.right} y={H - 8} fontSize="10" textAnchor="end" fill="var(--ink-2)">
            {shortDate(last.date)}
          </text>
        ) : null}
        <path d={path} fill="none" stroke="var(--orange-ink)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={`${p.date}-${i}`}>
            <title>{`${formatDateFr(p.date)} : ${formatKg(p.weightKg)}`}</title>
            <circle cx={x(p.date)} cy={y(p.weightKg)} r="12" fill="transparent" />
            <circle cx={x(p.date)} cy={y(p.weightKg)} r="4" fill="var(--orange-ink)" stroke="var(--white)" strokeWidth="2" />
          </g>
        ))}
        <text x={x(last.date) + 8} y={y(last.weightKg) + 4} fontSize="11" fontWeight="600" fill="var(--ink)">
          {formatKg(last.weightKg)}
        </text>
      </svg>
      <details className="text-sm text-ink-2">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-ink">Voir les valeurs</summary>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{`Pesées de ${name}`}</caption>
          <thead>
            <tr>
              <th scope="col" className="border-b border-line py-1 font-semibold">Date</th>
              <th scope="col" className="border-b border-line py-1 text-right font-semibold">Poids</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={`${p.date}-${i}`}>
                <td className="border-b border-line py-1">{formatDateFr(p.date)}</td>
                <td className="border-b border-line py-1 text-right">{formatKg(p.weightKg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
