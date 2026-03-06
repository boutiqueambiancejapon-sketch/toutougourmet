import { Disclosure } from '@/components/ui/Disclosure'

interface BrandCTAProps {
  brandName: string
  affiliateUrl: string
  offer?: string
  code?: string | null
  variant?: 'primary' | 'secondary'
}

export function BrandCTA({
  brandName,
  affiliateUrl,
  offer,
  code,
  variant = 'primary',
}: BrandCTAProps) {
  return (
    <div className="flex flex-col items-center gap-2 h-full">
      <div className="flex-1 flex items-end w-full">
        {offer && (
          <p className="text-sm font-semibold text-center w-full pb-1" style={{ color: 'var(--accent-1)' }}>
            🎉 {offer}
          </p>
        )}
      </div>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`${variant === 'primary' ? 'btn-primary' : 'btn-outline'} w-full text-center`}
      >
        {`Essayer ${brandName} →`}
      </a>
      {code && (
        <p className="text-sm bg-[var(--bg-surface-2)] px-3 py-1 rounded-[var(--radius-md)]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Code : <strong>{code}</strong>
        </p>
      )}
      <Disclosure type="short" />
    </div>
  )
}
