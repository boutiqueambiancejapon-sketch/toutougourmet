import Link from 'next/link'
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

// Couleur d'accent par brand (même ordre que brands[])
const brandAccents = ['#1A7A47', '#8B1A4A', '#1A4E8B', '#C47C00']

export function ComparisonTable() {
  const bestGlobal = Math.max(...brands.map((b) => b.scores.global))

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="min-w-full border-collapse text-sm" aria-label="Comparatif des marques">
        <thead>
          {/* Barre d'accent colorée par marque */}
          <tr>
            <td className="bg-[var(--bg-dark)]" />
            {brands.map((brand, i) => (
              <td key={brand.slug} style={{ height: 4, background: brandAccents[i], padding: 0 }} />
            ))}
          </tr>
          <tr className="bg-[var(--bg-dark)]">
            <th className="text-left px-4 py-3 font-semibold w-44" style={{ color: 'var(--text-on-dark)', opacity: 0.5 }}>
              Critère
            </th>
            {brands.map((brand, i) => (
              <th
                key={brand.slug}
                className="text-center px-3 py-3 font-bold"
                style={{ fontFamily: "'Fraunces', serif", color: brandAccents[i] }}
              >
                {brand.name}
                {brand.scores.global === bestGlobal && (
                  <div className="text-[10px] font-normal mt-0.5" style={{ color: 'var(--text-on-dark)', opacity: 0.4 }}>⭐ top pick</div>
                )}
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
          <tr className="border-t border-[var(--border)] bg-[var(--bg-surface-2)]/40">
            <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">Animal</td>
            {brands.map((brand) => (
              <td key={brand.slug} className="px-3 py-3 text-center text-base">
                {brand.animal.map((a) => (a === 'chien' ? '🐶' : '🐱')).join(' ')}
              </td>
            ))}
          </tr>

          {/* Scores */}
          {Object.entries(criteriaLabels).map(([key, label], i) => (
            <tr key={key} className={`border-t border-[var(--border)] ${i % 2 !== 0 ? 'bg-[var(--bg-surface-2)]/40' : ''}`}>
              <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">{label}</td>
              {brands.map((brand, bi) => {
                const score = brand.scores[key as keyof typeof brand.scores]
                const isBest = brands.every((b) => b.scores[key as keyof typeof b.scores] <= score)
                return (
                  <td key={brand.slug} className="px-3 py-3 text-center">
                    {key === 'global' ? (
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="font-black text-base"
                          style={{ fontFamily: "'Fraunces', serif", color: brandAccents[bi] }}
                        >
                          {score.toFixed(1)}
                        </span>
                        <StarRating score={score} size={12} />
                      </div>
                    ) : (
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: isBest ? brandAccents[bi] : 'var(--text-secondary)',
                          fontWeight: isBest ? 700 : 400,
                        }}
                      >
                        {score.toFixed(1)}
                        {isBest && <span className="ml-0.5 text-xs">↑</span>}
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
          <tr className="border-t border-[var(--border)] bg-[var(--bg-surface-2)]/40">
            <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">Offre bienvenue</td>
            {brands.map((brand, i) => (
              <td key={brand.slug} className="px-3 py-3 text-center text-xs font-semibold" style={{ color: brandAccents[i] }}>
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
