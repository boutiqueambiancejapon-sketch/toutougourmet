import type { Metadata } from 'next'
import Link from 'next/link'
import { brands } from '@/data/brands'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Comparatifs marques — Tous les X vs Y de pet food premium',
  description:
    "Dog Chef vs Elmut, Franklin vs Petty Well... Tous nos comparatifs détaillés pour choisir la meilleure alimentation pour ton chien.",
  alternates: { canonical: 'https://toutougourmet.fr/chien/marque/comparatif' },
}

export default function ComparatifHubPage() {
  const comparisons: { slug: string; label: string; a: string; b: string }[] = []
  for (let i = 0; i < brands.length; i++) {
    for (let j = i + 1; j < brands.length; j++) {
      comparisons.push({
        slug: `${brands[i].slug}-vs-${brands[j].slug}`,
        label: `${brands[i].name} vs ${brands[j].name}`,
        a: brands[i].name,
        b: brands[j].name,
      })
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[860px] mx-auto">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Chien', href: '/chien' },
          { label: 'Marques', href: '/chien/marque' },
          { label: 'Comparatifs' },
        ]} />

        <div className="mb-10 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            Comparatifs
          </p>
          <h1 className="page-title mb-3">
            X vs Y — Tous les comparatifs
          </h1>
          <p className="text-[var(--text-secondary)]">
            Chaque comparatif met en face deux marques sur les mêmes critères. Scores détaillés, avantages, verdict final.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {comparisons.map(({ slug, label, a, b }) => (
            <Link
              key={slug}
              href={`/chien/marque/${slug}`}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 flex flex-col gap-2 hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-md)] transition-all group"
            >
              <p className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors">
                {label}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {a} face à {b} — comparatif complet
              </p>
              <span className="text-sm text-[var(--accent-1)] mt-1">Lire le comparatif →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
