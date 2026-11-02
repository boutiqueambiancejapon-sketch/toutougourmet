import type { Metadata } from 'next'
import Link from 'next/link'
import { getDuelPairs } from '@/data/brands'
import { getComparatif } from '@/lib/mdx'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Comparatif croquettes pour chien',
  description:
    "Dog Chef vs Elmut, Franklin vs Ultra Premium Direct : tous nos comparatifs marque contre marque, scores détaillés et verdict.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien/marque/comparatif' },
}

export default function ComparatifHubPage() {
  const comparisons = getDuelPairs().map(([a, b]) => ({
    slug: `${a.slug}-vs-${b.slug}`,
    label: `${a.name} vs ${b.name}`,
    a: a.name,
    b: b.name,
  }))

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[860px] mx-auto">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Guides', href: '/chien' },
          { label: 'Marques', href: '/chien/marque' },
          { label: 'Comparatifs' },
        ]} />

        <div className="mb-10 max-w-[640px]">
          <h1 className="page-title mb-3">
            X vs Y — Tous les comparatifs
          </h1>
          <p className="text-[var(--text-secondary)]">
            Chaque comparatif met en face deux marques sur les mêmes critères. Scores détaillés, avantages, verdict final.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {comparisons.map(({ slug, label, a, b }) => {
            const hasEditorial = !!getComparatif(slug)
            return (
              <Link
                key={slug}
                href={`/chien/marque/${slug}`}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 flex flex-col gap-2 hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-md)] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors flex-1">
                    {label}
                  </p>
                  {hasEditorial && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'var(--pill-green)', color: 'var(--green-ink)' }}>
                      Article complet
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {a} face à {b} — comparatif {hasEditorial ? 'éditorial' : 'automatique'}
                </p>
                <span className="text-sm text-[var(--accent-1)] mt-1">Lire le comparatif →</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
