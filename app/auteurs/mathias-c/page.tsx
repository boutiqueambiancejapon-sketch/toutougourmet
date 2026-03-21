import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/mdx'
import { getAuthorBySlug } from '@/data/authors'
import { BlogFilter } from '@/components/blog/BlogFilter'
import { notFound } from 'next/navigation'

const AUTHOR_SLUG = 'mathias-c'

export const metadata: Metadata = {
  title: 'Mathias C. — Auteur Toutou Gourmet',
  description:
    "Propriétaire de Charlie (CKC, insuffisance rénale), Oxy (CKC, calculs rénaux) et Milo (Shiba Inu). Mathias écrit sur l'alimentation canine depuis ses expériences terrain avec ses trois chiens.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/auteurs/mathias-c' },
}

export default function AutheurMathiasPage() {
  const author = getAuthorBySlug(AUTHOR_SLUG)
  if (!author) return notFound()

  const articles = getAllArticles()

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `https://www.toutou-gourmet.com${author.url}`,
    description: author.bioLong,
    worksFor: {
      '@type': 'Organization',
      name: 'Toutou Gourmet',
      url: 'https://www.toutou-gourmet.com',
    },
    knowsAbout: author.knowsAbout,
    ...(author.linkedin ? { sameAs: [author.linkedin] } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="min-h-screen py-10 px-6 md:px-10 bg-[var(--bg-primary)]">

        {/* Hero — largeur article */}
        <div className="max-w-[720px] mx-auto mb-12">

          {/* Breadcrumb */}
          <nav className="text-sm text-[var(--text-muted)] mb-8" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:underline">Accueil</Link>
            <span className="mx-2" aria-hidden="true">›</span>
            <Link href="/blog" className="hover:underline">Blog</Link>
            <span className="mx-2" aria-hidden="true">›</span>
            <span>{author.name}</span>
          </nav>

          {/* Hero auteur */}
          <header>
            <div className="flex gap-5 items-center mb-6">
              {/* Avatar */}
              <div
                className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'var(--accent-1)' }}
                aria-hidden="true"
              >
                {author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h1 className="page-title leading-tight">{author.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)]">
                    {author.title}
                  </p>
                  {author.linkedin && (
                    <Link
                      href={author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent-1)] transition-colors"
                      aria-label="Profil LinkedIn de Mathias C."
                    >
                      LinkedIn →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-6">
              {author.bioLong}
            </p>

            {/* Ses chiens */}
            <section aria-label="Ses chiens">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
                Ses chiens
              </p>
              <div className="flex flex-col gap-3">
                {author.pets.map((pet) => (
                  <div
                    key={pet.name}
                    className="flex items-start gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] px-4 py-3"
                  >
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: 'var(--accent-1)' }}
                      aria-hidden="true"
                    >
                      {pet.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">
                        {pet.name}{' '}
                        <span className="font-normal text-[var(--text-muted)]">
                          · {pet.breed} · {pet.age} ans
                        </span>
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{pet.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </header>
        </div>

        {/* Grille articles — pleine largeur */}
        <div className="max-w-[1280px] mx-auto">
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6">
              {articles.length} article{articles.length > 1 ? 's' : ''} publiés
            </p>
            <BlogFilter articles={articles} />
          </section>
        </div>

      </div>
    </>
  )
}
