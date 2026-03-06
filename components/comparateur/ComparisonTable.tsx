import Link from 'next/link'
import { Check, X, Minus } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { brands } from '@/data/brands'

const criteriaLabels: Record<string, string> = {
  global: 'Note globale',
  qualiteIngredients: 'Qualité ingrédients',
  rapportQualitePrix: 'Rapport qualité/prix',
  digestibilite: 'Digestibilité',
  variantesDisponibles: 'Variantes disponibles',
  serviceClient: 'Service client',
}

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="min-w-full border-collapse text-sm" aria-label="Comparatif des marques">
        <thead>
          <tr className="bg-[var(--bg-surface-2)]">
            <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] w-44">
              Critère
            </th>
            {brands.map((brand) => (
              <th key={brand.slug} className="text-center px-3 py-3 font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "'Fraunces', serif" }}>
                {brand.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Type */}
          <tr className="border-t border-[var(--border)]">
            <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">Type</td>
            {brands.map((brand) => (
              <td key={brand.slug} className="px-3 py-3 text-center text-xs text-[var(--text-secondary)]">
                {brand.type.join(', ')}
              </td>
            ))}
          </tr>

          {/* Animal */}
          <tr className="border-t border-[var(--border)] bg-[var(--bg-surface-2)]/30">
            <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">Animal</td>
            {brands.map((brand) => (
              <td key={brand.slug} className="px-3 py-3 text-center text-xs">
                {brand.animal.map((a) => (a === 'chien' ? '🐶' : '🐱')).join(' ')}
              </td>
            ))}
          </tr>

          {/* Scores */}
          {Object.entries(criteriaLabels).map(([key, label], i) => (
            <tr key={key} className={`border-t border-[var(--border)] ${i % 2 === 0 ? '' : 'bg-[var(--bg-surface-2)]/30'}`}>
              <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">{label}</td>
              {brands.map((brand) => {
                const score = brand.scores[key as keyof typeof brand.scores]
                return (
                  <td key={brand.slug} className="px-3 py-3 text-center">
                    {key === 'global' ? (
                      <div className="flex justify-center">
                        <StarRating score={score} size={13} />
                      </div>
                    ) : (
                      <span
                        className="font-medium text-[var(--text-primary)]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {score.toFixed(1)}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}

          {/* Prix */}
          <tr className="border-t border-[var(--border)]">
            <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">Prix mensuel</td>
            {brands.map((brand) => (
              <td key={brand.slug} className="px-3 py-3 text-center font-semibold text-[var(--text-primary)]">
                {brand.priceRange}
              </td>
            ))}
          </tr>

          {/* Offre */}
          <tr className="border-t border-[var(--border)] bg-[var(--bg-surface-2)]/30">
            <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">Offre bienvenue</td>
            {brands.map((brand) => (
              <td key={brand.slug} className="px-3 py-3 text-center text-xs font-semibold text-[var(--accent-1)]">
                {brand.discountOffer}
              </td>
            ))}
          </tr>

          {/* CTA */}
          <tr className="border-t-2 border-[var(--border-strong)]">
            <td className="px-4 py-3" />
            {brands.map((brand) => (
              <td key={brand.slug} className="px-3 py-4 text-center">
                <Link
                  href={brand.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="btn-primary text-xs py-2 px-3 inline-block"
                >
                  Essayer →
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
