import Link from 'next/link'
import type { TocItem } from '@/lib/article-toc'
import { RelatedBrands } from '@/components/blog/RelatedBrands'

// @cdc 04-pages — colonne de droite d'article V2 (prototype) : sommaire collant,
// encart « Et pour ton chien ? » (vers le calcul de ration, en attendant les profils du lot 4),
// puis les marques recommandées.
export function ArticleAside({ toc }: { toc: TocItem[] }) {
  return (
    <aside className="v2 hidden self-stretch lg:block">
      <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col gap-5 overflow-y-auto pb-2">
        {toc.length > 1 ? (
          <nav aria-label="Sommaire" className="flex flex-col gap-1 rounded-card border border-line bg-paper p-5">
            <p className="m-0 mb-2 text-sm font-semibold text-ink">Sommaire</p>
            <ol role="list" className="m-0 flex list-none flex-col gap-0.5 p-0">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="block rounded-control px-2 py-1 text-sm leading-snug text-ink no-underline hover:bg-cream-2">
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="flex flex-col gap-2 rounded-card bg-amber-bg p-5">
          <p className="m-0 font-display text-lg font-black text-ink">Et pour ton chien ?</p>
          <p className="m-0 text-sm text-ink-2">Sa ration en grammes par jour, calculée sur son poids.</p>
          <Link href="/outils/ration" className="mt-1 inline-flex min-h-11 items-center justify-center rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline">
            Calculer sa ration
          </Link>
        </div>
        <RelatedBrands sticky={false} />
      </div>
    </aside>
  )
}
