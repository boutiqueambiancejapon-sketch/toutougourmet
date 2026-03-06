'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  q: string
  a: string
}

interface FAQProps {
  items: FAQItem[]
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden"
        >
          <button
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span>{item.q}</span>
            <ChevronDown
              size={18}
              className={cn('shrink-0 text-[var(--text-muted)] transition-transform', openIndex === i && 'rotate-180')}
            />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)]">
              <p className="pt-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
