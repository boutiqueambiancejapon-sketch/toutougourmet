import Link from 'next/link'
import { IconBowl, IconCake, IconChevron, IconCoins, IconScale } from '@/components/icons'
import { Panel } from './Panel'

// @cdc compte — raccourcis vers les outils, pré-remplis avec le profil du premier chien
// (/api/compte/profil et /api/compte/ration).

const TOOLS = [
  { href: '/outils/ration', label: 'Calcul de ration', Icon: IconBowl },
  { href: '/outils/poids', label: 'Contrôle du poids', Icon: IconScale },
  { href: '/outils/age', label: 'Âge en années humaines', Icon: IconCake },
  { href: '/outils/budget', label: 'Budget mensuel', Icon: IconCoins },
]

export function ToolLinks({ dogName }: { dogName?: string }) {
  return (
    <Panel id="outils" title="Ses outils">
      <p className="m-0 text-base leading-relaxed text-ink-2">{`Les outils reprennent le profil de ${dogName ?? 'ton chien'} dès que tu les ouvres.`}</p>
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
        {TOOLS.map(({ href, label, Icon }) => (
          <li key={href} className="m-0">
            <Link href={href} className="flex min-h-14 items-center gap-3 rounded-box border border-line bg-cream px-3 font-semibold text-ink no-underline hover:border-ink">
              <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-tile bg-paper">
                <Icon className="size-5" />
              </span>
              <span className="grow">{label}</span>
              <IconChevron className="size-4 text-ink-2" />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
