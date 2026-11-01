import Link from 'next/link'
import type { ComponentType } from 'react'
import { IconAlert, IconBowl, IconCarrot, IconChevron, IconSearch, type IconProps } from '@/components/icons'

// @cdc 04-pages — « Par où commencer ? » : une action principale en aplat orange (la ration),
// puis trois entrées secondaires en lignes (audit design 2026-11-02, §2.4 et §2.7).
const SECONDARY: { href: string; icon: ComponentType<IconProps>; title: string; sub: string }[] = [
  { href: '/chien/urgences', icon: IconAlert, title: 'Il a mangé un truc louche ?', sub: 'Le niveau de risque et quoi faire' },
  { href: '/chien/peut-manger', icon: IconCarrot, title: 'Il peut manger ça ?', sub: 'Le verdict, aliment par aliment' },
  { href: '/chien/marque', icon: IconSearch, title: 'Quelle marque choisir ?', sub: 'Compositions et prix comparés' },
]

export function StartTiles() {
  return (
    <section aria-labelledby="commencer" className="v2 flex flex-col gap-4">
      <h2 id="commencer" className="m-0 font-display text-2xl font-black text-ink">Par où commencer ?</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <Link
          href="/outils/ration"
          className="group flex flex-col justify-between gap-6 rounded-card bg-orange p-6 text-ink no-underline md:min-h-64 md:p-8"
        >
          <IconBowl className="size-14 md:size-16" />
          <span className="flex flex-col gap-2">
            <span className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-black leading-[1.05]">Combien doit-il manger ?</span>
            <span className="text-base font-medium">Sa ration en grammes par jour, selon son poids, son âge et son activité.</span>
            <span className="mt-2 inline-flex items-center gap-1 self-start rounded-control bg-ink px-4 py-2.5 text-[15px] font-semibold text-cream group-hover:underline">
              Calculer sa ration
              <IconChevron className="size-4" />
            </span>
          </span>
        </Link>
        <ul role="list" className="m-0 flex list-none flex-col justify-center border-t border-line p-0">
          {SECONDARY.map((t) => (
            <li key={t.href} className="border-b border-line">
              <Link href={t.href} className="group flex items-center gap-4 py-4 text-ink no-underline">
                <t.icon className="size-9" />
                <span className="flex grow flex-col">
                  <span className="font-display text-lg font-black leading-snug group-hover:underline">{t.title}</span>
                  <span className="text-sm text-ink-2">{t.sub}</span>
                </span>
                <IconChevron className="size-5 text-ink-2" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
