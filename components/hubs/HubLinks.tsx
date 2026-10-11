import Link from 'next/link'
import type { Article } from '@/lib/mdx'
import { getPublishedCollections } from '@/lib/collections'

// @cdc seo — liens remontants vers les hubs : un article renvoie vers chaque hub
// publié qui le liste (dossier dédié ou section), /chien expose les hubs profil.

export function ArticleHubLinks({ article, allArticles }: { article: Article; allArticles: Article[] }) {
  const hubs = getPublishedCollections(allArticles).filter(
    (h) => h.dedicated.some((a) => a.slug === article.slug) || h.mentions.some((m) => m.article.slug === article.slug),
  )
  if (hubs.length === 0) return null
  return (
    <aside aria-label="Dossiers liés" className="mt-8 p-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-surface)]">
      <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">Dans le même dossier</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {hubs.map((h) => (
          <li key={h.collection.slug}>
            <Link href={`/chien/${h.collection.slug}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-1)]">
              {h.collection.h1} →
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export function HubsOverview({ all }: { all: Article[] }) {
  const profils = getPublishedCollections(all, 'profil')
  const themes = getPublishedCollections(all, 'theme')
  const groups = [
    { id: 'par-profil', title: "Quel guide selon l'âge et l'activité de son chien ?", hubs: profils },
    { id: 'par-theme', title: 'Comment bien nourrir son chien au quotidien ?', hubs: themes },
  ]
  return (
    <div className="space-y-10 mb-12">
      {groups.map((g) =>
        g.hubs.length === 0 ? null : (
          <section key={g.id} aria-labelledby={g.id}>
            <h2 id={g.id} className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {g.title}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {g.hubs.map((h) => (
                <li key={h.collection.slug}>
                  <Link
                    href={`/chien/${h.collection.slug}`}
                    className="group block h-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 hover:border-[var(--accent-1)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all"
                  >
                    <span className="block font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors mb-1">
                      {h.collection.label}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {h.dedicated.length + h.mentions.length} guides
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  )
}
