import type { ReactNode } from 'react'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { OtherTools } from './OtherTools'
import type { ToolSlug } from './tool-list'

// @cdc 5.0 — gabarit V2 des pages outils (audit design-cro §3 Outils), rendu serveur :
// fil d'Ariane, H1 et chapô courts, l'outil tout de suite (visible sans défiler sur mobile),
// « Comment on calcule » en texte sobre avec ses sources, FAQ, autres outils.
// JSON-LD WebApplication + FAQPage générés ici à partir des mêmes données que l'affichage.

const SITE_URL = 'https://www.toutou-gourmet.com'

export interface FaqEntry {
  question: string
  answer: string
}

interface ToolPageProps {
  slug: ToolSlug
  path: string
  crumb: string
  title: string
  lead: ReactNode
  /** L'outil lui-même (composant client) */
  children: ReactNode
  methodTitle: string
  method: ReactNode
  faqTitle: string
  faq: FaqEntry[]
  app: { name: string; description: string }
}

export function ToolPage({ slug, path, crumb, title, lead, children, methodTitle, method, faqTitle, faq, app }: ToolPageProps) {
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: app.name,
    url: `${SITE_URL}${path}`,
    description: app.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="v2 mx-auto flex max-w-prose flex-col gap-12 px-4 pt-4 pb-16 md:px-8 md:pt-8">
        <div className="flex flex-col gap-4">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Outils', href: '/outils' }, { label: crumb }]} />
          <header className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-[clamp(1.75rem,4.2vw,2.5rem)] font-black leading-[1.08] tracking-tight text-ink">
              {title}
            </h1>
            <div className="m-0 text-base leading-relaxed text-ink-2 md:text-lg [&_p]:m-0">{lead}</div>
          </header>
          {children}
        </div>

        <section aria-labelledby="methode" className="flex flex-col gap-3">
          <h2 id="methode" className="m-0 font-display text-2xl font-black text-ink">
            {methodTitle}
          </h2>
          <div className="flex flex-col gap-3 text-base leading-relaxed text-ink-2 [&_a]:text-orange-ink [&_a]:underline [&_a]:underline-offset-2 [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-ink">
            {method}
          </div>
        </section>

        <section aria-labelledby="faq" className="flex flex-col">
          <h2 id="faq" className="m-0 font-display text-2xl font-black text-ink">
            {faqTitle}
          </h2>
          <FaqList>
            {faq.map((item) => (
              <FaqItem key={item.question} question={item.question}>
                <p className="m-0">{item.answer}</p>
              </FaqItem>
            ))}
          </FaqList>
        </section>

        <OtherTools current={slug} />
      </div>
    </>
  )
}

/** Formule affichée en ligne, en chasse fixe sobre (pas d'encadré). */
export function Formula({ children }: { children: ReactNode }) {
  return <p className="m-0 font-mono text-[15px] text-ink">{children}</p>
}

/** Liste des sources nommées en fin de section « Comment on calcule ». */
export function Sources({ items }: { items: ReactNode[] }) {
  return (
    <div className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
      <p className="m-0 font-semibold text-ink">Sources</p>
      <ul role="list" className="m-0 flex list-disc flex-col gap-1 pl-5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
