import Link from 'next/link'
import { ArticleCard } from '@/components/blog/ArticleCard'
import type { Article } from '@/lib/mdx'
import { getPublishedCollections } from '@/lib/collections'

interface Props {
  /** Articles de la catégorie parente */
  articles: Article[]
  all: Article[]
}

const PREVIEW = 6

// @cdc seo — hub « Bien nourrir » découpé en sous-hubs : chaque thème montre ses
// 6 premiers guides et renvoie vers son sous-hub ; les guides sans thème restent
// listés en entier pour ne perdre aucun lien.
export function ThemedCategoryHub({ articles, all }: Props) {
  const themes = getPublishedCollections(all, 'theme')
  const profils = getPublishedCollections(all, 'profil')
  const themed = new Set(themes.flatMap((t) => t.dedicated.map((a) => a.slug)))
  const others = articles.filter((a) => !themed.has(a.slug))

  return (
    <div className="space-y-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themes.map((t) => (
          <Link
            key={t.collection.slug}
            href={`/chien/${t.collection.slug}`}
            className="group bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent-1)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all"
          >
            <p className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors mb-1">
              {t.collection.label}
            </p>
            <p className="text-sm text-[var(--text-muted)]">{t.dedicated.length} guides</p>
          </Link>
        ))}
      </div>

      {profils.length > 0 && (
        <section aria-labelledby="par-profil">
          <h2 id="par-profil" className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Quel guide selon l&apos;âge et l&apos;activité de son chien ?
          </h2>
          <ul className="flex flex-wrap gap-3">
            {profils.map((p) => (
              <li key={p.collection.slug}>
                <Link href={`/chien/${p.collection.slug}`} className="btn-outline text-sm">
                  {p.collection.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {themes.map((t) => (
        <section key={t.collection.slug} aria-labelledby={`theme-${t.collection.slug}`}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 id={`theme-${t.collection.slug}`} className="text-xl font-bold text-[var(--text-primary)]">
              {t.collection.guidesHeading}
            </h2>
            <Link href={`/chien/${t.collection.slug}`} className="text-sm text-[var(--accent-1)] hover:underline shrink-0">
              Les {t.dedicated.length} guides {t.collection.label.toLowerCase()} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.dedicated.slice(0, PREVIEW).map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      ))}

      {others.length > 0 && (
        <section aria-labelledby="autres-guides">
          <h2 id="autres-guides" className="text-xl font-bold text-[var(--text-primary)] mb-5">
            Quels autres guides pour bien nourrir son chien ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {others.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
