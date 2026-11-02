import Link from 'next/link'
import { activatePremiumAction } from '@/app/(fr)/compte/actions'
import type { PremiumMissing } from '@/lib/server/membership'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'
import { SubmitButton } from './fields'

// @cdc premium — encart Premium de /compte. Premium actif : badge et rappel des avantages.
// Sinon : bouton « Passer Premium » si le compte remplit les conditions, ou ce qui manque, avec le lien.

const MISSING: Record<PremiumMissing, { text: string; href: string; link: string }> = {
  email: { text: "Confirme ton adresse e-mail avec le lien reçu à l'inscription.", href: '/compte/connexion', link: 'Recevoir un nouveau lien' },
  dog: { text: 'Enregistre au moins un chien : Premium suit son poids et choisit ses offres.', href: '/compte/chien/nouveau', link: 'Ajouter mon chien' },
}

export function PremiumBadge() {
  return <span className="inline-flex items-center rounded-pill bg-green px-3 py-0.5 text-sm font-semibold text-green-ink">Premium</span>
}

export function PremiumPanel({ premium, activatedAt, missing }: { premium: boolean; activatedAt: Date | null; missing: PremiumMissing[] }) {
  if (premium) {
    return (
      <section aria-labelledby="premium" className="flex flex-col gap-2 rounded-card border border-line bg-green-bg p-4">
        <h2 id="premium" className="m-0 flex flex-wrap items-center gap-2 font-display text-xl font-black text-ink">
          Ta formule <PremiumBadge />
        </h2>
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          {`${PREMIUM_MONTHLY_SCANS} analyses par photo par mois, alertes de poids et historique complet des scans.`}
          {activatedAt ? ` Activé le ${activatedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })}.` : ''}
        </p>
        <p className="m-0 text-sm text-ink-2">Gratuit pendant le lancement. Si Premium devient payant, on te prévient avant : rien ne sera prélevé automatiquement.</p>
      </section>
    )
  }
  return (
    <section aria-labelledby="premium" className="flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-4">
      <h2 id="premium" className="m-0 font-display text-xl font-black text-ink">Premium, gratuit pendant le lancement</h2>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {`${PREMIUM_MONTHLY_SCANS} analyses par photo par mois au lieu de ${FREE_MONTHLY_SCANS}, alertes quand son poids change vite et historique complet des scans. Sans carte bancaire.`}{' '}
        <Link href="/premium" className="font-semibold text-orange-ink underline underline-offset-2">
          Le détail de Premium
        </Link>
      </p>
      {missing.length === 0 ? (
        <form action={activatePremiumAction}>
          <SubmitButton pendingLabel="Activation…">Passer Premium</SubmitButton>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[15px] font-semibold text-ink">{missing.length > 1 ? "Pour l'activer, il manque deux étapes :" : "Pour l'activer, il manque une étape :"}</p>
          <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
            {missing.map((m) => (
              <li key={m} className="m-0 text-[15px] leading-relaxed text-ink-2">
                {MISSING[m].text}{' '}
                <Link href={MISSING[m].href} className="font-semibold text-orange-ink underline underline-offset-2">
                  {MISSING[m].link}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
