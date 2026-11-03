import Link from 'next/link'
import { IconScan } from '@/components/icons'

// @cdc cro — objectif principal des pages scanner (docs/v2/cro-carte.md) : aller au scanner,
// où le compte se crée pour les analyses par photo. Lien serveur, texte sur une ligne dès 320 px.

export function ScanPackLink({ place }: { place: string }) {
  return (
    <Link
      href="/scanner"
      data-cta={`yuka-${place}`}
      className="inline-flex min-h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-control bg-orange px-4 text-base sm:gap-3 sm:px-6 sm:text-lg font-bold text-ink no-underline shadow-[5px_5px_0_var(--ink)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_var(--ink)] sm:w-auto"
    >
      <IconScan />
      Scanner un paquet
    </Link>
  )
}
