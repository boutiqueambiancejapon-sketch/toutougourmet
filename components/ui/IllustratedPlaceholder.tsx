import type { ImageTone } from '@/data/images-manifest'

export type PlaceholderVariant = 'landscape' | 'dog' | 'food' | 'editorial'

interface IllustratedPlaceholderProps {
  variant: PlaceholderVariant
  tone: ImageTone
}

interface PaletteEntry {
  bg: string
  fg: string
  accent: string
}

const PALETTE: Record<ImageTone, PaletteEntry> = {
  cream: { bg: 'var(--bg-surface-2)', fg: 'var(--border)', accent: 'var(--border-strong)' },
  rose: { bg: 'var(--bg-rose)', fg: 'var(--pill-rose)', accent: 'var(--accent-rose)' },
  blue: { bg: 'var(--bg-blue)', fg: 'var(--pill-blue)', accent: 'var(--accent-blue)' },
  amber: { bg: 'var(--bg-amber)', fg: 'var(--pill-amber)', accent: 'var(--accent-2)' },
  green: { bg: 'var(--bg-green)', fg: 'var(--pill-green)', accent: 'var(--accent-3)' },
}

function Landscape({ p }: { p: PaletteEntry }) {
  return (
    <svg viewBox="0 0 100 56" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="100" height="56" fill={p.bg} />
      <circle cx="74" cy="18" r="9" fill={p.accent} opacity="0.55" />
      <path d="M0 44 L22 30 L38 38 L58 26 L74 34 L100 28 L100 56 L0 56 Z" fill={p.fg} />
      <path d="M0 50 L16 42 L32 48 L52 40 L72 46 L100 40 L100 56 L0 56 Z" fill={p.accent} opacity="0.55" />
    </svg>
  )
}

function Dog({ p }: { p: PaletteEntry }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="100" height="100" fill={p.bg} />
      <circle cx="78" cy="20" r="7" fill={p.accent} opacity="0.4" />
      {/* corps */}
      <ellipse cx="50" cy="66" rx="22" ry="12" fill={p.fg} />
      {/* tête */}
      <circle cx="66" cy="52" r="11" fill={p.fg} />
      {/* oreille */}
      <path d="M70 40 L64 30 L76 32 Z" fill={p.accent} opacity="0.7" />
      {/* museau */}
      <ellipse cx="72" cy="56" rx="4" ry="3" fill={p.accent} opacity="0.5" />
      <circle cx="74" cy="54" r="1" fill="var(--text-primary)" opacity="0.6" />
      {/* pattes */}
      <rect x="34" y="74" width="4" height="12" rx="2" fill={p.fg} />
      <rect x="44" y="76" width="4" height="12" rx="2" fill={p.fg} />
      <rect x="56" y="76" width="4" height="12" rx="2" fill={p.fg} />
      <rect x="64" y="74" width="4" height="12" rx="2" fill={p.fg} />
      {/* sol */}
      <rect x="0" y="88" width="100" height="12" fill={p.accent} opacity="0.25" />
    </svg>
  )
}

function Food({ p }: { p: PaletteEntry }) {
  return (
    <svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="100" height="75" fill={p.bg} />
      <ellipse cx="50" cy="44" rx="30" ry="22" fill={p.accent} opacity="0.35" />
      <ellipse cx="50" cy="42" rx="24" ry="16" fill={p.fg} />
      {/* croquettes */}
      <circle cx="42" cy="38" r="3" fill={p.accent} opacity="0.85" />
      <circle cx="52" cy="34" r="2.6" fill={p.accent} opacity="0.75" />
      <circle cx="58" cy="42" r="3.2" fill={p.accent} opacity="0.85" />
      <circle cx="46" cy="44" r="2.4" fill={p.accent} opacity="0.65" />
      <circle cx="50" cy="40" r="2.2" fill={p.accent} opacity="0.75" />
      <circle cx="54" cy="46" r="1.8" fill={p.accent} opacity="0.6" />
      <circle cx="42" cy="46" r="1.6" fill={p.accent} opacity="0.6" />
      {/* reflet bol */}
      <ellipse cx="40" cy="32" rx="8" ry="2" fill="var(--bg-surface)" opacity="0.4" />
    </svg>
  )
}

function Editorial({ p }: { p: PaletteEntry }) {
  return (
    <svg viewBox="0 0 100 66" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="100" height="66" fill={p.bg} />
      <circle cx="78" cy="20" r="14" fill={p.accent} opacity="0.45" />
      <rect x="12" y="12" width="52" height="40" rx="4" fill={p.fg} opacity="0.8" />
      <circle cx="26" cy="28" r="7" fill={p.accent} opacity="0.85" />
      <rect x="40" y="24" width="20" height="2.8" rx="1.4" fill={p.accent} opacity="0.6" />
      <rect x="40" y="31" width="14" height="2.8" rx="1.4" fill={p.accent} opacity="0.45" />
      <rect x="16" y="42" width="44" height="2.8" rx="1.4" fill={p.accent} opacity="0.45" />
      <path d="M0 58 L30 48 L60 54 L100 46 L100 66 L0 66 Z" fill={p.accent} opacity="0.35" />
    </svg>
  )
}

export function IllustratedPlaceholder({ variant, tone }: IllustratedPlaceholderProps) {
  const p = PALETTE[tone]
  if (variant === 'dog') return <Dog p={p} />
  if (variant === 'food') return <Food p={p} />
  if (variant === 'editorial') return <Editorial p={p} />
  return <Landscape p={p} />
}
