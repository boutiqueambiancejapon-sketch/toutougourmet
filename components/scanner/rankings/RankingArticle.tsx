import Link from 'next/link'
import { FaqItem, FaqList } from '@/components/article/Faq'
import type { RankingContent } from '@/data/ranking-content'
import { inlineParts, inlinePlain } from '@/lib/inline-links'
import { titleTypo } from '@/lib/title-typo'
import { frTypo } from '@/lib/utils'

// @cdc cluster scanner — le texte d'une page de classement et sa FAQ, en rendu serveur. JSON-LD FAQPage sans les liens.

const plain = (s: string) => frTypo(inlinePlain(s))
const LINK_CLASS = 'font-semibold text-orange-ink underline underline-offset-2'

function Inline({ text }: { text: string }) {
  return (
    <>
      {inlineParts(text).map((part, i) => {
        if ('text' in part) return frTypo(part.text)
        if (part.external) return <a key={i} href={part.href} target="_blank" rel="noopener" className={LINK_CLASS}>{frTypo(part.label)}</a>
        return <Link key={i} href={part.href} className={LINK_CLASS}>{frTypo(part.label)}</Link>
      })}
    </>
  )
}

export function RankingSections({ sections }: { sections: RankingContent['sections'] }) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.h2} className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo(s.h2)}</h2>
          {s.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="m-0 text-base leading-relaxed text-ink-2"><Inline text={p} /></p>
          ))}
        </section>
      ))}
    </>
  )
}

export function RankingArticle({ content }: { content: RankingContent }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((f) => ({ '@type': 'Question', name: frTypo(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <RankingSections sections={content.sections} />
      <section className="flex flex-col gap-2">
        <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo('Questions fréquentes')}</h2>
        <FaqList>
          {content.faqs.map((f) => (
            <FaqItem key={f.q} question={frTypo(f.q)}>
              <p className="m-0"><Inline text={f.a} /></p>
            </FaqItem>
          ))}
        </FaqList>
      </section>
    </>
  )
}

export function RankingSources({ sources }: { sources: string[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="m-0 font-display text-xl font-black text-ink">Sources</h2>
      <ul className="m-0 flex flex-col gap-1 pl-5 text-sm text-ink-2">
        {sources.map((s) => <li key={s}>{frTypo(s)}</li>)}
      </ul>
    </section>
  )
}
