import type { CSSProperties } from 'react'
import type { Decoration, ImageTone } from '@/data/images-manifest'

interface DecorativeOverlayProps {
  tone: ImageTone
  decorations: readonly Decoration[]
  /** Only render "targeted" decorations (hat/bowl/bone/paw) when a real photo is present */
  hasImage?: boolean
  intensity?: 'soft' | 'normal'
}

const PRIMARY: Record<ImageTone, string> = {
  cream: 'var(--pill-amber)',
  rose: 'var(--pill-rose)',
  blue: 'var(--pill-blue)',
  amber: 'var(--pill-amber)',
  green: 'var(--pill-green)',
}

const ACCENT: Record<ImageTone, string> = {
  cream: 'var(--pill-rose)',
  rose: 'var(--pill-blue)',
  blue: 'var(--pill-rose)',
  amber: 'var(--pill-rose)',
  green: 'var(--pill-blue)',
}

interface DotProps {
  pos: CSSProperties
  size: number
  fill: string
  shape?: 'circle' | 'tri' | 'bar'
  rotate?: number
}

function Dot({ pos, size, fill, shape = 'circle', rotate = 0 }: DotProps) {
  const common: CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
    ...pos,
  }
  if (shape === 'circle') {
    return <span aria-hidden="true" style={{ ...common, borderRadius: '50%', background: fill }} />
  }
  if (shape === 'bar') {
    return <span aria-hidden="true" style={{ ...common, height: size / 2.5, borderRadius: size, background: fill }} />
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" style={common}>
      <polygon points="5,1 9,9 1,9" fill={fill} />
    </svg>
  )
}

function Sparkle({ pos, size, fill }: { pos: CSSProperties; size: number; fill: string }) {
  return (
    <svg aria-hidden="true" viewBox="-10 -10 20 20" style={{ position: 'absolute', width: size, height: size, ...pos }}>
      <path d="M0 -9 Q0.9 -0.9 9 0 Q0.9 0.9 0 9 Q-0.9 0.9 -9 0 Q-0.9 -0.9 0 -9 Z" fill={fill} />
    </svg>
  )
}

function PartyHat({ pos, size, fill }: { pos: CSSProperties; size: number; fill: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 50 60" style={{ position: 'absolute', width: size, height: size * 1.2, ...pos }}>
      <polygon points="25,4 44,54 6,54" fill={fill} stroke="var(--text-primary)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="25" cy="3" r="3" fill="var(--bg-surface)" stroke="var(--text-primary)" strokeWidth="1.4" />
      <circle cx="19" cy="38" r="1.8" fill="var(--bg-surface)" />
      <circle cx="30" cy="30" r="1.4" fill="var(--bg-surface)" opacity="0.85" />
    </svg>
  )
}

function FoodBowl({ pos, size, fill }: { pos: CSSProperties; size: number; fill: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 50" style={{ position: 'absolute', width: size, height: size * 0.6, ...pos }}>
      <path d="M10 18 Q40 44 70 18 L64 10 L16 10 Z" fill={fill} stroke="var(--text-primary)" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="40" cy="10" rx="28" ry="5" fill="var(--bg-surface)" stroke="var(--text-primary)" strokeWidth="2" />
    </svg>
  )
}

function Bone({ pos, size, fill, rotate = 0 }: { pos: CSSProperties; size: number; fill: string; rotate?: number }) {
  return (
    <svg aria-hidden="true" viewBox="-35 -10 70 20" style={{ position: 'absolute', width: size, height: size * 0.3, transform: `rotate(${rotate}deg)`, ...pos }}>
      <path d="M-30 -4 a4 4 0 1 1 0 8 h60 a4 4 0 1 1 0 -8 Z" fill={fill} stroke="var(--text-primary)" strokeWidth="1.6" />
    </svg>
  )
}

function PawPrint({ pos, size, fill }: { pos: CSSProperties; size: number; fill: string }) {
  return (
    <svg aria-hidden="true" viewBox="-12 -12 24 24" style={{ position: 'absolute', width: size, height: size, ...pos }}>
      <ellipse cx="0" cy="3" rx="6.5" ry="5" fill={fill} stroke="var(--text-primary)" strokeWidth="1" />
      <ellipse cx="-7" cy="-4" rx="2.1" ry="3" fill={fill} stroke="var(--text-primary)" strokeWidth="1" />
      <ellipse cx="-2.2" cy="-7" rx="2.1" ry="3" fill={fill} stroke="var(--text-primary)" strokeWidth="1" />
      <ellipse cx="2.2" cy="-7" rx="2.1" ry="3" fill={fill} stroke="var(--text-primary)" strokeWidth="1" />
      <ellipse cx="7" cy="-4" rx="2.1" ry="3" fill={fill} stroke="var(--text-primary)" strokeWidth="1" />
    </svg>
  )
}

export function DecorativeOverlay({ tone, decorations, hasImage = false, intensity = 'normal' }: DecorativeOverlayProps) {
  const primary = PRIMARY[tone]
  const accent = ACCENT[tone]
  const opacity = intensity === 'soft' ? 0.75 : 1

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ opacity }}>
      {decorations.includes('confetti') && (
        <>
          <Dot pos={{ top: '10%', left: '6%' }} size={14} fill={primary} />
          <Dot pos={{ top: '18%', right: '8%' }} size={12} fill={accent} />
          <Dot pos={{ top: '8%', right: '22%' }} size={9} fill={primary} shape="tri" rotate={14} />
          <Dot pos={{ bottom: '12%', left: '10%' }} size={10} fill={accent} shape="tri" rotate={-22} />
          <Dot pos={{ bottom: '22%', right: '14%' }} size={16} fill={primary} />
          <Dot pos={{ top: '42%', left: '4%' }} size={22} fill={accent} shape="bar" rotate={20} />
          <Dot pos={{ bottom: '8%', right: '32%' }} size={8} fill={accent} />
        </>
      )}
      {decorations.includes('sparkle') && (
        <>
          <Sparkle pos={{ top: '14%', right: '14%' }} size={26} fill="var(--accent-1)" />
          <Sparkle pos={{ bottom: '18%', left: '14%' }} size={18} fill={accent} />
        </>
      )}
      {hasImage && decorations.includes('party-hat') && (
        <PartyHat pos={{ top: '6%', left: '50%', transform: 'translateX(-50%)' }} size={64} fill={primary} />
      )}
      {hasImage && decorations.includes('food-bowl') && (
        <FoodBowl pos={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)' }} size={140} fill={primary} />
      )}
      {hasImage && decorations.includes('bone') && (
        <Bone pos={{ bottom: '14%', left: '10%' }} size={72} fill={primary} rotate={-18} />
      )}
      {hasImage && decorations.includes('paw-print') && (
        <PawPrint pos={{ top: '12%', right: '10%' }} size={44} fill={primary} />
      )}
    </div>
  )
}
