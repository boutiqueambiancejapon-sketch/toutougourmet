'use client'

import { useEffect, useState } from 'react'

interface BrandInfo {
  name: string
  affiliateUrl: string
  offer: string
  code?: string | null
}

interface StickyComparatifCTAProps {
  brandA: BrandInfo
  brandB: BrandInfo
}

export function StickyComparatifCTA({ brandA, brandB }: StickyComparatifCTAProps) {
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
        <div className="max-w-[860px] mx-auto px-4 py-3 grid grid-cols-2 gap-3">
          {[brandA, brandB].map((brand) => (
            <div key={brand.name} className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--accent-1)] text-center leading-tight hidden sm:block">
                {brand.offer}
              </span>
              <a
                href={brand.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-primary text-sm whitespace-nowrap w-full text-center"
              >
                Essayer {brand.name} →
              </a>
              {brand.code && (
                <span
                  className="hidden sm:block text-xs px-2 py-0.5 rounded-[var(--radius-md)]"
                  style={{ background: 'var(--bg-surface-2)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Code : {brand.code}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
