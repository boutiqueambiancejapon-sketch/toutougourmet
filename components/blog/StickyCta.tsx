'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { StickyCtaConfig } from '@/lib/sticky-cta-config'

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
        {/* Badge */}
        {config.badge && (
          <span
            className="shrink-0 text-xs font-black px-2.5 py-1.5 rounded-[var(--radius-md)] whitespace-nowrap"
            style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}
          >
            {config.badge}
          </span>
        )}

        {/* Texte */}
        <p
          className={[
            'flex-1 text-sm leading-snug transition-colors duration-500',
            scrolled ? 'text-[var(--text-primary)]' : '',
          ].join(' ')}
          style={scrolled ? {} : { color: 'var(--text-on-dark)' }}
        >
          <span className="font-bold">{config.brandName}</span>
          <span className={`hidden sm:inline ${scrolled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
            {' '}— {config.label}
          </span>
          {config.code && (
            <>
              {' '}· Code{' '}
              <span
                className={`font-mono font-bold transition-colors duration-500 ${scrolled ? 'text-rose-600' : ''}`}
                style={scrolled ? {} : { color: 'var(--pill-rose)' }}
              >
                {config.code}
              </span>
            </>
          )}
        </p>

        {/* CTA */}
        <Link
          href={config.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="shrink-0 btn-primary text-sm px-4 py-2 whitespace-nowrap"
        >
          {config.code ? 'J\'en profite →' : 'Acheter →'}
        </Link>

        {/* Fermer */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fermer"
          className={`shrink-0 transition-colors text-lg leading-none ${scrolled ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-on-dark)]'}`}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
