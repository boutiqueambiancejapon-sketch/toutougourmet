import Link from 'next/link'
import { accountHref, accountStatus, dogNamesLine } from '@/lib/dashboard/account-status'
import type { AccountRow, AccountsResult } from '@/lib/server/dashboard-accounts'
import { Empty } from '../Panel'
import { Badge } from './RowParts'

// @cdc tableau de bord — comptes créés (base du site), plus récents d'abord. Une ligne : adresse,
// chiens, date de création, pastille. Toute la ligne ouvre la fiche du compte.

const dayFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Europe/Paris' })

function Row({ account }: { account: AccountRow }) {
  const status = accountStatus(account)
  return (
    <li className="border-b border-line last:border-b-0">
      <Link href={accountHref(account.id)} className="flex min-h-11 items-center justify-between gap-3 py-3 text-ink no-underline hover:text-orange-ink">
        <span className="min-w-0">
          <span className="block truncate font-semibold">{account.email}</span>
          <span className="block text-xs text-ink-2">
            {dogNamesLine(account.dogNames)} · créé le {dayFmt.format(account.createdAt)}
          </span>
        </span>
        <span className="shrink-0">
          <Badge tone={status.tone}>{status.label}</Badge>
        </span>
      </Link>
    </li>
  )
}

export function AccountList({ result, query }: { result: AccountsResult; query: string }) {
  if (!result.ok) {
    return (
      <p role="status" className="m-0 rounded-box border border-amber bg-amber-bg px-4 py-3 text-sm text-amber-ink">
        La base des comptes n’a pas pu être lue. Recharge la page dans une minute.
      </p>
    )
  }
  if (result.rows.length === 0) {
    return <Empty>{query ? 'Aucun compte ne correspond à cette adresse ni à ce nom de chien.' : 'Aucun compte créé pour le moment.'}</Empty>
  }
  return (
    <ol className="m-0 list-none p-0">
      {result.rows.map((a) => (
        <Row key={a.id} account={a} />
      ))}
    </ol>
  )
}
