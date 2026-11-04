import { formatDateFr } from '@/lib/dog-profile'
import type { AccountSheet } from '@/lib/server/dashboard-account-detail'
import { Badge } from '../subscribers/RowParts'
import { Card, ListRow, Rows, Unreadable } from './parts'

// @cdc tableau de bord — fiches de garde d'un compte : chien, dates, lien actif ou non. Le lecteur
// SQL ne sort ni le contenu de la fiche ni son jeton : rien à masquer ici, rien à faire fuiter.

export function AccountSheets({ sheets }: { sheets: AccountSheet[] | null }) {
  return (
    <Card title="Fiches de garde">
      {sheets === null ? <Unreadable>Les fiches de garde n’ont pas pu être lues.</Unreadable> : null}
      {sheets?.length === 0 ? <p className="m-0 text-sm text-ink-2">Aucune fiche de garde.</p> : null}
      {sheets && sheets.length > 0 ? (
        <Rows>
          {sheets.map((s) => (
            <ListRow
              key={s.id}
              main={`${s.dogName}, du ${formatDateFr(s.startsOn)} au ${formatDateFr(s.endsOn)}`}
              detail={s.active ? 'Lien actif' : 'Lien expiré'}
              aside={<Badge tone={s.active ? 'green' : 'neutral'}>{s.active ? 'Active' : 'Expirée'}</Badge>}
            />
          ))}
        </Rows>
      ) : null}
      <p className="m-0 rounded-box bg-cream-2 px-3 py-2 text-xs text-ink-2">Téléphones et médicaments masqués.</p>
    </Card>
  )
}
