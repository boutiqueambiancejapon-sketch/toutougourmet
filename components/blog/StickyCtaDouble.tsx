'use client'

import { useState, useEffect } from 'react'

interface CtaBrand {
  label: string
  href: string
}

interface StickyCtaDoubleProps {
  brandA: CtaBrand
  brandB: CtaBrand
  eyebrow?: string
  /** Ligne sous l'eyebrow — affichée uniquement en lg+ pour ne pas surcharger mobile */
  subProof?: string
}

export function StickyCtaDouble({
  brandA,
  brandB,
  eyebrow,
  subProof,
}: StickyCtaDoubleProps) {
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
          'max-w-[720px] mx-auto rounded-[var(--radius-xl)] border shadow-[var(--shadow-xl)] pointer-events-auto transition-all duration-500',
          scrolled
            ? 'backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
            : 'border-[var(--border)]',
        ].join(' ')}
        style={scrolled ? {} : { background: 'var(--bg-dark)' }}
      >
        {/* Header : eyebrow + sub-proof (lg+) + close */}
        <div className="flex items-start gap-3 px-4 pt-3 pb-1">
          {(eyebrow || subProof) && (
            <div className="hidden sm:block flex-1 min-w-0">
              {eyebrow && (
                <p
                  className={`text-sm font-semibold leading-snug transition-colors duration-500 ${
                    scrolled ? 'text-[var(--text-secondary)]' : ''
                  }`}
                  style={scrolled ? {} : { color: 'var(--text-on-dark)' }}
                >
                  {eyebrow}
                </p>
              )}
              {subProof && (
                <p
                  className={`hidden lg:block text-xs leading-snug mt-0.5 transition-colors duration-500`}
                  style={scrolled ? { color: 'var(--text-muted)' } : { color: 'var(--text-muted)', opacity: 0.85 }}
                >
                  {subProof}
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Fermer"
            className={`ml-auto shrink-0 transition-colors text-lg leading-none ${
              scrolled
                ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-on-dark)]'
            }`}
          >
            ✕
          </button>
        </div>

        {/* CTAs — empilés sur mobile, côte à côte sm+ */}
        <div className="flex flex-col sm:flex-row gap-2 px-4 pb-4">
          <a
            href={brandA.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-primary text-sm px-4 py-2.5 text-center flex-1"
          >
            {brandA.label} →
          </a>
          <a
            href={brandB.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-outline text-sm px-4 py-2.5 text-center flex-1"
          >
            {brandB.label} →
          </a>
        </div>
      </div>
    </div>
  )
}
