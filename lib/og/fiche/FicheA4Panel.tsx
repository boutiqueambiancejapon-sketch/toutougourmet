import type { ReactNode } from 'react'
import { OG_COLORS as C } from '../tokens'
import { u } from './scale'

// @cdc lot 6 — fiche A4 (PDF) : encadré du bas de page et petit texte, partagés par
// FicheA4Bottom (aliment complet) et FicheA4Treat (friandise).

export function Panel({ children, bg = C.white, width }: { children: ReactNode; bg?: string; width?: number }) {
  const size = width ? { width: u(width) } : { flex: 1 }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: u(5), ...size, height: '100%', background: bg, border: `${u(1)}px solid ${C.line}`, borderRadius: u(12), padding: `${u(10)}px ${u(12)}px` }}>
      {children}
    </div>
  )
}

export const small = { fontWeight: 500, fontSize: u(9.5), lineHeight: 1.3, color: C.ink2 } as const

