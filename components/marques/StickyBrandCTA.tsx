'use client'

import { useEffect, useState } from 'react'

interface StickyBrandCTAProps {
  brandName: string
  affiliateUrl: string
  offer: string
  code?: string | null
}

export function StickyBrandCTA({ brandName, affiliateUrl, offer, code }: StickyBrandCTAProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
    >
      <div
        className="border-t"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-[860px] mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-[var(--text-primary)] truncate">{brandName}</span>
            <span className="text-xs text-[var(--accent-1)] font-semibold">{offer}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {code && (
              <span
                className="hidden sm:block text-xs px-2.5 py-1 rounded-[var(--radius-md)]"
                style={{ background: 'var(--bg-surface-2)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {code}
              </span>
            )}
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-primary text-sm whitespace-nowrap"
            >
              Essayer {brandName} →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
