import type { BuyLink } from '@/lib/scanner/buy-link'

// @cdc lot 6 — carte « Où l'acheter ? » d'une fiche : lien partenaire déclaré comme tel, clic mesuré
// par components/analytics/Tracking.tsx (data-cta).

export function FicheBuy({ link }: { link: BuyLink | null }) {
  if (!link) return null
  return (
    <section aria-labelledby="acheter" className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4">
      <h2 id="acheter" className="m-0 font-display text-xl font-black text-ink">
        {link.exact ? <>Où l&apos;acheter&nbsp;?</> : <>Chercher un produit proche</>}
      </h2>
      <a
        href={link.href}
        rel="sponsored nofollow noopener"
        target="_blank"
        data-cta="fiche-achat"
        className="inline-flex min-h-12 items-center justify-center rounded-control bg-ink px-4 text-center font-semibold text-cream no-underline"
      >
        {link.exact ? `Acheter chez ${link.store}` : `Voir chez ${link.store}`}
      </a>
      <p className="m-0 text-sm text-ink-2">
        {link.exact
          ? 'Lien partenaire : on touche une commission si tu commandes, sans surcoût pour toi. Vérifie la référence et le prix sur le site.'
          : "Ce produit n'est pas chez nos partenaires, à notre connaissance. Maxi Zoo propose d'autres aliments pour chien. Lien partenaire : on touche une commission si tu commandes, sans surcoût pour toi."}
      </p>
    </section>
  )
}
