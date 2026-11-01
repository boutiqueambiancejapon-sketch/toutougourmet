import type { ReactNode } from 'react'

// @cdc seo-geo §4 — FAQ en accordéon natif (<details>), sans JavaScript, rendue côté serveur.
// La question est un <h3> ; lib/mdx.ts › extractFaqs reprend le même texte dans le
// JSON-LD FAQPage injecté par la page article.

export function FaqList({ children }: { children: ReactNode }) {
  return <div className="v2 my-6 flex flex-col gap-2">{children}</div>
}

export function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group rounded-box border border-line bg-paper">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <h3 className="m-0 grow text-base font-semibold leading-snug text-ink">{question}</h3>
        <span aria-hidden="true" className="shrink-0 text-xl leading-none text-ink-2 group-open:hidden">
          +
        </span>
        <span aria-hidden="true" className="hidden shrink-0 text-xl leading-none text-ink-2 group-open:inline">
          −
        </span>
      </summary>
      <div className="px-4 pb-4 leading-relaxed text-ink-2 [&_a]:text-orange-ink [&_a]:underline [&_a]:underline-offset-2 [&_p+p]:mt-2 [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </details>
  )
}
