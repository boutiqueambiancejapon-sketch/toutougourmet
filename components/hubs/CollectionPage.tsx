import Link from 'next/link'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CollectionFaq } from '@/components/hubs/CollectionFaq'
import { getCategoryBySlug } from '@/data/categories'
import { PARENT_THEME_CATEGORY } from '@/data/collections'
import { articleHref, type CollectionContent } from '@/lib/collections'

interface Props {
  content: CollectionContent
  /** Autres hubs publiés du même type, pour le maillage entre hubs */
  siblings: CollectionContent[]
}

// @cdc seo — page hub (sous-hub thématique ou profil) : intro éditoriale, guides
// dédiés, sections des autres guides (profils), outils, hubs voisins, FAQ.
export function CollectionPage({ content, siblings }: Props) {
  const { collection: c, dedicated, mentions, faqs } = content
  const parent = c.kind === 'theme' ? getCategoryBySlug(PARENT_THEME_CATEGORY) : undefined
  const total = dedicated.length + mentions.length

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Chien', href: '/chien' },
            ...(parent ? [{ label: parent.label, href: `/chien/${parent.slug}` }] : []),
            { label: c.label },
          ]}
        />

        <header className="mb-10 max-w-[720px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            {c.kind === 'profil' ? 'Guide par profil' : 'Bien nourrir son chien'} · {total} guides
          </p>
          <h1 className="page-title mb-4">{c.h1}</h1>
          {c.intro.map((p) => (
            <p key={p.slice(0, 32)} className="text-[var(--text-secondary)] mb-3">
              {p}
            </p>
          ))}
        </header>

        <section aria-labelledby="guides" className="mb-14">
          <h2 id="guides" className="text-2xl font-bold text-[var(--text-primary)] mb-5">
            {c.guidesHeading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dedicated.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>

        {mentions.length > 0 && c.mentionsHeading && (
          <section aria-labelledby="sections" className="mb-14 max-w-[880px]">
            <h2 id="sections" className="text-2xl font-bold text-[var(--text-primary)] mb-5">
              {c.mentionsHeading}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {mentions.map((m) => (
                <li key={m.article.slug} className="leading-snug">
                  <Link href={`${articleHref(m.article)}#${m.anchor}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-1)]">
                    {m.article.frontmatter.title}
                  </Link>
                  <span className="block text-sm text-[var(--text-muted)]">Section : {m.heading}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {c.tools && c.tools.length > 0 && (
          <section aria-labelledby="outils" className="mb-14">
            <h2 id="outils" className="text-2xl font-bold text-[var(--text-primary)] mb-5">
              Quels outils utiliser ?
            </h2>
            <ul className="flex flex-wrap gap-3">
              {c.tools.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="btn-outline text-sm">
                    {t.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <CollectionFaq heading={c.faqHeading} faqs={faqs} />

        {siblings.length > 0 && (
          <nav aria-label="Autres guides" className="mt-14">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {c.kind === 'profil' ? 'Les autres guides par profil' : 'Les autres dossiers Bien nourrir'}
            </h2>
            <ul className="flex flex-wrap gap-3">
              {siblings.map((s) => (
                <li key={s.collection.slug}>
                  <Link href={`/chien/${s.collection.slug}`} className="btn-outline text-sm">
                    {s.collection.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}
