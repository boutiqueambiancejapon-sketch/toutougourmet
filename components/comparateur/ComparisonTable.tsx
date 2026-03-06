import Link from 'next/link'
import { brands } from '@/data/brands'

const criteriaLabels: Record<string, string> = {
  qualiteIngredients: 'Qualité ingrédients',
  rapportQualitePrix: 'Rapport qualité/prix',
  digestibilite: 'Digestibilité',
  variantesDisponibles: 'Variantes dispo',
  serviceClient: 'Service client',
}

export const brandAccents = ['#1A7A47', '#8B1A4A', '#1A4E8B', '#C47C00']
const brandBgs    = ['#C2F0D5', '#FFD6E3', '#C8DCFF', '#FFE8B5']

function ScoreBar({ score, accent, muted }: { score: number; accent: string; muted: boolean }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${(score / 5) * 100}%`, background: muted ? 'var(--border-strong)' : accent }}
        />
      </div>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{ color: muted ? 'var(--text-muted)' : accent }}
      >
        {score.toFixed(1)}
      </span>
    </div>
  )
}

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm" aria-label="Comparatif des marques">
        <thead>
          <tr style={{ background: 'var(--bg-surface-2)' }}>
            <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide w-44 border-b"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
              Critère
            </th>
            {brands.map((brand, i) => (
              <th
                key={brand.slug}
                className="px-4 pt-0 pb-4 text-center border-b"
                style={{ borderColor: 'var(--border)', borderTop: `3px solid ${brandAccents[i]}` }}
              >
                <div
                  className="font-black text-base leading-tight mt-3"
                  style={{ fontFamily: "'Fraunces', serif", color: brandAccents[i] }}
                >
                  {brand.name}
                </div>
                <div className="text-[11px] leading-snug mt-1 font-normal max-w-[140px] mx-auto"
                  style={{ color: 'var(--text-muted)' }}>
                  {brand.tagline}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Note globale — row mise en valeur */}
          <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <td className="px-5 py-4 text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              Note globale
            </td>
            {brands.map((brand, i) => (
              <td key={brand.slug} className="px-4 py-4 text-center">
                <span
                  className="font-black leading-none"
                  style={{ fontFamily: "'Fraunces', serif", color: brandAccents[i], fontSize: '2rem' }}
                >
                  {brand.scores.global.toFixed(1)}
                </span>
                <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>/5</span>
              </td>
            ))}
          </tr>

          {/* Pour quel animal */}
          <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
            <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Pour</td>
            {brands.map((brand) => (
              <td key={brand.slug} className="px-4 py-3 text-center">
                <div className="text-base">{brand.animal.map((a) => (a === 'chien' ? '🐶' : '🐱')).join(' ')}</div>
                <div className="text-[11px] capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {brand.animal.join(' & ')}
                </div>
              </td>
            ))}
          </tr>

          {/* Type */}
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Type</td>
            {brands.map((brand) => (
              <td key={brand.slug} className="px-4 py-3 text-center text-xs"
                style={{ color: 'var(--text-secondary)' }}>
                {brand.type.join(', ')}
              </td>
            ))}
          </tr>

          {/* Critères avec barre */}
          {(Object.keys(criteriaLabels) as (keyof typeof criteriaLabels)[]).map((key, i) => (
            <tr
              key={key}
              className="border-b"
              style={{ borderColor: 'var(--border)', background: i % 2 !== 0 ? 'var(--bg-surface-2)' : undefined }}
            >
              <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {criteriaLabels[key]}
              </td>
              {brands.map((brand, bi) => {
                const score = brand.scores[key]
                const isBest = brands.every((b) => b.scores[key] <= score)
                return (
                  <td key={brand.slug} className="px-4 py-3">
                    <ScoreBar score={score} accent={brandAccents[bi]} muted={!isBest} />
                  </td>
                )
              })}
            </tr>
          ))}

          {/* Prix */}
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Prix mensuel</td>
            {brands.map((brand, i) => (
              <td key={brand.slug} className="px-4 py-3 text-center">
                <span className="font-black text-xl" style={{ fontFamily: "'Fraunces', serif", color: brandAccents[i] }}>
                  {brand.priceRange}
                </span>
              </td>
            ))}
          </tr>

          {/* Offre */}
          <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
            <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Offre bienvenue</td>
            {brands.map((brand, i) => (
              <td key={brand.slug} className="px-4 py-3 text-center">
                <span
                  className="inline-block text-[11px] font-bold px-2 py-1 rounded-full leading-snug"
                  style={{ background: brandBgs[i], color: brandAccents[i] }}
                >
                  {brand.discountOffer}
                </span>
              </td>
            ))}
          </tr>

          {/* Points forts */}
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            <td className="px-5 py-4 font-medium align-top" style={{ color: 'var(--text-secondary)' }}>
              Points forts
            </td>
            {brands.map((brand, i) => (
              <td key={brand.slug} className="px-4 py-4 align-top">
                <ul className="space-y-1.5">
                  {brand.pros.slice(0, 3).map((pro, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-bold mt-px shrink-0" style={{ color: brandAccents[i] }}>✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>

          {/* CTA */}
          <tr>
            <td className="px-5 py-4" />
            {brands.map((brand) => (
              <td key={brand.slug} className="px-4 py-4 text-center">
                <Link
                  href={brand.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="btn-primary text-xs py-2 px-4 inline-block"
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
