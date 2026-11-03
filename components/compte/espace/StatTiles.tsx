import type { ComponentType, ReactNode } from 'react'
import { IconDog, IconScale, IconScan, type IconProps } from '@/components/icons'
import { formatKg } from '@/lib/dog-profile'
import { shortDateFr } from './dates'

// @cdc compte — tuiles de chiffres de la vue d'ensemble : scans photo restants ce mois-ci,
// nombre de chiens, dernière pesée.

interface StatTilesProps {
  used: number
  limit: number
  dogs: number
  lastWeigh: { dogName: string; date: string; weightKg: number } | null
}

function Tile({ Icon, label, value, children, wide }: { Icon: ComponentType<IconProps>; label: string; value: string; children: ReactNode; wide?: boolean }) {
  return (
    <li className={`m-0 flex min-w-0 flex-col gap-1 rounded-card border border-line bg-paper p-4 ${wide ? 'col-span-2 lg:col-span-1' : ''}`}>
      <span className="flex items-center gap-2 text-sm font-semibold text-ink-2">
        <Icon className="size-5" />
        {label}
      </span>
      <span className="whitespace-nowrap font-display text-3xl font-black leading-tight text-ink">{value}</span>
      <span className="text-sm text-ink-2">{children}</span>
    </li>
  )
}

function QuotaBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100
  return (
    <span className="flex flex-col gap-2">
      <span aria-hidden="true" className="block h-2 overflow-hidden rounded-pill bg-cream-2">
        <span className="block h-full rounded-pill bg-orange" style={{ width: `${pct}%` }} />
      </span>
      {`${used} utilisé${used > 1 ? 's' : ''} ce mois-ci`}
    </span>
  )
}

const remaining = (used: number, limit: number) => `${Math.max(0, limit - used)} sur ${limit}`

/** Quota seul, en tête de /compte/scans. */
export function ScanQuota({ used, limit }: { used: number; limit: number }) {
  return (
    <ul role="list" aria-label="Quota du mois" className="m-0 grid list-none grid-cols-1 gap-3 p-0">
      <Tile Icon={IconScan} label="Scans photo restants" value={remaining(used, limit)}>
        <QuotaBar used={used} limit={limit} />
      </Tile>
    </ul>
  )
}

export function StatTiles({ used, limit, dogs, lastWeigh }: StatTilesProps) {
  return (
    <ul role="list" aria-label="Chiffres du compte" className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-3">
      <Tile Icon={IconScan} label="Scans photo restants" value={remaining(used, limit)} wide>
        <QuotaBar used={used} limit={limit} />
      </Tile>
      <Tile Icon={IconDog} label="Chiens" value={String(dogs)}>
        {dogs > 1 ? 'profils enregistrés' : dogs === 1 ? 'profil enregistré' : 'aucun profil'}
      </Tile>
      <Tile Icon={IconScale} label="Dernière pesée" value={lastWeigh ? formatKg(lastWeigh.weightKg) : '—'}>
        {lastWeigh ? `${lastWeigh.dogName}, le ${shortDateFr(lastWeigh.date)}` : 'pas encore de pesée'}
      </Tile>
    </ul>
  )
}
