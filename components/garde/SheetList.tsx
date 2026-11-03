import Link from 'next/link'
import type { SitterSheet } from '@/db/schema'
import { IconChevron } from '@/components/icons'
import { formatDay } from '@/lib/garde/sheet'

// @cdc fiche de garde — fiches d'un chien dans l'espace compte, la plus récente en premier.

export function periodOf(s: Pick<SitterSheet, 'startsOn' | 'endsOn'>): string {
  return s.startsOn === s.endsOn ? `Le ${formatDay(s.startsOn)}` : `Du ${formatDay(s.startsOn)} au ${formatDay(s.endsOn)}`
}

export function SheetList({ sheets, now }: { sheets: SitterSheet[]; now: number }) {
  if (sheets.length === 0) return <p className="m-0 text-base text-ink-2">Aucune fiche pour l&apos;instant.</p>
  return (
    <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
      {sheets.map((s) => {
        const live = s.expiresAt.getTime() > now
        return (
          <li key={s.id}>
            <Link href={`/compte/chien/${s.dogId}/garde/${s.id}`} className="group flex min-h-14 items-center gap-3 py-3 text-ink no-underline">
              <span className="flex min-w-0 grow flex-col">
                <span className="font-semibold leading-snug group-hover:underline">{periodOf(s)}</span>
                <span className="text-sm text-ink-2">{live ? 'Lien actif' : 'Lien expiré'}</span>
              </span>
              <span className={`shrink-0 rounded-pill px-2 py-0.5 text-xs font-semibold ${live ? 'bg-green text-green-ink' : 'bg-cream-2 text-ink-2'}`}>
                {live ? 'Active' : 'Expirée'}
              </span>
              <IconChevron className="size-4 text-ink-2" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
