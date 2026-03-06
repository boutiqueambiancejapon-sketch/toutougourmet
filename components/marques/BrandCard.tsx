import Link from 'next/link'
import type { Brand } from '@/data/brands'

const accentBySlug: Record<string, string> = {
  franklin:     '#1A7A47',
  elmut:        '#8B1A4A',
  'petty-well': '#1A4E8B',
  'dog-chef':   '#C47C00',
}

interface BrandCardProps {
  brand: Brand
  showCTA?: boolean
}

export function BrandCard({ brand, showCTA = true }: BrandCardProps) {
  const accent = accentBySlug[brand.slug] ?? 'var(--accent-1)'
  return (
    <div className="card p-5 flex flex-col gap-3" style={{ borderTop: `3px solid ${accent}` }}>
      {/* Nom + score */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-black leading-tight" style={{ fontFamily: "'Fraunces', serif", color: accent }}>
          {brand.name}
        </h2>
        <span
          className="text-xl font-black leading-none shrink-0"
          style={{ fontFamily: "'Fraunces', serif", color: accent }}
        >
          {brand.scores.global.toFixed(1)}
          <span className="text-xs font-normal opacity-60">/5</span>
        </span>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{brand.tagline}</p>

      {/* Animaux + prix en ligne */}
      <div className="flex items-center gap-2 flex-wrap text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>{brand.animal.map((a) => (a === 'chien' ? '🐶' : '🐱')).join(' ')}</span>
        <span>·</span>
        <span className="font-semibold" style={{ color: accent }}>{brand.priceRange}</span>
      </div>

      {/* Offre */}
      {brand.discountOffer && (
        <div className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold"
          style={{ background: 'var(--bg-surface-2)', color: accent }}>
          {brand.discountOffer}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-auto pt-1">
        {showCTA && (
          <Link
            href={brand.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-primary text-center text-sm py-2.5"
          >
            Essayer →
          </Link>
        )}
        <Link
          href={`/marques/${brand.slug}`}
          className="text-center text-sm font-medium hover:underline"
          style={{ color: accent }}
        >
          Voir notre avis complet
        </Link>
      </div>
    </div>
  )
}
