// @cdc tableau de bord SEO — architecture : 7 onglets de pilotage, puis les outils (moins souvent ouverts).
// Les anciennes adresses des outils restent ; celles remplacées redirigent (next.config.ts).

export const ROOT = '/tableau-de-bord'

export type IconKey = 'today' | 'google' | 'crawl' | 'tech' | 'revenue' | 'live' | 'notes' | 'menu'

export interface NavItem {
  slug: string
  label: string
  desc: string
  icon?: IconKey
  /** Outil sans barre de filtres commune. */
  tool?: boolean
}

export const MAIN_TABS: NavItem[] = [
  { slug: '', label: 'Aujourd’hui', desc: 'Les 5 actions du jour et ce qui sort de l’ordinaire', icon: 'today' },
  { slug: 'google', label: 'Google', desc: 'Clics, positions, opportunités, indexation', icon: 'google' },
  { slug: 'exploration', label: 'Exploration', desc: 'Ce que Googlebot et les IA lisent', icon: 'crawl' },
  { slug: 'technique', label: 'Technique', desc: 'Vitesse, liens cassés, titres', icon: 'tech' },
  { slug: 'revenus', label: 'Revenus', desc: 'Quelles pages rapportent, et combien', icon: 'revenue' },
  { slug: 'en-direct', label: 'Direct', desc: 'Qui est sur le site maintenant', icon: 'live' },
  { slug: 'contenu', label: 'Contenu & notes', desc: 'Publications, changements, notes', icon: 'notes' },
]

export const TOOLS: NavItem[] = [
  { slug: 'conversions', label: 'Comptes', desc: 'Inscriptions, comptes, e-mails gagnés', tool: true },
  { slug: 'crm', label: 'CRM', desc: 'Contacts et suivi', tool: true },
  { slug: 'emails', label: 'E-mails', desc: 'Les e-mails envoyés', tool: true },
  { slug: 'scanner', label: 'Produits et scanner', desc: 'Scans, fiches, relectures', tool: true },
  { slug: 'assistant', label: 'Milo', desc: 'Questions posées à l’assistant', tool: true },
  { slug: 'relecture', label: 'Messages et relecture', desc: 'Messages reçus, tâche de nuit, fiches à relire', tool: true },
  { slug: 'serveur', label: 'Serveur', desc: 'Santé du serveur et sauvegardes', tool: true },
  { slug: 'securite', label: 'Sécurité', desc: 'Connexions et appareils', tool: true },
]

/** Barre du bas sur iPhone : 4 onglets + Menu. */
export const BOTTOM_BAR: { slug: string; label: string; icon: IconKey }[] = [
  { slug: '', label: 'Aujourd’hui', icon: 'today' },
  { slug: 'google', label: 'Google', icon: 'google' },
  { slug: 'revenus', label: 'Revenus', icon: 'revenue' },
  { slug: 'en-direct', label: 'Direct', icon: 'live' },
  { slug: 'menu', label: 'Menu', icon: 'menu' },
]

export function hrefOf(slug: string, query = ''): string {
  return `${slug ? `${ROOT}/${slug}` : ROOT}${query}`
}

/** Onglet allumé pour une adresse du tableau de bord (sous-pages comprises). */
export function currentSlug(pathname: string): string {
  const rest = pathname.replace(/^\/tableau-de-bord\/?/, '')
  const first = rest.split('/')[0] ?? ''
  if (first === 'fiches') return 'scanner'
  if (first === 'visiteurs') return 'conversions'
  return first
}

/** Détail d'une page (même gabarit pour toutes), filtres gardés. */
export function pageHref(path: string, query = ''): string {
  const q = new URLSearchParams(query.replace(/^\?/, ''))
  q.set('u', path)
  return `${ROOT}/google/page?${q.toString()}`
}

/** Détail d'une requête. */
export function queryHref(text: string, query = ''): string {
  const q = new URLSearchParams(query.replace(/^\?/, ''))
  q.set('q', text)
  return `${ROOT}/google/requete?${q.toString()}`
}

/** Export CSV d'un tableau : même requête que l'écran. */
export function csvHref(id: string, query = '', extra: Record<string, string> = {}): string {
  const q = new URLSearchParams(query.replace(/^\?/, ''))
  for (const [k, v] of Object.entries(extra)) q.set(k, v)
  const s = q.toString()
  return `${ROOT}/export/${id}${s ? `?${s}` : ''}`
}
