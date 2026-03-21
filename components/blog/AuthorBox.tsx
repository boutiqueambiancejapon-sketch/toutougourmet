import Link from 'next/link'
import type { Author } from '@/data/authors'

interface AuthorBoxProps {
  author: Author
}

// @cdc eeat — auteur signé avec lien vers page auteur
export function AuthorBox({ author }: AuthorBoxProps) {
  return (
    <aside
      className="flex gap-4 items-start mt-10 pt-8 border-t border-[var(--border)]"
      aria-label="À propos de l'auteur"
    >
      {/* Avatar initiales */}
      <div
        className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
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

      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link
            href={author.url}
            className="font-bold text-[var(--text-primary)] hover:text-[var(--accent-1)] transition-colors"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {author.name}
          </Link>
          <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
            {author.title}
          </span>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {author.bio}
        </p>

        <div className="flex flex-wrap gap-2 mt-1">
          {author.pets.map((pet) => (
            <span
              key={pet.name}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-muted)]"
            >
              {pet.name} · {pet.breed}
            </span>
          ))}
        </div>

        <Link
          href={author.url}
          className="text-xs font-semibold text-[var(--accent-1)] hover:underline mt-1 self-start"
        >
          Tous ses articles →
        </Link>
      </div>
    </aside>
  )
}
