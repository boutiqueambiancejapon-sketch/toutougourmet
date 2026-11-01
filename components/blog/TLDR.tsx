import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

// @cdc seo-geo §1.5 — TL;DR en tête d'article, rendu côté serveur.
// Les puces viennent de la section « ## TL;DR » du MDX (lib/mdx.ts › extractTldr).

interface TLDRProps {
  items: string[]
  locale?: Locale
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Échappe le texte puis rend le seul markdown utilisé dans les puces : **gras**. */
const renderInline = (item: string) => escapeHtml(item).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

export function TLDR({ items, locale = 'fr' }: TLDRProps) {
  const title = getDictionary(locale).article.tldrTitle

  return (
    <section aria-label={title} className="v2 my-7 flex flex-col gap-2 rounded-card bg-amber-bg p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-ink">{title}</p>
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 marker:text-amber-ink">
        {items.map((item, i) => (
          <li
            key={i}
            className="leading-relaxed text-ink [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: renderInline(item) }}
          />
        ))}
      </ul>
    </section>
  )
}
