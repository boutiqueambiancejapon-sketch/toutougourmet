// @cdc lot 6 — fiche de partage du scanner, rendue par next/og (flexbox, styles en ligne) :
// format story 1080×1920 et variante Open Graph 1200×630. Même direction artistique que le
// site : crème, encre, tampon orange incliné avec ombre encre, pastilles vertes et roses.
import type { CSSProperties } from 'react'
import { OG_COLORS as C } from './tokens'

export const STORY_SIZE = { width: 1080, height: 1920 } as const

export interface ScanCardData {
  score: number | null
  band: string
  product: string
  brand: string | null
  strengths: string[]
  weaknesses: string[]
  credit: string
  dog: string | null
  qr: string
  /** Pastille d'en-tête : « Scanner de croquettes » ou « Friandise notée sur 100 » */
  tag: string
  /** Appel en bas de la story */
  cta: string
}

function Logo({ size }: { size: number }) {
  return (
    <div style={{ display: 'flex', gap: size * 0.28, fontFamily: 'Fraunces', fontWeight: 900, fontSize: size, color: C.ink, lineHeight: 1 }}>
      <span>Toutou</span>
      <span style={{ color: C.orange }}>Gourmet</span>
    </div>
  )
}

/** Trois chiffres (100) : « /100 » passe sous la note, sinon le tampon coupe le texte. */
const isFull = (score: number | null) => score !== null && score >= 100

export function Stamp({ score, band, size }: { score: number | null; band: string; size: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: size,
        background: C.orange,
        border: `${Math.round(size / 55)}px solid ${C.ink}`,
        boxShadow: `${Math.round(size / 30)}px ${Math.round(size / 30)}px 0 ${C.ink}`,
        transform: 'rotate(-8deg)',
        color: C.ink,
      }}
    >
      <div style={{ display: 'flex', flexDirection: isFull(score) ? 'column' : 'row', alignItems: isFull(score) ? 'center' : 'flex-end', fontFamily: 'Fraunces', fontWeight: 900, lineHeight: 0.9 }}>
        <span style={{ fontSize: size * (isFull(score) ? 0.34 : 0.42) }}>{score === null ? '?' : String(score)}</span>
        <span style={{ fontSize: size * 0.11, paddingBottom: isFull(score) ? 0 : size * 0.04 }}>/100</span>
      </div>
      <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: size * 0.1, marginTop: size * 0.03 }}>{band}</span>
    </div>
  )
}

function Points({ title, items, empty, bg, ink, mark }: { title: string; items: string[]; empty: string; bg: string; ink: string; mark: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
      <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 34, color: C.ink2 }}>{title}</span>
      {items.length === 0 ? <span style={{ display: 'flex', fontWeight: 500, fontSize: 32, color: C.ink2, padding: '20px 0' }}>{empty}</span> : null}
      {items.map((t) => (
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16, background: bg, color: ink, borderRadius: 24, padding: '20px 26px', fontFamily: 'DM Sans', fontWeight: 700, fontSize: 36, lineHeight: 1.15 }}>
          <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: 40 }}>{mark}</span>
          <span style={{ display: 'flex', flex: 1 }}>{t}</span>
        </div>
      ))}
    </div>
  )
}

const productSize = (s: string) => (s.length <= 28 ? 78 : s.length <= 48 ? 64 : s.length <= 72 ? 54 : 46)
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

export function ScanStoryCard(d: ScanCardData) {
  const page: CSSProperties = { display: 'flex', flexDirection: 'column', width: STORY_SIZE.width, height: STORY_SIZE.height, background: C.cream, padding: '90px 80px 70px', fontFamily: 'DM Sans', justifyContent: 'space-between' }
  return (
    <div style={page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size={60} />
        <span style={{ display: 'flex', background: C.ink, color: C.cream, fontWeight: 700, fontSize: 28, padding: '12px 26px', borderRadius: 999 }}>{d.tag}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50 }}>
        <Stamp score={d.score} band={d.band} size={480} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: productSize(d.product), lineHeight: 1.02, letterSpacing: -1.5, color: C.ink }}>{clip(d.product, 90)}</span>
          {d.brand ? <span style={{ fontWeight: 700, fontSize: 42, color: C.ink2 }}>{clip(d.brand, 40)}</span> : null}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 30 }}>
        <Points title="Points forts" items={d.strengths} empty="Aucun point fort net" bg={C.green} ink={C.greenInk} mark="+" />
        <Points title="Points faibles" items={d.weaknesses} empty="Aucun point faible repéré" bg={C.rose} ink={C.roseInk} mark="–" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, background: C.white, border: `5px solid ${C.ink}`, borderRadius: 36, padding: 30 }}>
        {d.dog ? (
          // eslint-disable-next-line @next/next/no-img-element -- next/og : next/image indisponible
          <img src={d.dog} width={160} height={160} alt="" style={{ borderRadius: 160, objectFit: 'cover' }} />
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: 44, lineHeight: 1.05, color: C.ink }}>{d.cta}</span>
          <span style={{ fontWeight: 700, fontSize: 29, color: C.orange }}>toutou-gourmet.com/scanner</span>
          <span style={{ fontWeight: 500, fontSize: 22, color: C.ink2 }}>{d.credit}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og : next/image indisponible */}
        <img src={d.qr} width={180} height={180} alt="" />
      </div>
    </div>
  )
}

export function ScanOgCard(d: ScanCardData) {
  return (
    <div style={{ display: 'flex', width: 1200, height: 630, background: C.cream, fontFamily: 'DM Sans', padding: '56px 64px', gap: 48, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Logo size={40} />
          <span style={{ display: 'flex', background: C.ink, color: C.cream, fontWeight: 700, fontSize: 22, padding: '8px 18px', borderRadius: 999 }}>{d.tag}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: productSize(d.product) * 0.82, lineHeight: 1.02, letterSpacing: -1.5, color: C.ink }}>{clip(d.product, 70)}</span>
          {d.brand ? <span style={{ fontWeight: 700, fontSize: 34, color: C.ink2 }}>{clip(d.brand, 40)}</span> : null}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
            {[...d.strengths.map((t) => ({ t, bg: C.green, ink: C.greenInk })), ...d.weaknesses.map((t) => ({ t, bg: C.rose, ink: C.roseInk }))].slice(0, 3).map((p) => (
              <span key={p.t} style={{ display: 'flex', background: p.bg, color: p.ink, fontWeight: 700, fontSize: 24, padding: '8px 18px', borderRadius: 999 }}>{p.t}</span>
            ))}
          </div>
        </div>
        <span style={{ fontWeight: 700, fontSize: 26, color: C.orange }}>toutou-gourmet.com/scanner</span>
      </div>
      <Stamp score={d.score} band={d.band} size={380} />
    </div>
  )
}
