// @cdc 04-pages — navigation V2 façon prototype (docs/v2/prototype).
// Scanner, Connexion et « Mon chien » arrivent avec les lots 4 et 6 : en attendant,
// le bouton central mène au test et les onglets pointent vers les pages existantes.

export type NavMatch = 'home' | 'guides' | 'races' | 'tools' | 'brands' | 'quiz'

export interface NavItem {
  href: string
  label: string
  match: NavMatch
  emoji?: string
}

/** En-tête ordinateur. */
export const DESKTOP_NAV: NavItem[] = [
  { href: '/chien', label: 'Guides', match: 'guides' },
  { href: '/chien/race', label: 'Races', match: 'races' },
  { href: '/outils', label: 'Outils', match: 'tools' },
  { href: '/chien/marque', label: 'Marques', match: 'brands' },
]

/** Barre d'onglets mobile (le 3e est le bouton central mis en avant). */
export const TAB_NAV: NavItem[] = [
  { href: '/', label: 'Accueil', match: 'home', emoji: '🏠' },
  { href: '/chien', label: 'Guides', match: 'guides', emoji: '📚' },
  { href: '/quiz', label: 'Le test', match: 'quiz', emoji: '🎯' },
  { href: '/outils', label: 'Outils', match: 'tools', emoji: '🥣' },
  { href: '/chien/race', label: 'Races', match: 'races', emoji: '🐕' },
]

/** Rubrique active d'une adresse (une seule à la fois). */
export function matchSection(pathname: string): NavMatch | null {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/chien/race')) return 'races'
  if (pathname.startsWith('/chien/marque') || pathname.startsWith('/comparateur') || pathname.startsWith('/comparatifs')) return 'brands'
  if (pathname.startsWith('/chien') || pathname.startsWith('/blog')) return 'guides'
  if (pathname.startsWith('/outils')) return 'tools'
  if (pathname.startsWith('/quiz')) return 'quiz'
  return null
}
