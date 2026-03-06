'use client'

import { useState } from 'react'
import Link from 'next/link'

export function StickyCtaDogChef() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div
        className="max-w-[720px] mx-auto rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-xl)] flex items-center gap-3 sm:gap-4 p-4 pointer-events-auto"
        style={{ background: 'var(--bg-dark)' }}
      >
        {/* Badge promo */}
        <span
          className="shrink-0 text-xs font-black px-2.5 py-1.5 rounded-[var(--radius-md)] whitespace-nowrap"
          style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}
        >
          -35%
        </span>

        {/* Texte */}
        <p className="flex-1 text-sm leading-snug" style={{ color: 'var(--text-on-dark)' }}>
          <span className="font-bold">Dog Chef</span>
          <span className="text-[var(--text-muted)] hidden sm:inline"> — repas frais personnalisés</span>
          {' '}· Code <span className="font-mono font-bold" style={{ color: 'var(--pill-rose)' }}>WZU7090</span>
        </p>

        {/* CTA */}
        <Link
          href="https://www.dogchef.com/fr/code/WZU7090"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="shrink-0 btn-primary text-sm px-4 py-2 whitespace-nowrap"
        >
          J&apos;en profite →
        </Link>

        {/* Fermer */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fermer"
          className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-on-dark)] transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
