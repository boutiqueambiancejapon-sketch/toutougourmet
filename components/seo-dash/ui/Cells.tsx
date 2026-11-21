import Link from 'next/link'
import { shortPath } from '@/lib/seo-dash/format'
import { pageHref, queryHref } from '@/lib/seo-dash/nav'

// @cdc tableau de bord SEO — cellules réutilisées : barre proportionnelle, position sur l'échelle 1 → 20,
// liens vers le détail d'une page ou d'une requête (titre complet au survol).

export function BarIn({ value, max, color = 'var(--sd-s1)' }: { value: number; max: number; color?: string }) {
  const w = max > 0 ? Math.max(2, Math.round((Math.abs(value) / max) * 100)) : 0
  return (
    <div className="sd-bar-in" aria-hidden="true">
      <i style={{ width: `${w}%`, background: color }} />
    </div>
  )
}

/** Point sur une réglette 1 → 20 : à gauche = mieux classé, trait au milieu = position 10. Au-delà de 20, collé au bout. */
export function RangeDot({ position }: { position: number }) {
  const x = 5 + Math.min(1, Math.max(0, (position - 1) / 19)) * 80
  return (
    <svg className="sd-range" width="90" height="12" viewBox="0 0 90 12" aria-hidden="true">
      <line x1="5" x2="85" y1="6" y2="6" stroke="var(--sd-line-2)" strokeWidth="1" />
      <line x1="43" x2="43" y1="3" y2="9" stroke="var(--sd-axis)" strokeWidth="1" />
      <circle cx={x} cy="6" r="4" fill="var(--sd-s2)" stroke="var(--sd-card)" strokeWidth="2" />
    </svg>
  )
}

export function PageLink({ path, query, max }: { path: string; query: string; max?: number }) {
  return (
    <Link href={pageHref(path, query)} title={path}>
      {shortPath(path, max)}
    </Link>
  )
}

export function QueryLink({ text, query }: { text: string; query: string }) {
  return (
    <Link href={queryHref(text, query)} title={text}>
      {text}
    </Link>
  )
}
