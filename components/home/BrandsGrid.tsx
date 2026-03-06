import { BrandCard } from '@/components/marques/BrandCard'
import { brands } from '@/data/brands'

export function BrandsGrid() {
  return (
    <section className="py-16 px-4 bg-[var(--bg-surface-2)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <h2 style={{ fontFamily: "'Fraunces', serif" }}>Les 4 marques qu&apos;on recommande</h2>
          <p className="text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">
            Sélection rigoureuse. Indépendance totale. On te dit ce qu&apos;on pense vraiment.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {brands.map((brand) => (
            <BrandCard key={brand.slug} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  )
}
