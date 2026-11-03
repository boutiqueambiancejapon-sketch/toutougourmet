import Link from 'next/link'
import { activatePremiumAction } from '@/app/(fr)/compte/actions'
import { IconSparkle } from '@/components/icons'
import type { Membership } from '@/db/schema'
import { formatEuros, PRICE_CENTS } from '@/lib/premium/pricing'
import type { PremiumMissing, PremiumMode } from '@/lib/server/membership'
import { linkAction, linkInline } from '../espace/ui'
import { SubmitButton } from '../fields'
import { Benefits } from './Benefits'
import { CheckoutForm } from './CheckoutForm'
import { ManageForm } from './ManageForm'

// @cdc premium — carte d'appel Premium pour un compte sans Premium actif. Trois offres :
// `launch` (activation gratuite, conditions : adresse confirmée et un chien), `paid` (formulaire
// de paiement, adresse confirmée exigée), `soon` (prix affichés, paiement bientôt disponible).

const MISSING: Record<PremiumMissing, { text: string; href: string; link: string }> = {
  email: { text: "Confirme ton adresse e-mail avec le lien reçu à l'inscription.", href: '/compte/connexion', link: 'Recevoir un nouveau lien' },
  dog: { text: 'Enregistre au moins un chien : Premium suit son poids et choisit ses offres.', href: '/compte/chien/nouveau', link: 'Ajouter mon chien' },
}

const PRICES = `${formatEuros(PRICE_CENTS.month)} par mois ou ${formatEuros(PRICE_CENTS.year)} par an`
const PILL_PRICE = `${formatEuros(PRICE_CENTS.month)} par mois`

function MissingSteps({ missing, intro }: { missing: PremiumMissing[]; intro: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-box bg-paper p-3">
      <p className="m-0 text-base font-semibold text-ink">{intro}</p>
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {missing.map((m) => (
          <li key={m} className="m-0 text-base leading-relaxed text-ink-2">
            {MISSING[m].text}{' '}
            <Link href={MISSING[m].href} className={linkInline}>
              {MISSING[m].link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PaidBody({ missing, membership }: { missing: PremiumMissing[]; membership: Membership | null }) {
  const ended = membership?.source === 'stripe' && membership.status === 'canceled'
  const launchOver = membership?.source === 'launch-free' && membership.plan === 'premium'
  return (
    <>
      {ended ? <p className="m-0 text-base text-ink-2">Ton abonnement est terminé. Tu peux le reprendre quand tu veux.</p> : null}
      {launchOver ? <p className="m-0 text-base text-ink-2">Ta période gratuite du lancement est terminée.</p> : null}
      {missing.includes('email') ? <MissingSteps missing={['email']} intro="Avant de payer, il manque une étape :" /> : <CheckoutForm />}
      {ended && membership?.stripeCustomerId ? <ManageForm label="Voir mes factures" /> : null}
    </>
  )
}

function LaunchBody({ missing }: { missing: PremiumMissing[] }) {
  if (missing.length === 0) {
    return (
      <form action={activatePremiumAction} className="flex flex-col sm:self-start">
        <SubmitButton pendingLabel="Activation…">Activer Premium</SubmitButton>
      </form>
    )
  }
  return <MissingSteps missing={missing} intro={missing.length > 1 ? "Pour l'activer, il manque deux étapes :" : "Pour l'activer, il manque une étape :"} />
}

export function OfferPanel({ mode, missing, membership }: { mode: PremiumMode; missing: PremiumMissing[]; membership: Membership | null }) {
  const pill = mode === 'launch' ? '0 € pendant le lancement' : PILL_PRICE
  return (
    <section id="premium" aria-labelledby="premium-titre" className="flex scroll-mt-24 flex-col gap-4 rounded-card border-2 border-orange bg-amber-bg p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <p className="m-0 inline-flex items-center gap-1 self-start rounded-pill bg-orange px-3 py-1 text-sm font-semibold text-ink">
          <IconSparkle className="size-4" />
          {pill}
        </p>
        <h2 id="premium-titre" className="m-0 font-display text-2xl font-black leading-tight text-ink">
          Passe à Premium
        </h2>
        {mode === 'launch' ? <p className="m-0 text-sm text-ink-2">Sans carte bancaire.</p> : null}
        {mode === 'paid' ? <p className="m-0 text-sm text-ink-2">Prix TTC, sans engagement : tu résilies quand tu veux.</p> : null}
      </div>
      <Benefits />
      {mode === 'launch' ? <LaunchBody missing={missing} /> : null}
      {mode === 'paid' ? <PaidBody missing={missing} membership={membership} /> : null}
      {mode === 'soon' ? <p className="m-0 rounded-box bg-paper p-3 text-base font-semibold text-ink">{`${PRICES}, TTC. Paiement en ligne bientôt disponible.`}</p> : null}
      <Link href="/premium" className={`${linkAction} self-start`}>
        Comparer les formules
      </Link>
    </section>
  )
}
