'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconScan } from '@/components/icons'

// @cdc cro-carte — le scanner, fonction phare du site, mis en avant en tête du pied de page. Absent
// de /scanner, qui a déjà le bouton, et des pages de consultation, qui n'ont pas de bouton de scan.
const HIDDEN_ON = /^\/scanner(\/(croquette|friandise))?\/?$/

export function FooterScanner() {
  if (HIDDEN_ON.test(usePathname())) return null
  return (
    <aside
      aria-labelledby="footer-scanner"
      data-cta="scanner-footer"
      className="flex items-center gap-4 rounded-card bg-orange p-4 text-ink md:gap-5 md:p-6"
    >
      <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-box bg-ink text-cream md:size-16">
        <IconScan className="size-8" />
      </span>
      <div className="flex min-w-0 grow flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex flex-col gap-1">
          <p id="footer-scanner" className="m-0 font-display text-lg font-black leading-tight md:text-xl">
            Scanne ce que mange ton chien
          </p>
          <p className="m-0 text-sm leading-snug text-ink">
            Croquettes, pâtées, friandises : une note sur 100. Code-barres ou photo de l&apos;étiquette.
          </p>
        </div>
        <Link
          href="/scanner"
          className="inline-flex min-h-11 shrink-0 items-center justify-center self-start whitespace-nowrap rounded-control bg-ink px-4 text-[15px] font-semibold text-cream no-underline md:self-auto"
        >
          Scanner un paquet
        </Link>
      </div>
    </aside>
  )
}
