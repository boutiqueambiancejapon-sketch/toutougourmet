import { TRACKING_STATE_LABEL, UNKNOWN_ADDRESS, trackingSource, type TrackingRow, type TrackingSend } from '@/lib/dashboard/email-tracking'
import type { TrackingResult } from '@/lib/server/dashboard-email-tracking'
import { Empty } from '../Panel'
import { Badge, EmailCell, shortDate } from './RowParts'

// @cdc tableau de bord — une ligne par adresse connue : source, dates, compte, chien, puis chaque
// e-mail reçu avec sa date. Lisible à 390 px : rien de large, tout passe à la ligne.

const UNAVAILABLE = {
  'no-database': 'Ce serveur n’a pas de base de données : le suivi ne peut pas s’afficher.',
  unreadable: 'Le suivi n’a pas pu être lu. Recharge la page dans une minute ; rien n’a été modifié.',
} as const

const NOTICES = {
  'list-incomplete': 'La liste Brevo ou les comptes ne sont pas lisibles en entier pour le moment. Une adresse absente de cette vue n’est donc pas forcément supprimée : les empreintes sans adresse sont masquées.',
  'log-missing': 'Le journal des envois n’existe pas encore sur ce serveur (db/analytics.sql à appliquer) : seul l’historique du guide et de la suite s’affiche.',
} as const

const STATE_TONE = { sent: 'green', failed: 'rose', simulated: 'neutral' } as const

function Send({ send }: { send: TrackingSend }) {
  return (
    <li className="border-t border-line py-1.5 first:border-t-0">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold text-ink">{send.label}</span>
        <Badge tone={STATE_TONE[send.state]}>{TRACKING_STATE_LABEL[send.state]}</Badge>
      </span>
      <span className="block">{send.at ? shortDate(send.at) : 'Date non enregistrée'}</span>
      {send.subject ? <span className="block break-words">{send.subject}</span> : null}
    </li>
  )
}

function Row({ row }: { row: TrackingRow }) {
  const account = row.account
  return (
    <li className="border-b border-line py-3 last:border-b-0">
      {row.email ? <EmailCell email={row.email} /> : <p className="m-0 font-semibold text-ink-2">{UNKNOWN_ADDRESS} · {row.hash.slice(0, 10)}</p>}
      <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">
        {row.email ? <span>{trackingSource(row)}</span> : null}
        {row.listedAt ? <span>Lettre depuis le {shortDate(row.listedAt)}</span> : null}
        {account ? <span>Compte créé le {shortDate(account.createdAt)}</span> : null}
      </p>
      <p className="m-0 mt-1 flex flex-wrap items-center gap-1.5">
        {row.email ? <Badge tone={account ? (account.verified ? 'green' : 'amber') : 'neutral'}>{account ? (account.verified ? 'Compte confirmé' : 'Compte non confirmé') : 'Sans compte'}</Badge> : null}
        {account ? <Badge tone={account.dogs > 0 ? 'green' : 'neutral'}>{account.dogs > 0 ? 'Chien ajouté' : 'Sans chien'}</Badge> : null}
        {row.optedOut || row.listStatus === 'desinscrit' ? <Badge tone="rose">Désinscrit</Badge> : null}
      </p>
      {row.sends.length > 0 ? (
        <ul className="m-0 mt-2 list-none rounded-box bg-cream-2 px-3 py-1 text-xs text-ink-2">
          {row.sends.map((s, i) => (
            <Send key={`${s.label}-${s.at?.toISOString() ?? 'sans-date'}-${i}`} send={s} />
          ))}
        </ul>
      ) : (
        <p className="m-0 mt-2 text-xs text-ink-2">Aucun e-mail individuel enregistré.</p>
      )}
    </li>
  )
}

export function TrackingList({ result, query }: { result: TrackingResult; query: string }) {
  if (!result.ok) {
    return (
      <p role="status" className="m-0 rounded-box border border-amber bg-amber-bg px-4 py-3 text-sm text-amber-ink">
        {UNAVAILABLE[result.reason]}
      </p>
    )
  }
  return (
    <>
      <p className="m-0 mt-3 text-xs text-ink-2">
        La lettre mensuelle part en campagne Brevo, sur toute la liste : elle n’apparaît pas ici, ses chiffres sont dans Brevo. Avant la mise en
        service du journal, seuls le guide, la suite et la bienvenue (sans date) ont laissé une trace.
      </p>
      {result.notices.map((n) => (
        <p key={n} role="status" className="m-0 mt-2 rounded-box border border-amber bg-amber-bg px-3 py-2 text-xs text-amber-ink">
          {NOTICES[n]}
        </p>
      ))}
      {result.rows.length === 0 ? (
        <Empty>{query ? 'Aucune adresse ne contient cette recherche.' : 'Aucune adresse connue pour le moment.'}</Empty>
      ) : (
        <ol className="m-0 list-none p-0">
          {result.rows.map((r) => (
            <Row key={r.hash} row={r} />
          ))}
        </ol>
      )}
    </>
  )
}
