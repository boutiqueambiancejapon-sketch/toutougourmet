import type { EmailLogState } from '@/lib/emails/email-kinds'
import type { AddressEmails } from '@/lib/server/dashboard-email-tracking'
import { Badge } from '../subscribers/RowParts'
import { Card, ListRow, Rows, shortMoment, Unreadable } from './parts'

// @cdc tableau de bord — e-mails individuels reçus par ce compte (même calcul que la vue Envois).
// La lettre mensuelle part en campagne Brevo : elle n'a pas de ligne par adresse.

const STATE: Record<EmailLogState, { label: string; tone: 'green' | 'rose' | 'neutral' }> = {
  sent: { label: 'Envoyé', tone: 'green' },
  failed: { label: 'Échec', tone: 'rose' },
  simulated: { label: 'Simulé', tone: 'neutral' },
}

export function AccountEmails({ emails }: { emails: AddressEmails }) {
  return (
    <Card title="E-mails reçus">
      {!emails.ok ? <Unreadable>Le suivi des e-mails n’a pas pu être lu.</Unreadable> : null}
      {emails.ok && emails.logMissing ? <Unreadable>Le journal des envois n’existe pas encore sur ce serveur : seul l’historique du guide et de la suite s’affiche.</Unreadable> : null}
      {emails.ok && emails.sends.length === 0 ? <p className="m-0 text-sm text-ink-2">Aucun e-mail individuel enregistré.</p> : null}
      {emails.ok && emails.sends.length > 0 ? (
        <Rows>
          {emails.sends.map((s, i) => (
            <ListRow
              key={`${s.label}-${s.at?.toISOString() ?? 'sans-date'}-${i}`}
              main={s.label}
              detail={s.at ? shortMoment(s.at) : 'Date non enregistrée'}
              aside={<Badge tone={STATE[s.state].tone}>{STATE[s.state].label}</Badge>}
            />
          ))}
        </Rows>
      ) : null}
    </Card>
  )
}
