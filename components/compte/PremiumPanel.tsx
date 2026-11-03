import Link from 'next/link'
import { activatePremiumAction } from '@/app/(fr)/compte/actions'
import { IconCheck, IconSparkle } from '@/components/icons'
import type { PremiumMissing } from '@/lib/server/membership'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'
import { linkAction, linkInline } from './espace/ui'
import { SubmitButton } from './fields'

// @cdc premium — carte Premium de l'espace compte. Premium actif : rappel des avantages et date.
// Sinon : carte d'appel avec « Passer Premium » si le compte remplit les conditions, ou ce qui manque.

const MISSING: Record<PremiumMissing, { text: string; href: string; link: string }> = {
  email: { text: "Confirme ton adresse e-mail avec le lien reçu à l'inscription.", href: '/compte/connexion', link: 'Recevoir un nouveau lien' },
  dog: { text: 'Enregistre au moins un chien : Premium suit son poids et choisit ses offres.', href: '/compte/chien/nouveau', link: 'Ajouter mon chien' },
}

const BENEFITS = [
  `${PREMIUM_MONTHLY_SCANS} analyses par photo par mois au lieu de ${FREE_MONTHLY_SCANS}`,
  'Une alerte quand son poids varie de plus de 5 % en moins de deux mois',
  'Toutes tes analyses gardées, pas seulement les 20 dernières',
]

function Benefits() {
  return (
    <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
      {BENEFITS.map((b) => (
        <li key={b} className="m-0 flex items-start gap-2 text-base leading-snug text-ink">
          <IconCheck className="mt-0.5 size-5 text-green-ink" />
          {b}
        </li>
      ))}
    </ul>
  )
}

export function PremiumPanel({ premium, activatedAt, missing }: { premium: boolean; activatedAt: Date | null; missing: PremiumMissing[] }) {
  if (premium) {
    return (
      <section id="premium" aria-labelledby="premium-titre" className="flex scroll-mt-24 flex-col gap-3 rounded-card border border-line bg-green-bg p-4 md:p-6">
        <h2 id="premium-titre" className="m-0 flex items-center gap-2 font-display text-xl font-black text-ink">
          <IconSparkle className="size-5 text-green-ink" />
          Premium est activé
        </h2>
        <Benefits />
        <p className="m-0 text-sm text-ink-2">
          {activatedAt ? `Activé le ${activatedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })}. ` : ''}
          0 € pendant le lancement. Si Premium devient payant, on te prévient avant et rien n&apos;est prélevé automatiquement.
        </p>
      </section>
    )
  }
  return (
    <section id="premium" aria-labelledby="premium-titre" className="flex scroll-mt-24 flex-col gap-4 rounded-card border-2 border-orange bg-amber-bg p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <p className="m-0 inline-flex items-center gap-1 self-start rounded-pill bg-orange px-3 py-1 text-sm font-semibold text-ink">
          <IconSparkle className="size-4" />
          0 € pendant le lancement
        </p>
        <h2 id="premium-titre" className="m-0 font-display text-2xl font-black leading-tight text-ink">Passe à Premium</h2>
        <p className="m-0 text-sm text-ink-2">Sans carte bancaire.</p>
      </div>
      <Benefits />
      {missing.length === 0 ? (
        <form action={activatePremiumAction} className="flex flex-col sm:self-start">
          <SubmitButton pendingLabel="Activation…">Activer Premium</SubmitButton>
        </form>
      ) : (
        <div className="flex flex-col gap-2 rounded-box bg-paper p-3">
          <p className="m-0 text-base font-semibold text-ink">{missing.length > 1 ? "Pour l'activer, il manque deux étapes :" : "Pour l'activer, il manque une étape :"}</p>
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
      )}
      <Link href="/premium" className={`${linkAction} self-start`}>
        Comparer les formules
      </Link>
    </section>
  )
}
