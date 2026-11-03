import type { ReactNode } from 'react'

// @cdc tableau de bord — briques d'une ligne d'inscrit, lisibles sur iPhone : l'adresse tient sur
// une ligne (coupée proprement), un toucher l'ouvre en entier ; les détails passent en dessous.

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' })

export function shortDate(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? 'date inconnue' : dateFmt.format(d)
}

/** Adresse tronquée ; au toucher, adresse complète (details natif, sans JavaScript). */
export function EmailCell({ email }: { email: string }) {
  return (
    <details className="group min-w-0">
      <summary className="block cursor-pointer list-none truncate font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {email}
      </summary>
      <p className="m-0 mt-1 break-all rounded-box bg-cream-2 px-2 py-1 text-sm text-ink select-all">{email}</p>
    </details>
  )
}

type Tone = 'green' | 'rose' | 'amber' | 'neutral'

const TONES: Record<Tone, string> = {
  green: 'bg-green-bg text-green-ink',
  rose: 'bg-rose-bg text-rose-ink',
  amber: 'bg-amber-bg text-amber-ink',
  neutral: 'bg-cream-2 text-ink-2',
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`inline-flex whitespace-nowrap rounded-pill px-2 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>
}

/** Une ligne de la liste : adresse en haut, détails sur une ligne qui passe à la ligne si besoin. */
export function SubscriberItem({ email, children }: { email: string; children: ReactNode }) {
  return (
    <li className="border-b border-line py-3 last:border-b-0">
      <EmailCell email={email} />
      <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">{children}</p>
    </li>
  )
}
