import type { SubscribersResult } from '@/lib/server/dashboard-subscribers'
import { subscriberSourceLabel } from '@/lib/dashboard/subscriber-source'
import { Empty } from '../Panel'
import { Badge, shortDate, SubscriberItem } from './RowParts'

// @cdc tableau de bord — inscrits à la lettre (Brevo, lus en direct), plus récents d'abord.

const UNAVAILABLE = {
  'not-configured': 'Brevo n’est pas relié à ce serveur (clé ou numéro de liste absents) : la liste ne peut pas s’afficher.',
  unreachable: 'Brevo ne répond pas pour le moment. Recharge la page dans une minute ; rien n’a été modifié.',
} as const

export function LetterList({ result, query }: { result: SubscribersResult; query: string }) {
  if (!result.ok) {
    return (
      <p role="status" className="m-0 rounded-box border border-amber bg-amber-bg px-4 py-3 text-sm text-amber-ink">
        {UNAVAILABLE[result.reason]}
      </p>
    )
  }
  if (result.rows.length === 0) {
    return <Empty>{query ? 'Aucune adresse inscrite ne contient cette recherche.' : 'Personne n’est encore inscrit à la lettre.'}</Empty>
  }
  return (
    <>
      {result.truncated ? (
        <p className="m-0 mb-2 text-xs text-ink-2">La recherche porte sur les 5 000 inscrits les plus récents.</p>
      ) : null}
      <ol className="m-0 list-none p-0">
        {result.rows.map((s) => (
          <SubscriberItem key={`${s.email}-${s.createdAt}`} email={s.email}>
            <span>{shortDate(s.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{subscriberSourceLabel(s.source)}</span>
            <Badge tone={s.status === 'actif' ? 'green' : 'rose'}>{s.status === 'actif' ? 'Actif' : 'Désinscrit'}</Badge>
          </SubscriberItem>
        ))}
      </ol>
    </>
  )
}
