import type { ReactNode } from 'react'
import { OG_COLORS as C } from '../tokens'
import { u } from '../fiche/scale'

// @cdc fiche de garde — briques de la fiche A4 (PDF rempli et modèle vierge), rendues par
// next/og : chaque bloc à plusieurs enfants est en display flex, couleurs de lib/og/tokens.ts.

export function Brand({ color = C.cream }: { color?: string }) {
  return (
    <div style={{ display: 'flex', gap: u(5), fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(16), color, lineHeight: 1 }}>
      <span>Toutou</span>
      <span style={{ color: C.orange }}>Gourmet</span>
    </div>
  )
}

export function H({ children, color = C.ink }: { children: ReactNode; color?: string }) {
  return <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(17), color, lineHeight: 1.1 }}>{children}</span>
}

export function Box({ children, bg, border, gap = 6 }: { children: ReactNode; bg: string; border?: string; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: u(gap), background: bg, borderRadius: u(12), padding: `${u(11)}px ${u(14)}px`, border: border ? `${u(2)}px solid ${border}` : 'none' }}>
      {children}
    </div>
  )
}

export function Chips({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: u(5) }}>
      {items.map((t) => (
        <span key={t} style={{ display: 'flex', background: C.white, borderRadius: u(99), padding: `${u(3)}px ${u(10)}px`, fontSize: u(12.5), fontWeight: 500, color: C.ink }}>
          {t}
        </span>
      ))}
    </div>
  )
}

export function Line({ children }: { children: ReactNode }) {
  return <span style={{ display: 'flex', fontSize: u(13), fontWeight: 500, lineHeight: 1.35, color: C.ink }}>{children}</span>
}

/** Ligne d'appel : titre, précision, numéro en gros. */
export function CallRow({ title, detail, phone, urgent = false }: { title: string; detail: string; phone: string; urgent?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: u(12), background: C.white, border: `${u(2)}px solid ${urgent ? C.roseInk : C.ink}`, borderRadius: u(12), padding: `${u(8)}px ${u(14)}px` }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(14), color: C.ink }}>{title}</span>
        <span style={{ fontSize: u(10.5), fontWeight: 500, color: C.ink2 }}>{detail}</span>
      </div>
      <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(19), color: urgent ? C.roseInk : C.ink }}>{phone}</span>
    </div>
  )
}

/** Case vide du modèle à remplir à la main. */
export function Blank({ label, height = 30, flex }: { label: string; height?: number; flex?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: u(3), ...(flex ? { flex } : {}) }}>
      <span style={{ fontSize: u(10), fontWeight: 700, color: C.ink2 }}>{label}</span>
      <div style={{ display: 'flex', height: u(height), background: C.white, border: `${u(1.5)}px solid ${C.line2}`, borderRadius: u(8) }} />
    </div>
  )
}
