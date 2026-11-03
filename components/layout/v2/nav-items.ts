// @cdc 04-pages — navigation V2 façon prototype (docs/v2/prototype).
// Le scanner, fonction phare, est le bouton central de la barre d'onglets et le premier lien
// de l'en-tête ordinateur (demande du propriétaire, 2026-11-03). Le test reste dans l'en-tête et /outils.

import type { ComponentType } from 'react'
import { IconBook, IconBowl, IconDog, IconHome, IconScan, type IconProps } from '@/components/icons'

export type NavMatch = 'home' | 'guides' | 'races' | 'tools' | 'brands' | 'quiz' | 'scanner'

export interface NavItem {
  href: string
  label: string
  match: NavMatch
  icon?: ComponentType<IconProps>
}

/** En-tête ordinateur. */
export const DESKTOP_NAV: NavItem[] = [
  { href: '/scanner', label: 'Scanner', match: 'scanner', icon: IconScan },
  { href: '/chien', label: 'Guides', match: 'guides' },
  { href: '/chien/race', label: 'Races', match: 'races' },
  { href: '/outils', label: 'Outils', match: 'tools' },
  { href: '/chien/marque', label: 'Marques', match: 'brands' },
]

/** Barre d'onglets mobile (le 3e est le bouton central mis en avant). */
export const TAB_NAV: NavItem[] = [
  { href: '/', label: 'Accueil', match: 'home', icon: IconHome },
  { href: '/chien', label: 'Guides', match: 'guides', icon: IconBook },
  { href: '/scanner', label: 'Scanner', match: 'scanner', icon: IconScan },
  { href: '/outils', label: 'Outils', match: 'tools', icon: IconBowl },
  { href: '/chien/race', label: 'Races', match: 'races', icon: IconDog },
]

/** Rubrique active d'une adresse (une seule à la fois). */
export function matchSection(pathname: string): NavMatch | null {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/chien/race')) return 'races'
  if (pathname.startsWith('/chien/marque') || pathname.startsWith('/comparateur') || pathname.startsWith('/comparatifs')) return 'brands'
  if (pathname.startsWith('/chien') || pathname.startsWith('/blog')) return 'guides'
  if (pathname.startsWith('/outils')) return 'tools'
  if (pathname.startsWith('/quiz')) return 'quiz'
  if (pathname.startsWith('/scanner') || pathname.startsWith('/croquettes')) return 'scanner'
  return null
}
