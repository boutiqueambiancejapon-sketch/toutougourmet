import Link from 'next/link'
import type { PeriodCounts, ScannerCounts } from '@/lib/scanner/scanner-events'
import { Card } from '../account/parts'

// @cdc tableau de bord — chiffres du scanner : scans du jour et sur 7 jours par type, échecs,
// introuvables, signalements à lire, plafond quotidien de lectures par photo.

const nf = new Intl.NumberFormat('fr-FR')

function Tile({ value, label, detail }: { value: string; label: string; detail?: string }) {
  return (
    <div className="rounded-card border border-line bg-paper p-3">
      <dt className="text-sm font-semibold text-ink-2">{label}</dt>
      <dd className="m-0 mt-1 font-display text-3xl font-black tabular-nums text-ink">{value}</dd>
      {detail ? <dd className="m-0 mt-1 text-xs text-ink-2">{detail}</dd> : null}
    </div>
  )
}

const byType = (p: PeriodCounts): string => `${nf.format(p.code)} code-barres, ${nf.format(p.photo)} photo`
const total = (p: PeriodCounts): string => nf.format(p.code + p.photo)

export function ScannerTiles({ counts, reports }: { counts: ScannerCounts; reports: number | null }) {
  const { today, week } = counts
  return (
    <dl className="m-0 mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
      <Tile value={total(today)} label="Scans aujourd’hui" detail={byType(today)} />
      <Tile value={total(week)} label="Scans sur 7 jours" detail={byType(week)} />
      <Tile value={nf.format(today.failures)} label="Échecs aujourd’hui" detail={`${nf.format(week.failures)} sur 7 jours`} />
      <Tile value={nf.format(today.missing)} label="Introuvables aujourd’hui" detail={`${nf.format(week.missing)} sur 7 jours`} />
      <div className="col-span-2 md:col-span-1">
        <Tile value={reports === null ? '?' : nf.format(reports)} label="Signalements à lire" detail={reports === null ? 'Lecture impossible' : undefined} />
        {reports ? (
          <Link href="/tableau-de-bord/contenu#fiches" className="mt-1 block text-xs text-ink-2 underline underline-offset-2">
            Ouvrir les fiches à relire
          </Link>
        ) : null}
      </div>
    </dl>
  )
}

export function DailyCap({ calls, cap }: { calls: number | null; cap: number }) {
  const share = calls === null ? 0 : Math.min((calls / cap) * 100, 100)
  return (
    <Card title="Plafond de lectures par photo aujourd’hui">
      <div className="h-2 overflow-hidden rounded-pill bg-cream-2">
        <div className="h-full rounded-pill bg-orange" style={{ width: `${share}%` }} />
      </div>
      <p className="m-0 text-sm text-ink-2">{calls === null ? 'Compteur non lu.' : `${nf.format(calls)} sur ${nf.format(cap)}`}</p>
    </Card>
  )
}
