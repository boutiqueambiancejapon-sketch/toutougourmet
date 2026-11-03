import type { FaqEntry } from '@/components/outils/ToolPage'

// @cdc seo-geo §4 — données structurées de /scanner/alternative-yuka-animaux : WebPage + FAQPage,
// mêmes textes que l'affichage. Le BreadcrumbList est émis par BreadcrumbNav. Yuka n'apparaît que
// dans le texte (aucun « sponsor », « brand » ni « sameAs » : pas de lien suggéré avec la marque).

const SITE_URL = 'https://www.toutou-gourmet.com'

interface Props {
  path: string
  title: string
  description: string
  dateModified: string
  faq: FaqEntry[]
}

export function YukaJsonLd({ path, title, description, dateModified, faq }: Props) {
  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: `${SITE_URL}${path}`,
    description,
    inLanguage: 'fr-FR',
    dateModified,
    isPartOf: { '@type': 'WebSite', name: 'Toutou Gourmet', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Toutou Gourmet', url: SITE_URL },
    about: { '@type': 'WebApplication', name: 'Scanner de croquettes pour chien', url: `${SITE_URL}/scanner` },
  }
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  )
}
