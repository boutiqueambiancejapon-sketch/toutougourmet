import type { ReactNode } from 'react'

// @cdc tableau de bord — carte qui encadre un graphique ou une liste.

interface PanelProps {
  title: string
  hint?: string
  wide?: boolean
  children: ReactNode
}

export function Panel({ title, hint, wide = false, children }: PanelProps) {
  return (
    <section className={`rounded-card border border-line bg-paper p-4 md:p-5 ${wide ? 'md:col-span-2' : ''}`}>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {hint && <p className="mt-1 text-sm text-ink-2">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-box border border-dashed border-line-2 bg-cream px-4 py-5 text-sm text-ink-2">{children}</p>
}

export function SectionTitle({ id, title, intro }: { id: string; title: string; intro?: string }) {
  return (
    <header id={id} className="scroll-mt-20 pt-8">
      <h2 className="font-display text-2xl font-black text-ink">{title}</h2>
      {intro && <p className="mt-1 max-w-prose text-sm text-ink-2">{intro}</p>}
    </header>
  )
}
