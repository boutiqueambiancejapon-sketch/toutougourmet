import type { PremiumMode } from '@/lib/server/membership'

// @cdc premium — les trois étapes pour passer à Premium (conditions vérifiées côté serveur, voir
// lib/server/membership.ts et app/(fr)/compte/premium-actions.ts). Offre du lancement : adresse
// confirmée et un chien. Offre payante : adresse confirmée, puis paiement sur la page Stripe.

const STEPS: Record<PremiumMode, { title: string; text: string }[]> = {
  launch: [
    { title: 'Crée ton compte', text: 'Confirme ton adresse avec le lien reçu par e-mail.' },
    { title: 'Enregistre ton chien', text: 'Nom, âge, poids et activité. Tout reste modifiable.' },
    { title: 'Active Premium', text: 'Un bouton dans ton compte, sans carte bancaire.' },
  ],
  paid: [
    { title: 'Crée ton compte', text: 'Confirme ton adresse avec le lien reçu par e-mail.' },
    { title: 'Choisis ta formule', text: 'Mensuelle sans engagement, ou annuelle, moins chère.' },
    { title: 'Paie sur la page Stripe', text: 'Carte bancaire ou autre moyen proposé par Stripe. Premium s’active tout de suite.' },
  ],
  soon: [
    { title: 'Crée ton compte', text: 'Confirme ton adresse avec le lien reçu par e-mail.' },
    { title: 'Enregistre ton chien', text: 'Le compte gratuit garde son profil et ses pesées.' },
    { title: 'Passe à Premium', text: 'Dès que le paiement en ligne ouvre, depuis ton compte.' },
  ],
}

export function ActivationSteps({ mode }: { mode: PremiumMode }) {
  return (
    <section aria-labelledby="activer" className="flex flex-col gap-4">
      <h2 id="activer" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">
        {mode === 'launch' ? 'Comment activer Premium ?' : 'Comment passer à Premium ?'}
      </h2>
      <ol className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3">
        {STEPS[mode].map((s, i) => (
          <li key={s.title} className="m-0 flex items-start gap-3 rounded-card border border-line bg-paper p-4">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-ink font-display text-lg font-black text-cream">
              {i + 1}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-base font-semibold text-ink">{s.title}</span>
              <span className="text-base leading-snug text-ink-2">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
