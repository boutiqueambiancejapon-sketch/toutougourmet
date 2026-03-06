import Link from 'next/link'
import Image from 'next/image'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import type { Brand } from '@/data/brands'

interface BrandCardProps {
  brand: Brand
  showCTA?: boolean
}

export function BrandCard({ brand, showCTA = true }: BrandCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 relative rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-surface-2)] shrink-0 flex items-center justify-center text-2xl">
          {brand.logo ? (
            <Image src={brand.logo} alt={`Logo ${brand.name}`} fill className="object-contain p-1" />
          ) : (
            '🐾'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Fraunces', serif" }}>
              {brand.name}
            </h3>
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
