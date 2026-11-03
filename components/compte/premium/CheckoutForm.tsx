import Link from 'next/link'
import { startCheckoutAction } from '@/app/(fr)/compte/premium-actions'
import { formatEuros, PRICE_CENTS, yearlySaving } from '@/lib/premium/pricing'
import { SubmitButton } from '../fields'
import { linkInline } from '../espace/ui'

// @cdc premium — formulaire de paiement (rendu serveur, action serveur startCheckoutAction).
// Annuel coché par défaut. La case de renonciation est obligatoire (navigateur ET serveur) :
// sans elle, l'abonnement ne démarre pas. Le paiement se fait ensuite sur la page Stripe.

const saving = yearlySaving()

const OPTIONS = [
  { value: 'an', label: `Annuel, ${formatEuros(PRICE_CENTS.year)} par an`, note: `soit ${formatEuros(saving.perMonthCents)} par mois` },
  { value: 'mois', label: `Mensuel, ${formatEuros(PRICE_CENTS.month)} par mois`, note: 'sans engagement' },
] as const

/** trialEndsOn : fin de la gratuité du lancement, date du premier prélèvement (compte Premium du lancement). */
export function CheckoutForm({ trialEndsOn }: { trialEndsOn?: string | null }) {
  return (
    <form action={startCheckoutAction} className="flex flex-col gap-4">
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 p-0 text-base font-semibold text-ink">Ta formule</legend>
        {OPTIONS.map((o, i) => (
          <label key={o.value} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-box border border-line bg-paper p-3 has-[:checked]:border-2 has-[:checked]:border-orange">
            <input type="radio" name="formule" value={o.value} defaultChecked={i === 0} className="mt-1 size-5 shrink-0 accent-orange" />
            <span className="flex flex-col">
              <span className="text-base font-semibold text-ink">{o.label}</span>
              <span className="text-sm text-ink-2">{o.note}, TTC</span>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="flex cursor-pointer items-start gap-3 text-base leading-snug text-ink">
        <input type="checkbox" name="renonciation" value="oui" required className="mt-1 size-5 shrink-0 accent-orange" />
        <span>Je demande l&apos;accès immédiat à Premium et je renonce à mon droit de rétractation de 14 jours.</span>
      </label>
      {trialEndsOn ? <p className="m-0 text-sm text-ink-2">{`Ton Premium gratuit continue : premier prélèvement le ${trialEndsOn}.`}</p> : null}
      <div className="flex flex-col sm:self-start">
        <SubmitButton pendingLabel="Ouverture du paiement…">Continuer vers le paiement</SubmitButton>
      </div>
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        Paiement sur la page sécurisée de Stripe. En continuant, tu acceptes les{' '}
        <Link href="/conditions-generales-de-vente" className={linkInline}>
          conditions générales de vente
        </Link>
        .
      </p>
    </form>
  )
}
