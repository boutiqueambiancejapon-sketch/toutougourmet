'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface StickyCtaConfig {
  /** Marque ou titre principal (affiché toujours, mobile inclus) */
  brandName: string
  /** Destination — peut être URL externe (https://) ou route interne (/outils/...) */
  url: string
  /** Phrase d'accroche affichée à partir de sm+ — garde < 60 chars */
  label: string
  /** Pastille promo (ex. "-35%") — affichée si présente, mobile inclus */
  badge?: string
  /** Code promo affiché inline après le label (sm+) */
  code?: string
  /** Ligne preuve sociale — affichée UNIQUEMENT en lg+ pour préserver le mobile */
  socialProof?: string
  /** Override du libellé du bouton — défaut: "J'en profite →" si code, "Acheter →" sinon */
  buttonLabel?: string
}

interface StickyCtaProps {
  config: StickyCtaConfig
}

export function StickyCta({ config }: StickyCtaProps) {
  const [dismissed, setDismissed] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (dismissed) return null

  // Internal route (/...) → no target=_blank, no sponsored rel
  const isInternal = config.url.startsWith('/')
  const buttonLabel =
    config.buttonLabel ?? (config.code ? 'J\'en profite →' : 'Acheter →')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div
        className={[
          'max-w-[720px] mx-auto rounded-[var(--radius-xl)] border shadow-[var(--shadow-xl)] flex items-center gap-3 sm:gap-4 p-4 pointer-events-auto transition-all duration-500',
          scrolled
            ? 'backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
            : 'border-[var(--border)]',
        ].join(' ')}
        style={scrolled ? {} : { background: 'var(--bg-dark)' }}
      >
        {/* Badge promo (visible mobile inclus) */}
        {config.badge && (
          <span
            className="shrink-0 text-xs font-black px-2.5 py-1.5 rounded-[var(--radius-md)] whitespace-nowrap"
            style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}
          >
            {config.badge}
          </span>
        )}

        {/* Bloc texte — flex-col pour empiler ligne principale + social proof (lg+) */}
        <div className="flex-1 min-w-0">
          <p
            className={[
              'text-sm leading-snug transition-colors duration-500',
              scrolled ? 'text-[var(--text-primary)]' : '',
            ].join(' ')}
            style={scrolled ? {} : { color: 'var(--text-on-dark)' }}
          >
            <span className="font-bold">{config.brandName}</span>
            <span
              className={`hidden sm:inline ${
                scrolled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {' '}— {config.label}
            </span>
            {config.code && (
              <>
                {' '}· Code{' '}
                <span
                  className={`font-mono font-bold transition-colors duration-500 ${
                    scrolled ? 'text-rose-600' : ''
                  }`}
                  style={scrolled ? {} : { color: 'var(--pill-rose)' }}
                >
                  {config.code}
                </span>
              </>
            )}
          </p>

          {/* Social proof — lg+ uniquement, pour ne pas surcharger mobile/tablet */}
          {config.socialProof && (
            <p
              className={`hidden lg:block text-xs leading-snug mt-0.5 transition-colors duration-500 ${
                scrolled ? 'text-[var(--text-muted)]' : ''
              }`}
              style={scrolled ? {} : { color: 'var(--text-muted)', opacity: 0.85 }}
            >
              {config.socialProof}
            </p>
          )}
        </div>

        {/* CTA bouton */}
        <Link
          href={config.url}
          target={isInternal ? undefined : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer sponsored'}
          className="shrink-0 btn-primary text-sm px-4 py-2 whitespace-nowrap"
        >
          {buttonLabel}
        </Link>

        {/* Fermer */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fermer"
          className={`shrink-0 transition-colors text-lg leading-none ${
            scrolled
              ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-on-dark)]'
          }`}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
