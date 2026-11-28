import type { BuyLink } from '@/lib/scanner/buy-link'
import { moinsCher } from '@/lib/scanner/amazon'
import { euros } from '@/lib/scanner/prix'
import type { OffreAmazon } from '@/lib/server/amazon'
import { toGo } from '@/lib/go'

// @cdc lot 6 — carte « Où l'acheter ? » d'une fiche : lien partenaire déclaré comme tel, clic mesuré
// par components/analytics/Tracking.tsx (data-cta). Depuis le 28/11/2026, le même produit chez Amazon à côté de Maxi Zoo,
// avec « Prix le plus bas » sur le moins cher au kilo, seulement pour deux sacs de même poids.

const BTN = 'inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-control px-4 text-center font-semibold no-underline'
const MENTION_AMAZON = 'En tant que Partenaire Amazon, on réalise un bénéfice sur les achats remplissant les conditions requises.'

function Badge() {
  return <span className="rounded-pill bg-green-bg px-2 py-0.5 text-xs font-bold text-green-ink">Prix le plus bas</span>
}

function Ligne({ prix, prixKg, best }: { prix: number | null; prixKg: number | null; best: boolean }) {
  if (prix === null) return null
  return (
    <p className="m-0 flex flex-wrap items-center gap-2 text-sm text-ink">
      <span className="font-semibold">{euros(prix)}</span>
      {prixKg !== null ? <span className="text-ink-2">{`${euros(prixKg)} le kilo`}</span> : null}
      {best ? <Badge /> : null}
    </p>
  )
}

export function FicheBuy({ link, amazon = null }: { link: BuyLink | null; amazon?: OffreAmazon | null }) {
  if (!link) return null
  const mzKg = link.prix?.prixKg ?? null
  // Lien principal déjà sur Amazon (marque absente de Maxi Zoo) : pas de deuxième bouton, son prix sous le premier.
  const second = link.amazon ? null : amazon
  const mzPoids = link.prix && mzKg ? link.prix.prix / mzKg : null
  const best = second ? moinsCher(mzKg, second.prixKg, mzPoids, second.poidsKg) : null
  return (
    <section aria-labelledby="acheter" className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4">
      <h2 id="acheter" className="m-0 font-display text-xl font-black text-ink">
        Où l&apos;acheter&nbsp;?
      </h2>
      <div className="flex flex-col gap-2">
        <a href={toGo(link.href)} rel="sponsored nofollow noopener" target="_blank" data-cta="fiche-achat" className={`${BTN} bg-orange text-ink`}>
          {`Acheter chez ${link.store}`}
        </a>
        {link.prix ? <Ligne prix={link.prix.prix} prixKg={mzKg} best={best === 'maxizoo'} /> : link.amazon && amazon ? <Ligne prix={amazon.prix} prixKg={amazon.prixKg} best={false} /> : null}
      </div>
      {second ? (
        <div className="flex flex-col gap-2">
          <a href={toGo(second.href)} rel="sponsored nofollow noopener" target="_blank" data-cta="fiche-achat-amazon" className={`${BTN} border border-line-2 bg-paper text-ink`}>
            Voir sur Amazon
          </a>
          <Ligne prix={second.prix} prixKg={second.prixKg} best={best === 'amazon'} />
        </div>
      ) : null}
      <p className="m-0 text-sm text-ink-2">
        {link.amazon && !link.exact
          ? `Recherche sur Amazon : tu peux tomber sur une autre variante, vérifie la référence avant de commander. ${MENTION_AMAZON}`
          : link.amazon
            ? `Lien vers la page du produit sur Amazon. ${MENTION_AMAZON}`
            : 'Lien partenaire : on touche une commission si tu commandes, sans surcoût pour toi. Vérifie la référence et le prix sur le site.'}
        {amazon ? ` Prix Amazon relevé le ${amazon.releve}, il peut avoir changé depuis.${link.amazon ? '' : ` ${MENTION_AMAZON}`}` : ''}
      </p>
    </section>
  )
}
