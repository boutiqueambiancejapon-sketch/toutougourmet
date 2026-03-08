import Link from 'next/link'

interface BrandSlot {
  name: string
  affiliateUrl: string
  offer?: string
  code?: string | null
}

interface DualBrandCTAProps {
  brandA: BrandSlot
  brandB: BrandSlot
}

export function DualBrandCTA({ brandA, brandB }: DualBrandCTAProps) {
  return (
    <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] mb-8">
      <div className="grid grid-cols-2 gap-3 mb-2">
        {[brandA, brandB].map((brand) => (
          <div key={brand.name} className="flex flex-col items-center gap-1.5">
            <a
              href={brand.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-primary w-full text-center text-sm py-2.5 px-3"
            >
              {`Essayer ${brand.name} →`}
            </a>
            {brand.offer && (
              <p className="text-xs font-semibold text-center" style={{ color: 'var(--accent-1)' }}>
                🎉 {brand.offer}
              </p>
            )}
            {brand.code && (
              <p
                className="text-xs bg-[var(--bg-surface-2)] px-2 py-0.5 rounded-[var(--radius-md)]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Code : <strong>{brand.code}</strong>
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-[var(--text-muted)] mt-2">
        🔗 Lien affilié — on perçoit une commission si tu commandes, sans impact sur le prix que tu paies.{' '}
        <Link href="/a-propos#affiliation" className="underline hover:text-[var(--accent-1)]">
          En savoir plus
        </Link>
      </p>
    </div>
  )
}
