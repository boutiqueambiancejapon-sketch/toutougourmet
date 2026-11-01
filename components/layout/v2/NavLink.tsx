'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { matchSection, type NavMatch } from './nav-items'

// Seul morceau client de la navigation : il lit l'adresse pour poser aria-current.
// Le style de l'état actif passe par les variantes Tailwind aria-[current=page]:.
export function NavLink({ href, match, className, children }: { href: string; match: NavMatch; className: string; children: ReactNode }) {
  const pathname = usePathname()
  const current = matchSection(pathname) === match
  return (
    <Link href={href} className={className} aria-current={current ? 'page' : undefined}>
      {children}
    </Link>
  )
}
