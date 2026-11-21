import { dayLabel } from '@/lib/seo-dash/format'
import { addDays } from '@/lib/seo-dash/server/range'

// @cdc tableau de bord SEO — calendrier (une colonne par semaine, lundi en haut) : une seule teinte, du clair au foncé
// selon le nombre, légende d'échelle dessous ; le nombre exact au survol (title) et dans la vue tableau.

const STEPS = ['var(--sd-sunk)', 'var(--sd-seq1)', 'var(--sd-seq2)', 'var(--sd-seq3)', 'var(--sd-seq4)', 'var(--sd-seq5)']

function step(n: number, max: number): string {
  if (!n) return STEPS[0]
  return STEPS[Math.min(5, 1 + Math.floor(((n - 1) / Math.max(1, max)) * 5))]
}

export function Calendar({ counts, end, weeks = 17, unit }: { counts: Record<string, number>; end: string; weeks?: number; unit: string }) {
  const endDate = new Date(`${end}T00:00:00Z`)
  const monday = addDays(end, -((endDate.getUTCDay() + 6) % 7) - (weeks - 1) * 7)
  const days: string[] = []
  for (let d = monday; d <= end; d = addDays(d, 1)) days.push(d)
  const max = Math.max(1, ...Object.values(counts))
  const total = days.reduce((a, d) => a + (counts[d] ?? 0), 0)
  return (
    <div>
      <div className="sd-heat" role="img" aria-label={`${total} ${unit} sur ${weeks} semaines`}>
        {days.map((d) => (
          <i key={d} title={`${dayLabel(d)} : ${counts[d] ?? 0} ${unit}`} style={{ background: step(counts[d] ?? 0, max) }} />
        ))}
      </div>
      <p className="sd-scale">
        moins
        {STEPS.map((s) => (
          <i key={s} style={{ background: s }} />
        ))}
        plus
      </p>
    </div>
  )
}
