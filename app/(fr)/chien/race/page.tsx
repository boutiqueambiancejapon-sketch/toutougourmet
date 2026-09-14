import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesByCategory } from '@/lib/mdx'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Alimentation par race de chien — guides nutritionnels',
  description:
    'Labrador, Golden Retriever, Berger Allemand, Bouledogue Français… Trouvez les conseils nutritionnels adaptés à la race de votre chien.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien/race' },
}

// @cdc §3 — catégorie race, route statique prioritaire sur [category]
function extractBreedName(title: string): string {
  return title
    .replace(/^Quelle nourriture pour (un|une) /i, '')
    .replace(/ \?$/, '')
    .trim()
}

export default function RaceHubPage() {
  const articles = getArticlesByCategory('race')

  const breeds = articles
    .map((a) => ({
      slug: a.slug,
      name: extractBreedName(a.frontmatter.title),
      description: a.frontmatter.description,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

  // Grouper par première lettre
  const groups = new Map<string, typeof breeds>()
  for (const breed of breeds) {
    const letter = breed.name[0].toUpperCase()
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter)!.push(breed)
  }
  const letters = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b, 'fr'))

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Chien', href: '/chien' },
            { label: 'Alimentation par race' },
          ]}
        />

        <div className="mb-10 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            🐕 Alimentation par race
          </p>
          <h1 className="page-title mb-3">
            Quelle nourriture selon la race de votre chien ?
          </h1>
          <p className="text-[var(--text-secondary)]">
            Chaque race a des besoins nutritionnels spécifiques liés à sa morphologie, ses
            prédispositions santé et son niveau d&apos;énergie.{' '}
            {breeds.length} races référencées — trouvez le guide adapté à votre chien.
          </p>
        </div>

        {/* Index alphabétique */}
        <nav aria-label="Index alphabétique des races" className="mb-12">
          <div className="flex flex-wrap gap-2">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#lettre-${letter}`}
                className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--accent-1)] hover:text-white hover:border-[var(--accent-1)] transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections par lettre */}
        <div className="space-y-14">
          {letters.map((letter) => (
            <section
              key={letter}
              id={`lettre-${letter}`}
              style={{ scrollMarginTop: '80px' }}
            >
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 pb-3 border-b border-[var(--border)]">
                {letter}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.get(letter)!.map((breed) => (
                  <Link
                    key={breed.slug}
                    href={`/chien/race/${breed.slug}`}
                    className="group bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 hover:border-[var(--accent-1)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all"
                  >
                    <p className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors mb-2">
                      {breed.name}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                      {breed.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
