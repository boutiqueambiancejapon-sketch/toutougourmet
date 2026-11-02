import type { FaqEntry } from '@/components/outils/ToolPage'

// @cdc lot 6 — données structurées de /scanner : WebApplication + FAQPage, mêmes données que l'affichage.

const URL = 'https://www.toutou-gourmet.com/scanner'

export function ScannerJsonLd({ faq }: { faq: FaqEntry[] }) {
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Scanner de croquettes pour chien',
    url: URL,
    description: 'Lecture du code-barres ou de l\'étiquette et note sur 100 de la composition, calculée par un barème publié.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
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
