import Link from 'next/link'
import { MiloAvatar } from '@/components/assistant/MiloAvatar'
import { IconPaw } from '@/components/icons'

// @cdc cro — fin des pages d'urgence, une fois le danger traité. Rien à vendre. Depuis le 2026-11-21 (bilan des tests :
// 1 inscription au guide en 14 jours, « Mon chien » source de 4 comptes sur 7) : l'espace « Mon chien » et Milo.

export function UrgenceSuite() {
  return (
    <aside aria-labelledby="urgence-suite" className="v2 not-prose mt-10 flex flex-col gap-3 rounded-card border-2 border-ink bg-cream-2 p-4 print:hidden">
      <h2 id="urgence-suite" className="m-0 font-display text-xl font-black text-ink">Une fois ton chien hors de danger</h2>
      <Link href="/mon-chien" data-cta="urgence-mon-chien" className="flex min-h-12 items-center gap-3 rounded-box bg-paper p-3.5 text-ink no-underline hover:underline">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-pill bg-amber"><IconPaw className="size-5" /></span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold">Crée l&apos;espace de ton chien</span>
          <span className="text-sm text-ink-2">Son poids, sa ration et ses aliments gardés au même endroit, pour la prochaine fois.</span>
        </span>
      </Link>
      <Link href="/assistant" data-cta="urgence-milo" className="flex min-h-12 items-center gap-3 rounded-box bg-paper p-3.5 text-ink no-underline hover:underline">
        <MiloAvatar size={40} />
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold">Une question sur la suite ?</span>
          <span className="text-sm text-ink-2">Repas des prochains jours, ce qu&apos;il peut manger : demande à Milo.</span>
        </span>
      </Link>
    </aside>
  )
}
