import Link from 'next/link'
import { brandOfferLabel, brandTone, type Brand } from '@/data/brands'

interface BrandCardProps {
  brand: Brand
  showCTA?: boolean
}

export function BrandCard({ brand, showCTA = true }: BrandCardProps) {
  const tone = brandTone(brand.slug)
  const forWho = brand.animal.includes('chat') ? 'Chien et chat' : 'Chien'
  return (
    <div className="card p-5 flex flex-col gap-3">
      {/* Nom + score */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="m-0 text-lg font-black leading-tight" style={{ fontFamily: "'Fraunces', serif", color: tone.ink }}>
          {brand.name}
        </h3>
        <span
          className="text-xl font-black leading-none shrink-0"
          style={{ fontFamily: "'Fraunces', serif", color: tone.ink }}
        >
          {brand.scores.global.toFixed(1)}
          <span className="text-xs font-normal opacity-60">/5</span>
        </span>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{brand.tagline}</p>

      {/* Animaux + prix en ligne */}
      <div className="flex items-center gap-2 flex-wrap text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>{forWho}</span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold" style={{ color: tone.ink }}>{brand.priceRange}</span>
      </div>

      {/* Offre, ou alerte de stock */}
      <div className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold"
        style={{ background: tone.bg, color: tone.ink }}>
        {brandOfferLabel(brand)}
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-1">
        {showCTA && (
          <Link
            href={brand.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-primary text-center text-sm py-2.5"
          >
            {`Voir le site ${brand.name}`}
          </Link>
        )}
        <Link
          href={`/chien/marque/${brand.slug}`}
          className="text-center text-sm font-medium hover:underline"
          style={{ color: tone.ink }}
        >
          Lire notre avis complet
        </Link>
      </div>
    </div>
  )
}
