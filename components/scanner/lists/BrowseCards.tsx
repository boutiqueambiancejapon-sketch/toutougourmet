import Link from 'next/link'

// @cdc scanner — les deux entrées vers les pages de consultation, sous le bouton de scan de /scanner.

const CARDS = [
  { href: '/scanner/croquette', title: 'Croquettes et pâtées', tone: 'border-amber bg-amber-bg' },
  { href: '/scanner/friandise', title: 'Friandises', tone: 'border-rose bg-rose-bg' },
]

export function BrowseCards() {
  return (
    <section aria-labelledby="parcourir" className="flex flex-col gap-2">
      <h2 id="parcourir" className="m-0 font-display text-xl font-black text-ink">
        Parcourir les fiches
      </h2>
      <ul role="list" className="m-0 grid list-none grid-cols-2 gap-3 p-0">
        {CARDS.map((c) => (
          <li key={c.href} className="flex">
            <Link href={c.href} className={`flex w-full flex-col gap-1 rounded-card border-2 p-3 text-ink no-underline ${c.tone}`}>
              <span className="font-display text-lg font-black leading-tight">{c.title}</span>
              <span className="text-[13px] leading-snug text-ink-2">Dernières fiches et top 10</span>
              <span className="mt-auto pt-1 text-[13px] font-semibold text-orange-ink">Voir →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
