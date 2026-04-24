import Link from 'next/link'

interface BlogHeroProps {
  articleCount: number
}

export function BlogHero({ articleCount }: BlogHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)]">
      <div
        aria-hidden="true"
        className="absolute -top-16 right-[10%] w-[320px] h-[320px] rounded-full opacity-35 blur-3xl pointer-events-none"
        style={{ background: 'var(--pill-rose)' }}
      />
      <div
        aria-hidden="true"
        className="absolute top-10 -left-16 w-[260px] h-[260px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'var(--pill-blue)' }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 pt-20 pb-10">
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-muted)] mb-5"
        >
          <Link href="/" className="hover:text-[var(--text-primary)]">
            Accueil
          </Link>
          <span aria-hidden="true" className="opacity-50">
            ›
          </span>
          <span className="text-[var(--text-secondary)]">Blog</span>
        </nav>

        <span
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] mb-5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
          <span
            className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Le blog · {articleCount} articles
          </span>
        </span>

        <h1
          className="mb-5 text-[var(--text-primary)] max-w-[900px]"
          style={{
            fontFamily: "'Fraunces', serif",
            textWrap: 'balance',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          On écrit.{' '}
          <span
            className="inline-block px-4 pb-1.5 rounded-[var(--radius-lg)] align-baseline"
            style={{ background: 'var(--pill-rose)', lineHeight: 1 }}
          >
            Tu apprends.
          </span>
          <br />
          Personne ne paie pour ça.
        </h1>

        <p className="text-lg max-w-[680px] leading-relaxed text-[var(--text-secondary)] m-0">
          Nutrition, santé, comportement, enquêtes. Des guides qu&rsquo;on écrit
          nous-mêmes, sans sponsoring ni langue de bois. Tu cherches ? Utilise
          la recherche et les filtres ci-dessous.
        </p>
      </div>
    </section>
  )
}
