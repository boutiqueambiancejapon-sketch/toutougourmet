import type { LetterStatus } from '@/lib/server/dashboard-subscribers'
import type { AccountDetail } from '@/lib/server/dashboard-account-detail'
import { signupPlaceLabel } from '@/lib/signup-places'
import { Badge } from '../subscribers/RowParts'
import { Card, KeyValues, longDay } from './parts'

// @cdc tableau de bord — haut de la fiche : adresse, statut, offre, source, dates, lettre.
// La source d'inscription n'existe qu'avant la confirmation (signup_sources, vidée ensuite).

const LETTER: Record<LetterStatus['state'], string> = {
  subscribed: 'Inscrit',
  unsubscribed: 'Désinscrit',
  absent: 'Non inscrit',
  unknown: 'Non lue (Brevo injoignable)',
}

function sourceLabel(place: string | null, verified: boolean): string {
  if (place) return `Depuis : ${signupPlaceLabel(place)}`
  return verified ? 'Source effacée à la confirmation' : 'Source inconnue'
}

export function AccountIdentity({ detail }: { detail: AccountDetail }) {
  const { core, plan, letter } = detail
  return (
    <Card>
      <p className="m-0 break-all text-sm text-ink-2">{core.email}</p>
      <p className="m-0 flex flex-wrap gap-1.5">
        <Badge tone={core.verified ? 'green' : 'rose'}>{core.verified ? 'Confirmé' : 'À confirmer'}</Badge>
        {plan ? <Badge tone="blue">{plan === 'premium' ? 'Premium' : 'Gratuit'}</Badge> : <Badge tone="neutral">Offre non lue</Badge>}
        <Badge tone={core.place ? 'amber' : 'neutral'}>{sourceLabel(core.place, core.verified)}</Badge>
      </p>
      <KeyValues
        rows={[
          ['Prénom', core.name || 'Non renseigné'],
          ['Créé le', longDay(core.createdAt)],
          ['Mis à jour le', longDay(core.updatedAt)],
          ['Dernière visite', core.lastVisit ? `${longDay(core.lastVisit)}, à un jour près` : 'Non connue'],
          ['Lettre', LETTER[letter.state]],
        ]}
      />
    </Card>
  )
}
