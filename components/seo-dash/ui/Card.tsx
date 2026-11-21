import type { ReactNode } from 'react'
import Link from 'next/link'

// @cdc tableau de bord SEO — carte : titre, phrase d'explication, boutons (export CSV, détail) puis contenu.

interface CardProps {
  title: ReactNode
  desc?: ReactNode
  /** Lien d'export CSV (route serveur, même requête que le tableau). */
  csv?: string
  more?: { href: string; label: string }
  tools?: ReactNode
  className?: string
  id?: string
  children: ReactNode
}

export function Card({ title, desc, csv, more, tools, className = '', id, children }: CardProps) {
  const hasTools = Boolean(csv || more || tools)
  return (
    <section className={`sd-card ${className}`} id={id}>
      <div className="sd-hd">
        <div>
          <h2>{title}</h2>
          {desc ? <p>{desc}</p> : null}
        </div>
        {hasTools ? (
          <div className="sd-tools">
            {tools}
            {more ? (
              <Link className="sd-btn" href={more.href}>
                {more.label}
              </Link>
            ) : null}
            {csv ? (
              <a className="sd-btn" href={csv} download>
                Exporter CSV
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/** Titre de section entre deux grilles de cartes. */
export function Section({ id, title, desc, children }: { id?: string; title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="sd-sec" id={id}>
      <div>
        <h2>{title}</h2>
        {desc ? <p>{desc}</p> : null}
      </div>
      {children}
    </div>
  )
}

/** Petite étiquette « exemple » / « à connecter » : la donnée n'est pas (encore) réelle. */
export function Pending({ children }: { children: ReactNode }) {
  return <span className="sd-ex">{children}</span>
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="sd-empty">{children}</p>
}
