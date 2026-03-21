import { Disclosure } from '@/components/ui/Disclosure'

interface BrandCTAProps {
  brandName: string
  affiliateUrl: string
  offer?: string
  code?: string | null
  variant?: 'primary' | 'secondary'
  /** Verbe du bouton — défaut "Essayer" pour les abonnements, "Acheter" pour les boutiques */
  cta?: string
  /** Masque le disclaimer affilié — utiliser sur le 1er CTA d'une paire pour n'afficher qu'un seul disclaimer */
  hideDisclosure?: boolean
}

export function BrandCTA({
  brandName,
  affiliateUrl,
  offer,
  code,
  variant = 'primary',
  cta = 'Essayer',
  hideDisclosure = false,
}: BrandCTAProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {offer && (
        <p className="text-sm font-semibold text-center w-full" style={{ color: 'var(--accent-1)' }}>
          {offer}
        </p>
      )}
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`${variant === 'primary' ? 'btn-primary' : 'btn-outline'} w-full text-center`}
        style={variant === 'primary' ? { color: 'var(--bg-dark)' } : undefined}
      >
        {`${cta} ${brandName} →`}
      </a>
      {code && (
        <p className="text-sm bg-[var(--bg-surface-2)] px-3 py-1 rounded-[var(--radius-md)]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Code : <strong>{code}</strong>
        </p>
      )}
      {!hideDisclosure && <Disclosure type="short" />}
    </div>
  )
}
