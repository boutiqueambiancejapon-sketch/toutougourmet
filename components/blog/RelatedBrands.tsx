import Link from 'next/link'
import { brands } from '@/data/brands'

const BRAND_PILL: Record<string, { pill: string; emoji: string }> = {
  franklin: { pill: 'var(--pill-amber)', emoji: '🔥' },
  elmut: { pill: 'var(--pill-green)', emoji: '🌿' },
  'petty-well': { pill: 'var(--pill-blue)', emoji: '⭐' },
  'dog-chef': { pill: 'var(--pill-rose)', emoji: '👨‍🍳' },
}

/**
 * Sidebar sticky proposée sur les pages article : 3 marques
 * recommandées + CTA quiz. Les marques sont celles du site,
 * triées par note décroissante.
 */
export function RelatedBrands() {
  const top = [...brands]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 3)

  return (
    <aside className="lg:sticky lg:top-[100px] lg:self-start">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-1)] mb-4">
        Recommandées pour ce profil
      </p>
      <ul className="flex flex-col gap-3 m-0 p-0 list-none">
        {top.map((b) => {
          const d = BRAND_PILL[b.slug]
          if (!d) return null
          return (
            <li key={b.slug}>
              <Link
                href={`/marques/${b.slug}`}
                className="group flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:-translate-y-0.5 hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-sm)]"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] text-lg shrink-0"
                  style={{ background: d.pill }}
                >
                  {d.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-black text-[var(--text-primary)] text-sm m-0 leading-tight mb-1"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {b.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-1)]"
                        style={{ width: `${(b.scores.global / 5) * 100}%` }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold text-[var(--accent-1)] shrink-0"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {b.scores.global}
                    </span>
                  </div>
                </div>
                <span aria-hidden="true" className="text-[var(--text-muted)]">
                  →
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 p-5 bg-[var(--bg-dark)] rounded-[var(--radius-xl)] text-[var(--text-on-dark)]">
        <p
          className="m-0 mb-2 text-lg font-black leading-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Pas sûr(e) du bon choix&nbsp;?
        </p>
        <p className="m-0 mb-4 text-sm leading-relaxed" style={{ opacity: 0.75 }}>
          2&nbsp;min de quiz et on te recommande la marque la plus alignée avec ton animal.
        </p>
        <Link
          href="/quiz"
          className="btn-primary text-sm w-full justify-center"
          style={{ padding: '10px 14px' }}
        >
          Faire le quiz →
        </Link>
      </div>
    </aside>
  )
}
