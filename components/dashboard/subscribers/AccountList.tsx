import type { AccountsResult } from '@/lib/server/dashboard-accounts'
import { signupPlaceLabel } from '@/lib/signup-places'
import { Empty } from '../Panel'
import { Badge, shortDate, SubscriberItem } from './RowParts'

// @cdc tableau de bord — comptes créés (base du site), plus récents d'abord.

const nf = new Intl.NumberFormat('fr-FR')

export function AccountList({ result, query }: { result: AccountsResult; query: string }) {
  if (!result.ok) {
    return (
      <p role="status" className="m-0 rounded-box border border-amber bg-amber-bg px-4 py-3 text-sm text-amber-ink">
        La base des comptes n’a pas pu être lue. Recharge la page dans une minute.
      </p>
    )
  }
  if (result.rows.length === 0) {
    return <Empty>{query ? 'Aucun compte ne porte une adresse qui contient cette recherche.' : 'Aucun compte créé pour le moment.'}</Empty>
  }
  return (
    <ol className="m-0 list-none p-0">
      {result.rows.map((a) => (
        <SubscriberItem key={`${a.email}-${a.createdAt.toISOString()}`} email={a.email}>
          <span>{shortDate(a.createdAt)}</span>
          <span aria-hidden="true">·</span>
          <span>{a.place ? signupPlaceLabel(a.place) : 'Non attribué'}</span>
          <span aria-hidden="true">·</span>
          <span>
            {nf.format(a.dogs)} {a.dogs > 1 ? 'chiens' : 'chien'}
          </span>
          <Badge tone={a.verified ? 'green' : 'neutral'}>{a.verified ? 'Confirmée' : 'Non confirmée'}</Badge>
          {a.premium ? <Badge tone="amber">Premium</Badge> : null}
        </SubscriberItem>
      ))}
    </ol>
  )
}
