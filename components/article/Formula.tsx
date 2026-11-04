import type { ReactNode } from 'react'

// @cdc 04-pages — bloc de calcul (scanner, outils, articles via lib/remark-formula.ts) : fond bleu
// pastel, police du site. Le nom du résultat passe en gras et sur sa ligne à 390 px. Le signe reste
// collé au terme qui le suit : une coupure de ligne tombe avant le signe, jamais après.

const OPERATOR = / ([−×÷+/]) /g

function typeset(text: string): ReactNode[] {
  return text
    .replace(OPERATOR, ' $1 ')
    .split(/\^([\d,]+)/)
    .map((part, i) => (i % 2 ? <sup key={i}>{part}</sup> : part))
}

export function Formula({ children, className = 'm-0' }: { children: ReactNode; className?: string }) {
  const parts = typeof children === 'string' ? /^(.+?) ([=≈]) (.+)$/.exec(children) : null
  return (
    <p className={`v2 ${className} rounded-box bg-blue-bg px-4 py-3 text-[15px] leading-relaxed text-ink [overflow-wrap:anywhere]`}>
      {parts ? (
        <>
          <span className="block font-bold text-blue-ink sm:inline">{parts[1]}</span> {parts[2]}&nbsp;{typeset(parts[3])}
        </>
      ) : (
        children
      )}
    </p>
  )
}

/** Version des articles MDX : posée par lib/remark-formula.ts, avec la marge d'un paragraphe. */
export function ArticleFormula({ text }: { text: string }) {
  return <Formula className="my-5">{text}</Formula>
}
