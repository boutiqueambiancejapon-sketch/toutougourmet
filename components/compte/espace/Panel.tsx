import type { ReactNode } from 'react'

// @cdc compte — carte de section de l'espace compte : titre H2, action à droite, contenu.

interface PanelProps {
  id: string
  title: string
  action?: ReactNode
  tone?: 'default' | 'danger'
  children: ReactNode
}

const TONES = {
  default: 'border border-line bg-paper',
  danger: 'border-2 border-orange-ink bg-paper',
}

export function Panel({ id, title, action, tone = 'default', children }: PanelProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className={`flex scroll-mt-24 flex-col gap-4 rounded-card p-4 md:p-6 ${TONES[tone]}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 id={`${id}-titre`} className={`m-0 font-display text-xl font-black leading-tight ${tone === 'danger' ? 'text-orange-ink' : 'text-ink'}`}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
