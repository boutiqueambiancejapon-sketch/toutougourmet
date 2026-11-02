import type { ScheduledCampaign } from '@/lib/server/brevo-newsletter'
import { ConfirmSubmit } from '../review/ConfirmSubmit'
import { Empty, SectionTitle } from '../Panel'

// @cdc e-mails — campagnes mensuelles programmées dans Brevo, avec le bouton « Annuler l'envoi »
// (la campagne est suspendue : elle ne part pas et reste visible dans Brevo).

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris' })

const NOTICES: Record<string, { text: string; tone: string }> = {
  ok: { text: 'Envoi annulé : la campagne est suspendue dans Brevo.', tone: 'bg-green-bg text-green-ink' },
  erreur: { text: "Brevo a refusé l'annulation : voir le journal du site, ou suspendre la campagne dans Brevo.", tone: 'bg-rose-bg text-rose-ink' },
}

interface CampaignListProps {
  campaigns: ScheduledCampaign[] | null
  cancel: (id: number) => () => Promise<void>
  notice?: string
}

export function CampaignList({ campaigns, cancel, notice }: CampaignListProps) {
  const n = notice ? NOTICES[notice] : undefined
  return (
    <>
      <SectionTitle
        id="campagnes"
        title="Envois programmés"
        intro="Le script mensuel crée la campagne la veille du premier mardi, pour 18 h, et envoie un test à NEWSLETTER_TEST_EMAIL. Tant qu'elle n'est pas partie, on peut l'annuler ici."
      />
      {n && (
        <p role="status" className={`mt-2 rounded-box px-4 py-3 text-sm ${n.tone}`}>
          {n.text}
        </p>
      )}
      <div className="mt-2">
        {campaigns === null && <Empty>Brevo injoignable ou non configuré.</Empty>}
        {campaigns?.length === 0 && <Empty>Aucune lettre programmée.</Empty>}
        {campaigns && campaigns.length > 0 && (
          <ul className="flex flex-col gap-2">
            {campaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-paper p-4 text-sm">
                <span>
                  <span className="block font-semibold text-ink">{c.subject}</span>
                  <span className="text-ink-2">
                    {c.scheduledAt ? `Départ le ${dateFmt.format(new Date(c.scheduledAt))}` : 'Date de départ inconnue'} · campagne n° {c.id}
                  </span>
                </span>
                <form action={cancel(c.id)}>
                  <ConfirmSubmit message="Annuler l'envoi de cette lettre ?">Annuler l&apos;envoi</ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
