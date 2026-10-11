import Link from 'next/link'
import { FaqList, FaqItem } from '@/components/mdx/MdxComponents'
import { articleHref, type CollectionFaq as Faq } from '@/lib/collections'

// @cdc seo — FAQ de hub : une question tirée de chaque guide membre, réponse
// courte + lien vers le guide qui la développe. JSON-LD FAQPage rendu serveur.
export function CollectionFaq({ heading, faqs }: { heading: string; faqs: Faq[] }) {
  if (faqs.length === 0) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
  return (
    <section aria-labelledby="faq" className="mt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h2 id="faq" className="text-2xl font-bold text-[var(--text-primary)] mb-4">
        {heading}
      </h2>
      <FaqList>
        {faqs.map((f) => (
          <FaqItem key={f.question} question={f.question}>
            <p className="m-0">{f.answer}</p>
            <p className="mt-2 mb-0 text-sm">
              <Link href={articleHref(f.article)} className="text-[var(--accent-1)] hover:underline">
                {f.article.frontmatter.title}
              </Link>
            </p>
          </FaqItem>
        ))}
      </FaqList>
    </section>
  )
}
