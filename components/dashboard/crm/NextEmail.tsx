import { stepLabel, whenLabel } from '@/lib/dashboard/crm'

// @cdc tableau de bord — fiche d'un contact : prochain e-mail automatique et bouton pour lui écrire.

export function NextEmail({ next, email, unsubscribed }: { next: { step: string; inDays: number } | null; email: string; unsubscribed: boolean }) {
  return (
    <section aria-label="Prochain e-mail" className="flex flex-col gap-2 rounded-card border border-line bg-amber-bg p-4 text-sm text-ink">
      <p className="m-0">
        <strong>Prochain e-mail : </strong>
        {next ? `${stepLabel(next.step)}, ${whenLabel(next.inDays)}.` : unsubscribed ? 'aucun, cette adresse est désinscrite.' : 'aucun de prévu.'}
      </p>
      <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-pill bg-ink px-4 font-semibold text-cream no-underline">
        Écrire à cette personne
      </a>
    </section>
  )
}
