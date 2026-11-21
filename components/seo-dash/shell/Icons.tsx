import type { IconKey } from '@/lib/seo-dash/nav'

// @cdc tableau de bord SEO — icônes au trait (barre du bas) et pictogrammes d'état (toujours avec un texte).

const PATHS: Record<IconKey, string> = {
  today: 'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8',
  google: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L21 21',
  crawl: 'M4 6h16M4 12h10M4 18h6M17 14l4 4-4 4',
  tech: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
  revenue: 'M4 20h16M7 20v-6M11 20V9M15 20v-4M19 20V6',
  live: 'M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8',
  sources: 'M3 5h5l4 7 4-7h5M12 12v9M8.5 17.5L12 21l3.5-3.5',
  notes: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  menu: 'M4 7h16M4 12h16M4 17h16',
}

export function NavIcon({ name }: { name: IconKey }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export type Status = 'good' | 'warn' | 'crit' | 'info'

/** Pastille d'état : la couleur ne porte jamais le sens seule (forme différente + texte à côté). */
export function StatusIcon({ status }: { status: Status }) {
  if (status === 'good') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="7" fill="var(--sd-good)" />
        <path d="M4 7.2l2 2 4-4.4" stroke="var(--white)" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'crit') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 1l6.5 12H.5z" fill="var(--sd-crit)" />
        <path d="M7 5.5v3.2M7 10.6v.2" stroke="var(--white)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (status === 'info') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="6" fill="none" stroke="var(--sd-s2)" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="7" fill="var(--sd-warn)" />
      <path d="M7 3.5v4M7 9.9v.2" stroke="var(--ink)" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
