import Link from 'next/link'
import { contactLine, contactStatus } from '@/lib/dashboard/crm'
import type { TrackingRow } from '@/lib/dashboard/email-tracking'
import { trackingSource } from '@/lib/dashboard/email-tracking'
import { CONTACTS_PATH } from '@/lib/dashboard/subscriber-search'
import { Empty } from '../Panel'
import { Badge, shortDate } from '../subscribers/RowParts'

// @cdc tableau de bord — une ligne par contact, toute la ligne ouvre sa fiche. L'URL porte
// l'empreinte de l'adresse, jamais l'adresse : Caddy journalise les URL.

export interface ContactItem {
  row: TrackingRow
  next: { step: string; inDays: number } | null
}

function subLine(r: TrackingRow): string {
  const dogs = r.account?.dogNames?.length ? r.account.dogNames.join(', ') : null
  const since = r.listedAt ?? r.account?.createdAt
  return [dogs, since ? `depuis le ${shortDate(since)}` : null, trackingSource(r)].filter(Boolean).join(' · ')
}

export function ContactList({ items, query }: { items: ContactItem[]; query: string }) {
  if (items.length === 0) return <Empty>{query ? 'Aucun contact ne correspond à cette recherche.' : 'Aucun contact dans cette liste.'}</Empty>
  return (
    <ol className="m-0 list-none p-0">
      {items.map(({ row, next }) => {
        const status = contactStatus(row)
        return (
          <li key={row.hash} className="border-b border-line last:border-b-0">
            <Link href={`${CONTACTS_PATH}/${row.hash}`} className="flex min-h-11 items-start justify-between gap-3 py-3 text-ink no-underline hover:text-orange-ink">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{row.email}</span>
                <span className="block text-xs text-ink-2 [overflow-wrap:anywhere]">{subLine(row)}</span>
                <span className="block text-xs text-ink-2">{contactLine(row, next)}</span>
              </span>
              <span className="shrink-0">
                <Badge tone={status.tone}>{status.label}</Badge>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
