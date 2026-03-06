import type { ReactNode } from 'react'

// ─── InfoBox ─────────────────────────────────────────────────────────────────
// Équivalent des callout boxes colorées de Klaro

type InfoBoxColor = 'rose' | 'blue' | 'green' | 'amber' | 'dark'

const infoBoxStyles: Record<InfoBoxColor, { bg: string; border: string; titleColor: string }> = {
  rose:  { bg: 'var(--bg-rose)',   border: 'var(--pill-rose)',  titleColor: '#8B1A4A' },
  blue:  { bg: 'var(--bg-blue)',   border: 'var(--pill-blue)',  titleColor: '#1A4E8B' },
  green: { bg: '#F0FFF8',          border: 'var(--pill-green)', titleColor: '#1A7A47' },
  amber: { bg: '#FFFBF0',          border: 'var(--pill-amber)', titleColor: '#C47C00' },
  dark:  { bg: 'var(--bg-dark)',   border: 'var(--bg-dark)',    titleColor: 'var(--text-on-dark)' },
}

export function InfoBox({
  children,
  color = 'blue',
  title,
  emoji,
}: {
  children: ReactNode
  color?: InfoBoxColor
  title?: string
  emoji?: string
}) {
  const s = infoBoxStyles[color]
  return (
    <div
      className="rounded-[var(--radius-lg)] p-5 my-6 border-l-4"
      style={{ background: s.bg, borderLeftColor: s.border }}
    >
      {(title || emoji) && (
        <p className="font-bold text-sm mb-2" style={{ color: s.titleColor }}>
          {emoji && <span className="mr-1">{emoji}</span>}
          {title}
        </p>
      )}
      <div
        className="text-sm leading-relaxed"
        style={{ color: color === 'dark' ? 'var(--text-on-dark)' : 'var(--text-secondary)' }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Callout ──────────────────────────────────────────────────────────────────
// Citation / point important encadré

export function Callout({
  children,
  emoji = '💡',
}: {
  children: ReactNode
  emoji?: string
}) {
  return (
    <div
      className="rounded-[var(--radius-xl)] p-6 my-6 border border-[var(--border)]"
      style={{ background: 'var(--bg-surface-2)' }}
    >
      <div className="flex gap-3">
        <span className="text-2xl shrink-0">{emoji}</span>
        <div className="text-base text-[var(--text-secondary)] leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

// ─── FeatureGrid ──────────────────────────────────────────────────────────────
// Grille de features/caractéristiques (comme les cartes Klaro)

export function FeatureGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
      {children}
    </div>
  )
}

export function Feature({
  title,
  value,
  icon,
  positive,
  negative,
}: {
  title: string
  value?: string
  icon?: string
  positive?: boolean
  negative?: boolean
}) {
  const borderColor =
    positive ? 'var(--accent-3)' :
    negative ? 'var(--accent-1)' :
    'var(--border)'

  const titleColor =
    positive ? 'var(--accent-3)' :
    negative ? 'var(--accent-1)' :
    'var(--text-primary)'

  const prefix = positive ? '✓ ' : negative ? '✗ ' : ''

  return (
    <div
      className="rounded-[var(--radius-lg)] p-4 border"
      style={{ background: 'var(--bg-surface)', borderColor }}
    >
      <p className="text-sm font-bold mb-1" style={{ color: titleColor }}>
        {prefix}{icon && <span className="mr-1">{icon}</span>}{title}
      </p>
      {value && (
        <p className="text-sm text-[var(--text-secondary)]">{value}</p>
      )}
    </div>
  )
}

// ─── StatRow ──────────────────────────────────────────────────────────────────
// Ligne de stats visuelles

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
      {children}
    </div>
  )
}

export function Stat({
  value,
  label,
  color = 'default',
}: {
  value: string
  label: string
  color?: 'default' | 'rose' | 'blue' | 'green' | 'amber'
}) {
  const pillColors = {
    default: { bg: 'var(--bg-surface-2)', text: 'var(--accent-1)',  accent: 'var(--accent-1)' },
    rose:    { bg: 'var(--pill-rose)',     text: '#8B1A4A',          accent: '#8B1A4A' },
    blue:    { bg: 'var(--pill-blue)',     text: '#1A4E8B',          accent: '#1A4E8B' },
    green:   { bg: 'var(--pill-green)',    text: '#1A7A47',          accent: '#1A7A47' },
    amber:   { bg: 'var(--pill-amber)',    text: '#C47C00',          accent: '#C47C00' },
  }
  const c = pillColors[color]

  return (
    <div
      className="rounded-[var(--radius-xl)] p-5 flex flex-col items-center gap-3 text-center"
      style={{ background: c.bg, borderTop: `3px solid ${c.accent}` }}
    >
      <p
        className="font-black leading-none whitespace-nowrap"
        style={{ fontFamily: "'Fraunces', serif", color: c.text, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
      >
        {value}
      </p>
      <p className="text-sm leading-snug" style={{ color: c.text, opacity: 0.7 }}>{label}</p>
    </div>
  )
}

// ─── CompareTable ─────────────────────────────────────────────────────────────
// Tableau comparatif stylisé (comme Klaro)

export function CompareTable({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border)]">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

export function CompareThead({ children }: { children: ReactNode }) {
  return (
    <thead style={{ background: 'var(--bg-dark)', color: 'var(--text-on-dark)' }}>
      {children}
    </thead>
  )
}

export function CompareTh({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
      {children}
    </th>
  )
}

export function CompareTr({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
  return (
    <tr
      style={{
        background: highlight ? 'var(--bg-rose)' : undefined,
        borderBottom: '1px solid var(--border)',
      }}
    >
      {children}
    </tr>
  )
}

export function CompareTd({
  children,
  good,
  bad,
}: {
  children: ReactNode
  good?: boolean
  bad?: boolean
}) {
  const color = good ? 'var(--accent-3)' : bad ? 'var(--accent-1)' : 'var(--text-secondary)'
  return (
    <td className="px-4 py-3" style={{ color }}>
      {good && <span className="mr-1 font-bold">✓</span>}
      {bad && <span className="mr-1 font-bold">✗</span>}
      {children}
    </td>
  )
}

// ─── Verdict ──────────────────────────────────────────────────────────────────
// Bloc verdict final de l'article

export function Verdict({
  children,
  brand,
  score,
  emoji = '🏆',
}: {
  children: ReactNode
  brand?: string
  score?: number
  emoji?: string
}) {
  return (
    <div
      className="rounded-[var(--radius-xl)] p-6 my-8 border-2"
      style={{ background: 'var(--bg-dark)', borderColor: 'var(--pill-rose)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{emoji}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--pill-rose)' }}>
            Notre verdict
          </p>
          {brand && (
            <p className="font-black text-xl" style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-on-dark)' }}>
              {brand}
              {score && (
                <span
                  className="ml-2 text-base px-2 py-0.5 rounded-[var(--radius-sm)]"
                  style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}
                >
                  {score}/10
                </span>
              )}
            </p>
          )}
        </div>
      </div>
      <div className="verdict-content text-base leading-relaxed" style={{ color: 'var(--text-on-dark)' }}>
        {children}
      </div>
    </div>
  )
}

// ─── ProsConsList ─────────────────────────────────────────────────────────────

export function ProsConsList({ pros = [], cons = [] }: { pros?: string[]; cons?: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      <div className="rounded-[var(--radius-lg)] p-4 border" style={{ borderColor: 'var(--pill-green)', background: '#F0FFF8' }}>
        <p className="text-sm font-bold mb-3" style={{ color: '#1A7A47' }}>Points forts</p>
        <ul className="space-y-2">
          {pros.map((p, i) => (
            <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
              <span style={{ color: '#1A7A47' }} className="shrink-0 font-bold">✓</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[var(--radius-lg)] p-4 border" style={{ borderColor: 'var(--pill-rose)', background: 'var(--bg-rose)' }}>
        <p className="text-sm font-bold mb-3" style={{ color: '#8B1A4A' }}>Points faibles</p>
        <ul className="space-y-2">
          {cons.map((c, i) => (
            <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
              <span style={{ color: 'var(--accent-1)' }} className="shrink-0 font-bold">✗</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── SectionDivider ──────────────────────────────────────────────────────────

export function SectionDivider({ label }: { label?: string }) {
  if (!label) return <hr className="border-[var(--border)] my-8" />
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-[var(--border)]" />
      <span
        className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
        style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  )
}
