import Link from 'next/link'
import type { ComponentType } from 'react'
import { IconAlert, IconChevron, IconSearch, type IconProps } from '@/components/icons'
import { FoodSearch } from '@/components/tools/FoodSearch'
import type { FoodVerdict } from '@/lib/food-verdicts'
import { bookSummary } from '@/lib/guide/book'

// @cdc 04-pages — première section après le hero : recherche « peut-il manger » sur les aliments
// classés, puis deux entrées secondaires en lignes. Pas d'aplat orange ici : l'action principale
// de l'écran reste le bouton du calculateur (audit design-CRO, §3 Accueil).
const SECONDARY: { href: string; icon: ComponentType<IconProps>; title: string; sub: string }[] = [
  { href: '/chien/urgences', icon: IconAlert, title: 'Il a avalé quelque chose de bizarre ?', sub: 'Les gestes à faire tout de suite, et quand appeler le véto' },
  { href: '/chien/marque', icon: IconSearch, title: 'Quelle marque choisir ?', sub: 'On a lu les étiquettes et comparé les prix au kilo' },
]

export function StartTiles({ foods }: { foods: FoodVerdict[] }) {
  const entries = foods.map(({ label, href, verdict }) => ({ label, href, verdict }))
  return (
    <section aria-labelledby="peut-manger" className="v2 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-12">
      <div className="flex flex-col gap-3">
        <h2 id="peut-manger" className="m-0 font-display text-2xl font-black text-ink">
          Mon chien peut-il manger… ?
        </h2>
        <p className="m-0 text-base text-ink-2">{`Tape l’aliment qu’il vient de chiper. ${bookSummary().foodCount} aliments ont déjà leur verdict.`}</p>
        <FoodSearch foods={entries} />
      </div>
      <ul role="list" className="m-0 flex list-none flex-col self-start border-t border-line p-0 md:mt-10">
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
    </section>
  )
}
