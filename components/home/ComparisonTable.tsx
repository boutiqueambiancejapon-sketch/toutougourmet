'use client'

import { useState } from 'react'
import Link from 'next/link'
import { brands, type Brand } from '@/data/brands'
import { BRAND_DISPLAY } from './comparison-table-config'
import { ROWS } from './comparison-table-rows'

type SortKey = 'score' | 'price' | 'default'

function sortBrands(list: readonly Brand[], by: SortKey): Brand[] {
  const arr = [...list]
  if (by === 'score') return arr.sort((a, b) => b.scores.global - a.scores.global)
  if (by === 'price') return arr.sort((a, b) => a.priceRange.length - b.priceRange.length)
  return arr
}

function SortButtons({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const options: Array<[SortKey, string]> = [['score', 'Note'], ['price', 'Prix'], ['default', 'Par défaut']]
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Trier :</span>
      {options.map(([k, l]) => {
        const active = value === k
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className="text-sm font-semibold px-3.5 py-1.5 rounded-full border-2 cursor-pointer transition-colors"
            style={{
              borderColor: active ? 'var(--text-primary)' : 'var(--border)',
              background: active ? 'var(--text-primary)' : 'var(--bg-surface)',
              color: active ? 'var(--text-on-dark)' : 'var(--text-secondary)',
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}

function HeaderCell({ brand }: { brand: Brand }) {
  const d = BRAND_DISPLAY[brand.slug]
  return (
    <div
      className="px-4 py-4 border-l border-[var(--border)] border-b relative"
      style={{ background: d?.featured ? 'rgba(232,98,42,0.04)' : 'var(--bg-surface)' }}
    >
      {d?.featured && (
        <span className="absolute -top-px left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-b-[var(--radius-sm)] bg-[var(--accent-1)] text-white">
          Top
        </span>
      )}
      <div className="flex items-center gap-2.5" style={{ marginTop: d?.featured ? 8 : 0 }}>
        <span className="text-xl">{d?.emoji}</span>
        <div>
          <p className="font-black text-[var(--text-primary)] m-0 text-base leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            {brand.name}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{d?.typeLabel}</p>
        </div>
      </div>
    </div>
  )
}

export function ComparisonTable() {
  const [sortBy, setSortBy] = useState<SortKey>('score')
  const sorted = sortBrands(brands, sortBy)

  return (
    <section id="comparatif" className="py-24 px-6 md:px-10 bg-[var(--bg-surface-2)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2.5">Le comparateur</p>
            <h2 className="section-title m-0">
              Tout sur la table.<br />
              <span className="inline-block px-3.5 pb-1.5 rounded-[var(--radius-md)]" style={{ background: 'var(--pill-rose)', lineHeight: 1 }}>
                Comparées en 10&nbsp;s.
              </span>
            </h2>
          </div>
          <SortButtons value={sortBy} onChange={setSortBy} />
        </div>

        <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border)] overflow-x-auto shadow-[var(--shadow-md)]">
          <div className="grid min-w-[860px]" style={{ gridTemplateColumns: '200px repeat(4, 1fr)' }}>
            <div className="px-5 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-primary)] border-b border-[var(--border)]">
              Critère
            </div>
            {sorted.map((b) => <HeaderCell key={b.slug} brand={b} />)}

            {ROWS.map((row) => (
              <div key={row.key} className="contents">
                <div className="px-5 py-3.5 text-sm font-semibold text-[var(--text-secondary)] bg-[var(--bg-primary)] border-b border-[var(--border)] flex items-center">
                  {row.label}
                </div>
                {sorted.map((b) => {
                  const d = BRAND_DISPLAY[b.slug]
                  return (
                    <div
                      key={`${row.key}-${b.slug}`}
                      className="px-4 py-3.5 border-l border-[var(--border)] border-b text-sm text-[var(--text-primary)] flex items-center"
                      style={{ background: d?.featured ? 'rgba(232,98,42,0.04)' : undefined }}
                    >
                      {row.render(b)}
                    </div>
                  )
                })}
              </div>
            ))}

            <div className="px-5 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-primary)]">
              Action
            </div>
            {sorted.map((b) => (
              <div key={`cta-${b.slug}`} className="px-4 py-4 border-l border-[var(--border)] bg-[var(--bg-primary)]">
                <Link href={`/marques/${b.slug}`} className="btn-primary text-sm w-full justify-center" style={{ padding: '8px 14px' }}>
                  Voir la fiche →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
