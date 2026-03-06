import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { BrandCTA } from './BrandCTA'
import { formatDate } from '@/lib/utils'
import type { Brand } from '@/data/brands'

interface BrandHeroProps {
  brand: Brand
}

export function BrandHero({ brand }: BrandHeroProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
      {/* Infos */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-2xl font-black" style={{ fontFamily: "'Fraunces', serif" }}>
            {brand.name}
          </h1>
          <Badge variant="promo">{brand.priceRange}</Badge>
          {brand.animal.map((a) => (
            <Badge key={a} variant={a === 'chat' ? 'cat' : 'default'}>
              {a === 'chien' ? '🐶 Chien' : '🐱 Chat'}
            </Badge>
          ))}
        </div>
        <p className="text-[var(--text-secondary)] mb-3">{brand.tagline}</p>
        <StarRating score={brand.scores.global} size={18} />
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Mis à jour le {formatDate(new Date().toISOString())} par l&apos;équipe Toutou Gourmet
        </p>
      </div>

      {/* CTA */}
      <div className="w-full md:w-72">
        <BrandCTA
          brandName={brand.name}
          affiliateUrl={brand.affiliateUrl}
          offer={brand.discountOffer}
          code={brand.affiliateCode}
          variant="primary"
        />
      </div>
    </div>
  )
}
