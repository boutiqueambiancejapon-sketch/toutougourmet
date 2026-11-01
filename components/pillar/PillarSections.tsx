import { FaqList, FaqItem } from '@/components/article/Faq'
import type { PillarContent } from '@/data/pillars'
import { RichText, plainText } from './RichText'

// @cdc seo-geo — contenu éditorial d'une page pilier : introduction développée (sous l'en-tête),
// FAQ + JSON-LD FAQPage et sources (en bas de page).
const PROSE = 'leading-relaxed text-ink [&_a]:text-orange-ink [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold'

export function PillarIntro({ pillar }: { pillar: PillarContent }) {
  return (
    <section aria-labelledby="introduction" className="v2 flex max-w-prose flex-col gap-4">
      <h2 id="introduction" className="m-0 font-display text-2xl font-black text-ink">{pillar.heading}</h2>
      {pillar.intro.map((p, i) => (
        <p key={i} className={`m-0 ${PROSE}`}>
          <RichText text={p} />
        </p>
      ))}
    </section>
  )
}

export function PillarFaqAndSources({ pillar }: { pillar: PillarContent }) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pillar.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plainText(f.a) } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section aria-labelledby="questions" className="v2 flex max-w-prose flex-col gap-2">
        <h2 id="questions" className="m-0 font-display text-2xl font-black text-ink">Questions fréquentes</h2>
        <FaqList>
          {pillar.faq.map((f) => (
            <FaqItem key={f.q} question={f.q}>
              <p className="m-0">
                <RichText text={f.a} />
              </p>
            </FaqItem>
          ))}
        </FaqList>
      </section>
      {pillar.sources.length > 0 ? (
        <section aria-labelledby="sources" className="v2 flex max-w-prose flex-col gap-2">
          <h2 id="sources" className="m-0 text-[15px] font-semibold text-ink">Sources</h2>
          <ol className="m-0 flex flex-col gap-1 pl-5 text-sm text-ink-2">
            {pillar.sources.map((s) => (
              <li key={s.url + s.label}>
                <a href={s.url} rel="noopener" target="_blank" className="text-ink-2 underline underline-offset-2">{s.label}</a>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  )
}
