import Link from 'next/link'
import { DEFAULT_AUTHOR } from '@/data/authors'

export function AuthorsBlock() {
  const author = DEFAULT_AUTHOR
  const initial = author.name.charAt(0)

  return (
    <section className="py-16 px-6 md:px-10 bg-[var(--bg-surface-2)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2.5">
              Qui écrit ici
            </p>
            <h2 className="section-title m-0">
              Un humain,{' '}
              <span style={{ color: 'var(--accent-1)' }}>trois chiens</span>,<br />
              zéro pige à 20&nbsp;€.
            </h2>
          </div>
          <p className="text-[var(--text-secondary)] max-w-sm text-base leading-relaxed m-0">
            Tout est rédigé à la main, recoupé contre la littérature vétérinaire. Pas d&rsquo;IA qui ponde du vide, pas de contenu acheté au kilo.
          </p>
        </div>

        <article className="flex flex-col md:flex-row gap-6 items-start bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-2xl)] p-6 md:p-8">
          <span
            aria-hidden="true"
            className="w-20 h-20 rounded-full bg-[var(--pill-rose)] inline-flex items-center justify-center text-3xl font-black text-[var(--text-primary)] shrink-0"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {initial}
          </span>
          <div className="flex-1 min-w-0">
            <p
              className="font-black text-[var(--text-primary)] text-xl m-0 mb-1"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {author.name}
            </p>
            <p
              className="text-xs font-bold uppercase tracking-widest text-[var(--accent-1)] m-0 mb-3"
            >
              {author.title}
              {author.pets.length > 0 && (
                <>
                  {' · '}
                  <span
                    className="text-[var(--text-muted)]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {author.pets.length} chien{author.pets.length > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </p>
            <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed m-0 mb-4">
              {author.bio}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={author.url}
                className="text-sm font-bold text-[var(--accent-1)] hover:underline"
              >
                Sa page auteur →
              </Link>
              {author.linkedin && (
                <Link
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-1)]"
                >
                  LinkedIn →
                </Link>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
