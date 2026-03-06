import Link from 'next/link'
import { BrandCTA } from '@/components/marques/BrandCTA'
import { StarRating } from '@/components/ui/StarRating'
import { brands } from '@/data/brands'
import { brandSlugMap, brandLabels, type BrandKey } from '@/lib/quiz'

interface QuizResultProps {
  sortedBrands: BrandKey[]
}

export function QuizResult({ sortedBrands }: QuizResultProps) {
  const [recommended, ...alternatives] = sortedBrands.slice(0, 3)
  const recommendedBrand = brands.find((b) => b.slug === brandSlugMap[recommended])
  const altBrands = alternatives.map((k) => brands.find((b) => b.slug === brandSlugMap[k])).filter(Boolean)

  if (!recommendedBrand) return null

  return (
    <div className="flex flex-col gap-8">
      {/* Recommandation principale */}
      <div className="bg-[var(--bg-surface)] border-2 border-[var(--accent-1)] rounded-[var(--radius-xl)] p-6 md:p-8">
        <div className="text-center mb-6">
          <p className="text-sm font-semibold text-[var(--accent-3)] uppercase tracking-wider mb-1">
            ✅ Notre recommandation pour toi
          </p>
          <h2 className="text-3xl font-black" style={{ fontFamily: "'Fraunces', serif" }}>
            {recommendedBrand.name}
          </h2>
          <p className="text-[var(--text-secondary)] mt-1">{recommendedBrand.tagline}</p>
          <div className="flex justify-center mt-2">
            <StarRating score={recommendedBrand.scores.global} size={20} />
          </div>
        </div>

        <div className="mb-6">
          <BrandCTA
            brandName={recommendedBrand.name}
            affiliateUrl={recommendedBrand.affiliateUrl}
            offer={recommendedBrand.discountOffer}
            code={recommendedBrand.affiliateCode}
            variant="primary"
          />
        </div>

        <Link
          href={`/marques/${recommendedBrand.slug}`}
          className="block text-center text-sm text-[var(--accent-1)] hover:underline"
        >
          Voir notre avis complet sur {recommendedBrand.name} →
        </Link>
      </div>

      {/* Alternatives */}
      {altBrands.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 text-[var(--text-secondary)]" style={{ fontFamily: "'Fraunces', serif" }}>
            Et aussi...
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {altBrands.map((brand) => brand && (
              <div key={brand.slug} className="card p-4 flex flex-col gap-2">
                <p className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {brand.name}
                </p>
                <StarRating score={brand.scores.global} size={14} />
                <p className="text-sm text-[var(--text-secondary)]">{brand.discountOffer}</p>
                <div className="flex gap-2 mt-1">
                  <Link
                    href={brand.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="btn-outline text-sm py-1.5 flex-1 text-center"
                  >
                    Essayer →
                  </Link>
                  <Link
                    href={`/marques/${brand.slug}`}
                    className="text-sm font-medium text-[var(--accent-1)] self-center"
                  >
                    Avis →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link href="/comparateur" className="btn-ghost text-sm">
          Voir le comparateur complet →
        </Link>
      </div>
    </div>
  )
}
