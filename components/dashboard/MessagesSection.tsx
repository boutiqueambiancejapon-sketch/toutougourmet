import type { StoredMessage } from '@/lib/server/contact'
import { Empty, SectionTitle } from './Panel'

// @cdc tableau de bord — messages reçus par le formulaire de contact (analytics.contact_messages).
// Lecture seule : les non traités d'abord, puis les plus récents.

const EXCERPT = 220
const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' })

function excerpt(text: string): string {
  const flat = text.replace(/\s+/g, ' ')
  return flat.length > EXCERPT ? `${flat.slice(0, EXCERPT)}…` : flat
}

export function MessagesSection({ messages }: { messages: StoredMessage[] }) {
  return (
    <>
      <SectionTitle id="messages" title="Messages" intro="Les 20 derniers messages du formulaire de contact, non traités en premier." />
      <div className="mt-4 flex flex-col gap-3">
        {messages.length === 0 && <Empty>Aucun message reçu pour l’instant.</Empty>}
        {messages.map((m) => (
          <article key={m.id} className="rounded-card border border-line bg-paper p-4">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-ink">
                {m.name} <a href={`mailto:${m.email}`} className="font-normal text-ink-2 underline">{m.email}</a>
              </h3>
              <span
                className={`rounded-pill px-3 py-1 text-xs font-semibold ${m.handled ? 'bg-green-bg text-green-ink' : 'bg-amber-bg text-amber-ink'}`}
              >
                {m.handled ? 'Traité' : 'À traiter'}
              </span>
            </header>
            <p className="mt-2 text-sm text-ink-2">
              <time dateTime={m.ts.toISOString()}>{dateFmt.format(m.ts)}</time>
              {m.page && <> · depuis {m.page}</>}
            </p>
            <p className="mt-2 whitespace-pre-line break-words text-sm text-ink">{excerpt(m.message)}</p>
          </article>
        ))}
      </div>
    </>
  )
}
