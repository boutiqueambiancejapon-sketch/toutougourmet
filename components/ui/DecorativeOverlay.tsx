import type { Decoration, ImageTone } from '@/data/images-manifest'

interface DecorativeOverlayProps {
  tone: ImageTone
  decorations: readonly Decoration[]
  /** Optional override to dim overlays when placed over busy photos */
  intensity?: 'soft' | 'normal'
}

const TONE_FILL: Record<ImageTone, string> = {
  cream: 'var(--pill-amber)',
  rose: 'var(--pill-rose)',
  blue: 'var(--pill-blue)',
  amber: 'var(--pill-amber)',
  green: 'var(--pill-green)',
}

const TONE_SECONDARY: Record<ImageTone, string> = {
  cream: 'var(--pill-rose)',
  rose: 'var(--pill-blue)',
  blue: 'var(--pill-rose)',
  amber: 'var(--pill-rose)',
  green: 'var(--pill-blue)',
}

function Confetti({ fill, alt }: { fill: string; alt: string }) {
  return (
    <g aria-hidden="true">
      <circle cx="12" cy="18" r="2.2" fill={fill} />
      <circle cx="88" cy="24" r="1.8" fill={alt} />
      <circle cx="78" cy="12" r="1.4" fill={fill} opacity="0.85" />
      <polygon points="22,8 26,4 28,10" fill={alt} />
      <polygon points="92,82 96,78 97,86" fill={fill} />
      <rect x="6" y="68" width="5" height="1.6" rx="0.8" fill={alt} transform="rotate(24 8 69)" />
      <rect x="70" y="62" width="5" height="1.6" rx="0.8" fill={fill} transform="rotate(-18 72 63)" />
      <circle cx="50" cy="6" r="1.2" fill={alt} opacity="0.85" />
      <polygon points="44,90 48,86 50,92" fill={fill} opacity="0.9" />
    </g>
  )
}

function Sparkle({ fill, x, y, size = 6 }: { fill: string; x: number; y: number; size?: number }) {
  const s = size
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <path d={`M0 -${s} Q0.6 -0.6 ${s} 0 Q0.6 0.6 0 ${s} Q-0.6 0.6 -${s} 0 Q-0.6 -0.6 0 -${s} Z`} fill={fill} />
    </g>
  )
}

function PartyHat({ fill }: { fill: string }) {
  return (
    <g aria-hidden="true">
      <polygon points="50,6 62,34 38,34" fill={fill} stroke="var(--text-primary)" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="50" cy="5" r="2.4" fill="var(--bg-surface)" stroke="var(--text-primary)" strokeWidth="0.8" />
      <circle cx="44" cy="26" r="1.2" fill="var(--bg-surface)" />
      <circle cx="54" cy="22" r="1" fill="var(--bg-surface)" opacity="0.9" />
    </g>
  )
}

function FoodBowl({ fill }: { fill: string }) {
  return (
    <g aria-hidden="true">
      <ellipse cx="50" cy="88" rx="24" ry="5" fill="var(--text-primary)" opacity="0.12" />
      <path d="M26 82 Q50 100 74 82 L70 74 L30 74 Z" fill={fill} stroke="var(--text-primary)" strokeWidth="1.2" strokeLinejoin="round" />
      <ellipse cx="50" cy="74" rx="20" ry="3.6" fill="var(--bg-surface)" stroke="var(--text-primary)" strokeWidth="1.2" />
    </g>
  )
}

function Bone({ fill, x, y }: { fill: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-18)`} aria-hidden="true">
      <path d="M-14 -3 a3 3 0 1 1 0 6 h28 a3 3 0 1 1 0 -6 Z" fill={fill} stroke="var(--text-primary)" strokeWidth="1" strokeLinejoin="round" />
    </g>
  )
}

function PawPrint({ fill, x, y }: { fill: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <ellipse cx="0" cy="3" rx="5" ry="4" fill={fill} stroke="var(--text-primary)" strokeWidth="0.8" />
      <ellipse cx="-5" cy="-4" rx="1.6" ry="2.4" fill={fill} stroke="var(--text-primary)" strokeWidth="0.8" />
      <ellipse cx="-1.6" cy="-6" rx="1.6" ry="2.4" fill={fill} stroke="var(--text-primary)" strokeWidth="0.8" />
      <ellipse cx="1.8" cy="-6" rx="1.6" ry="2.4" fill={fill} stroke="var(--text-primary)" strokeWidth="0.8" />
      <ellipse cx="5" cy="-4" rx="1.6" ry="2.4" fill={fill} stroke="var(--text-primary)" strokeWidth="0.8" />
    </g>
  )
}

export function DecorativeOverlay({ tone, decorations, intensity = 'normal' }: DecorativeOverlayProps) {
  const primary = TONE_FILL[tone]
  const accent = TONE_SECONDARY[tone]
  const opacity = intensity === 'soft' ? 0.7 : 1

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    >
      {decorations.includes('confetti') && <Confetti fill={primary} alt={accent} />}
      {decorations.includes('sparkle') && (
        <>
          <Sparkle fill="var(--accent-1)" x={86} y={12} size={5} />
          <Sparkle fill={accent} x={14} y={84} size={4} />
        </>
      )}
      {decorations.includes('party-hat') && <PartyHat fill={primary} />}
      {decorations.includes('food-bowl') && <FoodBowl fill={primary} />}
      {decorations.includes('bone') && <Bone fill={primary} x={20} y={84} />}
      {decorations.includes('paw-print') && <PawPrint fill={primary} x={86} y={18} />}
    </svg>
  )
}
