import Link from 'next/link'

// @cdc 04-pages — « Par où commencer ? » (prototype) : 4 entrées vers les outils et rubriques qui existent.
const TILES = [
  { href: '/outils/ration', emoji: '🥣', title: 'Combien doit-il manger ?', sub: 'Sa ration en grammes par jour', tone: 'bg-amber-bg', tile: 'bg-amber' },
  { href: '/chien/urgences', emoji: '⚠️', title: 'Il a mangé un truc louche ?', sub: 'Le niveau de risque et quoi faire', tone: 'bg-rose-bg', tile: 'bg-rose' },
  { href: '/chien/peut-manger', emoji: '🥕', title: 'Il peut manger ça ?', sub: 'Le verdict, aliment par aliment', tone: 'bg-green-bg', tile: 'bg-green' },
  { href: '/chien/marque', emoji: '🔍', title: 'Quelle marque choisir ?', sub: 'Compositions et prix comparés', tone: 'bg-blue-bg', tile: 'bg-blue' },
]

export function StartTiles() {
  return (
    <section aria-labelledby="commencer" className="v2 flex flex-col gap-3">
      <h2 id="commencer" className="m-0 font-display text-2xl font-black text-ink">Par où commencer ?</h2>
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
        {TILES.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className={`flex items-center gap-4 rounded-card p-4 text-ink no-underline ${t.tone}`}>
              <span aria-hidden="true" className={`grid size-12 shrink-0 place-items-center rounded-control text-2xl ${t.tile}`}>{t.emoji}</span>
              <span className="flex grow flex-col">
                <span className="font-display text-lg font-black">{t.title}</span>
                <span className="text-sm text-ink-2">{t.sub}</span>
              </span>
              <span aria-hidden="true" className="text-2xl text-ink-2">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
