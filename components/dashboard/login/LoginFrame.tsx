import type { ReactNode } from 'react'

// @cdc tableau de bord — cadre des écrans de connexion : une carte étroite, lisible à 360 px.

interface LoginFrameProps {
  title: string
  intro?: string
  wide?: boolean
  children: ReactNode
}

export function LoginFrame({ title, intro, wide = false, children }: LoginFrameProps) {
  return (
    <main className={`mx-auto w-full ${wide ? 'max-w-prose' : 'max-w-sm'} px-4 py-8`}>
      <p className="m-0 font-display text-lg font-black text-ink">
        Toutou <span className="text-orange-ink">Gourmet</span>
      </p>
      <section className="mt-4 rounded-card border border-line bg-paper p-4 md:p-5">
        <h1 className="page-title m-0 text-ink">{title}</h1>
        {intro ? <p className="m-0 mt-1 text-sm text-ink-2">{intro}</p> : null}
        <div className="mt-4">{children}</div>
      </section>
    </main>
  )
}

export function LoginError({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="m-0 mt-3 rounded-box border border-rose bg-rose-bg px-3 py-2 text-sm text-rose-ink">
      {children}
    </p>
  )
}
