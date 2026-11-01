import Link from 'next/link'

// @cdc 06-seo — fil d'Ariane V2 : liste ordonnée + JSON-LD BreadcrumbList (même balisage partout).
export interface BreadcrumbItem {
  label: string
  href?: string
}

const SITE_URL = 'https://www.toutou-gourmet.com'

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Fil d'Ariane" className="v2 text-sm text-ink-2">
        <ol role="list" className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
              {i > 0 ? <span aria-hidden="true" className="opacity-50">›</span> : null}
              {item.href ? (
                <Link href={item.href} className="text-ink-2 no-underline hover:text-ink">{item.label}</Link>
              ) : (
                <span aria-current="page" className="text-ink">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
