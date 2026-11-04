import { periodQuery, type PeriodKey } from './period'

// @cdc tableau de bord — onglets : l'accueil répond à « tout va bien, ça progresse, quoi faire »,
// chaque onglet à une seule question. La période choisie suit d'un onglet à l'autre (?periode=).

export const TABS = [
  { slug: '', label: 'Accueil', question: 'Tout va bien, ça progresse, et qu’est-ce qui attend ?' },
  { slug: 'trafic', label: 'Trafic', question: 'Qui vient sur le site, d’où, et que font-ils ?' },
  { slug: 'crm', label: 'CRM', question: 'Qui sont mes contacts, et où en est chacun ?' },
  { slug: 'conversions', label: 'Conversions', question: 'Quelles pages rapportent des e-mails, des comptes et des clics ?' },
  { slug: 'robots', label: 'Robots IA', question: 'Quels robots d’IA lisent le site, et quelles pages ?' },
  { slug: 'contenu', label: 'Contenu', question: 'La tâche de nuit a-t-elle tourné, et qu’est-ce qui attend une relecture ?' },
  { slug: 'emails', label: 'E-mails', question: 'À quoi ressemblent les e-mails envoyés ?' },
  { slug: 'serveur', label: 'Serveur', question: 'Le serveur tient-il, et la sauvegarde est-elle à jour ?' },
] as const

export type TabSlug = (typeof TABS)[number]['slug']

export const DASHBOARD_ROOT = '/tableau-de-bord'

export function tabHref(slug: TabSlug, period: PeriodKey, hash = '', sub = ''): string {
  const path = slug ? `${DASHBOARD_ROOT}/${slug}${sub}` : DASHBOARD_ROOT
  return `${path}${periodQuery(period)}${hash}`
}

export function tabOf(slug: TabSlug): (typeof TABS)[number] {
  return TABS.find((t) => t.slug === slug) ?? TABS[0]
}
