import type { ReactNode } from 'react'
import { ProductPhoto } from '@/components/scanner/ProductPhoto'
import { titleTypo } from '@/lib/title-typo'

// @cdc avis — bloc produits des articles d'avis : photo, raison, lien affilié exact déclaré. Rendu serveur.
// Dans le MDX : <ProductPicks title="…"><ProductPick name="…" why="…" href="…" image="…" /></ProductPicks>

interface ProductPickProps {
  name: string
  why: string
  href: string
  image?: string | null
  vet?: boolean
  store?: string
}

export function ProductPick({ name, why, href, image, vet, store = 'Maxi Zoo' }: ProductPickProps) {
  return (
    <li className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4">
      <p className="m-0 flex items-center gap-3">
        <ProductPhoto src={image ?? null} />
        <span className="min-w-0 font-semibold leading-snug text-ink [overflow-wrap:anywhere]">{name}</span>
      </p>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">{why}</p>
      {vet ? <p className="m-0 text-sm font-semibold text-ink">Sur avis de ton vétérinaire</p> : null}
      <a href={href} rel="sponsored nofollow noopener" target="_blank" className="inline-flex min-h-11 items-center justify-center self-start whitespace-nowrap rounded-control bg-ink px-4 font-semibold !text-cream !no-underline hover:!underline">
        {`Voir chez ${store}`}
      </a>
    </li>
  )
}

export function ProductPicks({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-cta="avis-produit" className="not-prose my-8 flex flex-col gap-3">
      <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo(title)}</h2>
      <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {children}
      </ul>
      <p className="m-0 text-sm text-ink-2">Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi.</p>
    </section>
  )
}
