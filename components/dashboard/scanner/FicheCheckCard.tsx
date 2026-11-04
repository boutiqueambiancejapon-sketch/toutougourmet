import Link from 'next/link'
import type { FicheCheckStatus } from '@/db/schema/scanner'
import type { FicheChecks } from '@/lib/server/dashboard-fiche-checks'
import { Card, ListRow, Rows, shortMoment } from '../account/parts'
import { Badge } from '../subscribers/RowParts'

// @cdc tableau de bord — contrôle IA des fiches : compte par statut, puis fiches en doute ou rejetées
// avec la raison donnée. Lecture seule : la correction reste dans la fiche à relire.

const nf = new Intl.NumberFormat('fr-FR')

export const CHECK_BADGES: Record<FicheCheckStatus, { label: string; tone: 'green' | 'amber' | 'rose' }> = {
  ok: { label: 'Contrôle ok', tone: 'green' },
  doubt: { label: 'Doute', tone: 'amber' },
  rejected: { label: 'Rejetée', tone: 'rose' },
}

export function FicheCheckCard({ checks }: { checks: FicheChecks }) {
  if (!checks.ready) {
    return (
      <Card title="Contrôle IA des fiches">
        <p className="m-0 text-sm text-ink-2">Table du contrôle absente ou illisible : migration 0009 à appliquer.</p>
      </Card>
    )
  }
  const { counts, flagged } = checks
  const tiles: [string, number][] = [
    ['Ok', counts.ok],
    ['Doute', counts.doubt],
    ['Rejetées', counts.rejected],
    ['À contrôler', counts.pending],
    ['Relues ou écartées', counts.human],
  ]
  return (
    <Card title="Contrôle IA des fiches">
      <dl className="m-0 flex flex-wrap gap-x-5 gap-y-2">
        {tiles.map(([label, n]) => (
          <div key={label} className="flex flex-col">
            <dt className="text-xs text-ink-2">{label}</dt>
            <dd className="m-0 font-display text-xl font-black tabular-nums text-ink">{nf.format(n)}</dd>
          </div>
        ))}
      </dl>
      {flagged.length === 0 ? (
        <p className="m-0 text-sm text-ink-2">Aucune fiche en doute ou rejetée.</p>
      ) : (
        <Rows>
          {flagged.map((f) => (
            <ListRow
              key={f.id}
              main={
                <Link href={`/tableau-de-bord/fiches/${f.id}`} className="text-ink underline underline-offset-2">
                  {[f.brand, f.product].filter(Boolean).join(', ') || 'Fiche sans nom'}
                </Link>
              }
              detail={`${f.reason} · ${f.model} · ${shortMoment(f.at)}`}
              aside={<Badge tone={CHECK_BADGES[f.status].tone}>{CHECK_BADGES[f.status].label}</Badge>}
            />
          ))}
        </Rows>
      )}
    </Card>
  )
}
