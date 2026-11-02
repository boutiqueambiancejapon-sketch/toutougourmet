import { IconChevron } from '@/components/icons'
import { PARTNERS } from '@/components/outils/partners'
import type { BrandKey } from '@/lib/quiz'

// @cdc affiliation — le seul lien partenaire du résultat du test, affiché seulement quand la
// marque conseillée devance nettement les autres. Même dessin que PartnerLink des outils,
// emplacement mesuré par components/analytics/Tracking.tsx via data-cta="quiz-result".

const PARTNER_OF: Record<BrandKey, keyof typeof PARTNERS> = {
  franklin: 'franklin',
  elmut: 'elmut',
  ultraPremiumDirect: 'upd',
  dogChef: 'dogChef',
}

export function QuizPartner({ brand }: { brand: BrandKey }) {
  const p = PARTNERS[PARTNER_OF[brand]]
  return (
    <div data-cta="quiz-result" className="flex flex-col gap-3 rounded-box bg-ink p-4 text-cream shadow-[5px_5px_0_var(--orange)] sm:p-5">
      {p.offer ? <p className="m-0 text-sm font-bold text-amber">{`Offre ${p.brand} : ${p.offer}`}</p> : null}
      <a
        href={p.href}
        target="_blank"
        rel="sponsored noopener"
        className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-control bg-amber px-5 text-base font-bold text-ink no-underline hover:underline"
      >
        {`Voir les recettes ${p.brand}`}
        <IconChevron className="size-4" />
      </a>
      <p className="m-0 text-xs text-cream/70">Lien partenaire&nbsp;: on touche une commission si tu commandes, sans surcoût pour toi.</p>
    </div>
  )
}
