import { Empty, Panel } from '@/components/dashboard/Panel'
import { eventKindLabel, eventOutcomeLabel } from '@/lib/dashboard/login/labels'
import type { EventRow } from '@/lib/server/dashboard-login/security-data'

// @cdc tableau de bord — journal des connexions : 30 dernières lignes, conservées 90 jours. Les 6
// caractères d'empreinte servent à repérer une même adresse, sans la révéler.

const when = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' })

export function SecurityJournal({ events }: { events: EventRow[] }) {
  return (
    <Panel title="Journal des connexions" hint="30 dernières lignes, heure de Paris." wide>
      {events.length === 0 ? (
        <Empty>Aucune connexion enregistrée.</Empty>
      ) : (
        <ul className="m-0 list-none space-y-2 p-0">
          {events.map((e) => (
            <li key={e.id} className="border-b border-line pb-2 text-sm">
              <span className="block font-semibold text-ink">
                {eventKindLabel(e.kind)} : <span className={e.outcome === 'success' ? 'text-green-ink' : 'text-rose-ink'}>{eventOutcomeLabel(e.outcome)}</span>
              </span>
              <span className="block text-ink-2">
                {when.format(e.at)}
                {e.deviceLabel ? ` · ${e.deviceLabel}` : ''}
                {e.ip ? ` · adresse ${e.ip}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
