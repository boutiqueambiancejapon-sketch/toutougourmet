import type { FaqEntry } from '@/components/outils/ToolPage'

// @cdc lot 6 — données structurées de /scanner : WebApplication + FAQPage, mêmes données que
// l'affichage. Le BreadcrumbList est émis par BreadcrumbNav, avec le fil d'Ariane visible.

const URL = 'https://www.toutou-gourmet.com/scanner'

export function ScannerJsonLd({ faq, description }: { faq: FaqEntry[]; description: string }) {
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Scanner de croquettes, pâtées et friandises pour chien',
    url: URL,
    description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Navigateur récent ; caméra facultative',
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@type': 'Organization', name: 'Toutou Gourmet', url: 'https://www.toutou-gourmet.com' },
  }
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  )
}
