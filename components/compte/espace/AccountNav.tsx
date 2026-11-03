'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
import { IconDog, IconGear, IconHome, IconScan, IconTag, type IconProps } from '@/components/icons'

// @cdc compte — navigation de l'espace compte. Client seulement pour lire l'adresse courante
// (aria-current) ; le HTML part déjà rendu du serveur. Sous 384 px (iPhone SE, texte agrandi),
// icônes seules : le libellé reste lu par les lecteurs d'écran.

interface NavItem {
  href: string
  label: string
  short: string
  Icon: ComponentType<IconProps>
  match: (path: string) => boolean
}

const ITEMS: NavItem[] = [
  { href: '/compte', label: "Vue d'ensemble", short: 'Accueil', Icon: IconHome, match: (p) => p === '/compte' },
  { href: '/compte/chiens', label: 'Mes chiens', short: 'Chiens', Icon: IconDog, match: (p) => p.startsWith('/compte/chien') },
  { href: '/compte/scans', label: 'Mes scans', short: 'Scans', Icon: IconScan, match: (p) => p.startsWith('/compte/scans') },
  { href: '/compte/offres', label: 'Offres', short: 'Offres', Icon: IconTag, match: (p) => p.startsWith('/compte/offres') },
  { href: '/compte/reglages', label: 'Réglages', short: 'Réglages', Icon: IconGear, match: (p) => p.startsWith('/compte/reglages') || p.startsWith('/compte/supprimer') },
]

export function AccountNav() {
  const path = usePathname()
  return (
    <nav aria-label="Espace compte" className="md:sticky md:top-24">
      <ul role="list" className="m-0 grid list-none grid-cols-5 gap-1 rounded-card border border-line bg-paper p-1 md:flex md:flex-col md:p-2">
        {ITEMS.map(({ href, label, short, Icon, match }) => (
          <li key={href} className="m-0 min-w-0">
            <Link
              href={href}
              aria-current={match(path) ? 'page' : undefined}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-box px-1 py-2 text-xs font-semibold text-ink-2 no-underline hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-cream md:min-h-11 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-base"
            >
              <Icon className="size-5" />
              <span className="sr-only xs:not-sr-only xs:max-w-full xs:truncate md:hidden">{short}</span>
              <span className="hidden md:inline">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
