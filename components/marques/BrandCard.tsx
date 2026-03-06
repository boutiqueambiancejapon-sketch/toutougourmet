import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
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
    <div className="card p-5 flex flex-col gap-4" style={{ borderTop: `3px solid ${accent}` }}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold" style={{ fontFamily: "'Fraunces', serif", color: accent }}>
              {brand.name}
            </h2>
            <Badge variant="default">{brand.priceRange}</Badge>
          </div>
          <StarRating score={brand.scores.global} size={14} />
        </div>
      </div>

      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{brand.tagline}</p>

      {/* Animaux */}
      <div className="flex gap-2">
        {brand.animal.map((a) => (
          <Badge key={a} variant={a === 'chat' ? 'cat' : 'default'}>
            {a === 'chien' ? '🐶 Chien' : '🐱 Chat'}
          </Badge>
        ))}
      </div>

      {/* Offre */}
      {brand.discountOffer && (
        <div className="bg-[var(--bg-surface-2)] rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-[var(--accent-1)]">
          🎉 {brand.discountOffer}
        </div>
      )}

      {showCTA && (
        <Link
          href={brand.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="btn-primary text-center text-sm"
        >
          Essayer {brand.name} →
        </Link>
      )}

      <Link
        href={`/marques/${brand.slug}`}
        className="text-center text-sm font-medium text-[var(--accent-1)] hover:underline"
      >
        Voir notre avis complet
      </Link>
    </div>
  )
}
