import type { Kpi } from '@/lib/server/dashboard-queries'

// @cdc tableau de bord — chiffre clé avec écart par rapport à la période précédente.
// Pas de couleur de statut : la flèche et le texte portent le sens de l'écart.

const nf = new Intl.NumberFormat('fr-FR')

function delta({ current, previous }: Kpi): string {
  if (current === 0 && previous === 0) return 'Rien sur les deux périodes'
  if (previous === 0) return `Nouveau (0 avant)`
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return `Stable (${nf.format(previous)} avant)`
  return `${pct > 0 ? '↑ +' : '↓ '}${pct} % (${nf.format(previous)} avant)`
}

export function StatTile({ label, kpi }: { label: string; kpi: Kpi }) {
  return (
    <div className="rounded-card border border-line bg-paper p-4">
      <dt className="text-sm font-semibold text-ink-2">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-black tabular-nums text-ink">{nf.format(kpi.current)}</dd>
      <dd className="mt-1 text-xs text-ink-2">{delta(kpi)}</dd>
    </div>
  )
}
