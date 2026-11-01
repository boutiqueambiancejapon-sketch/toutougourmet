// @cdc 06-seo — miniature de partage « A1 » (choisie le 2026-11-01) : titre accrocheur,
// badge verdict, photo de la cover. Rendu par next/og (flexbox uniquement, pas de classes).
import { OG_COLORS as C, OG_SIZE, OG_TONES, VERDICTS, type OgTone, type Verdict } from './tokens'

export const PHOTO = { width: 512, height: 582 } as const

const ICONS: Record<Verdict, string> = {
  oui: '<path d="M6 13l4 4 9-10"/>',
  moderation: '<path d="M12 6v8"/><path d="M12 18.5v.5"/>',
  danger: '<path d="M7 7l10 10M17 7L7 17"/>',
}

function iconUri(verdict: Verdict): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${C.white}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[verdict]}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/** Taille du titre selon sa longueur, pour tenir sur 3 lignes dans 544 px. */
function titleSize(title: string): number {
  if (title.length <= 34) return 72
  if (title.length <= 48) return 62
  if (title.length <= 64) return 54
  return 46
}

/** Logo du prototype V2 : tuile ambre + tête de chien, « Gourmet » en orange. */
function Logo({ dogFace }: { dogFace: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Fraunces', fontWeight: 900, fontSize: 34, color: C.ink }}>
      <div style={{ display: 'flex', width: 52, height: 52, borderRadius: 15, background: C.amber, alignItems: 'center', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og : next/image indisponible */}
        <img src={dogFace} width={30} height={30} alt="" />
      </div>
      <span>Toutou</span>
      <span style={{ color: C.orange }}>Gourmet</span>
    </div>
  )
}

function Badge({ verdict, note }: { verdict: Verdict; note?: string }) {
  const v = VERDICTS[verdict]
  const long = v.label.length > 6
  return (
    <div style={{ display: 'flex', flexDirection: long ? 'column' : 'row', alignItems: long ? 'flex-start' : 'center', gap: long ? 12 : 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: v.bg, border: `4px solid ${C.ink}`, borderRadius: 20, padding: '6px 24px 6px 10px' }}>
        <div style={{ display: 'flex', width: 54, height: 54, borderRadius: 999, background: v.disc, alignItems: 'center', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og : next/image indisponible */}
          <img src={iconUri(verdict)} width={38} height={38} alt="" />
        </div>
        <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: long ? 34 : 54, color: C.ink, lineHeight: 1 }}>{v.label}</span>
      </div>
      {note ? (
        <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 30, color: C.ink2, lineHeight: 1.15, width: long ? 540 : 280 }}>{note}</span>
      ) : null}
    </div>
  )
}

interface VerdictCardProps {
  title: string
  pill: { label: string; tone: OgTone }
  photo: string | null
  verdict?: Verdict
  verdictNote?: string
  dogFace: string
}

export function VerdictCard({ title, pill, photo, verdict, verdictNote, dogFace }: VerdictCardProps) {
  const tone = OG_TONES[pill.tone]
  const textWidth = photo ? 640 : OG_SIZE.width
  return (
    <div style={{ display: 'flex', width: OG_SIZE.width, height: OG_SIZE.height, background: C.cream, fontFamily: 'DM Sans' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: textWidth, height: OG_SIZE.height, padding: '48px 40px 44px 56px' }}>
        <span style={{ display: 'flex', alignSelf: 'flex-start', background: tone.bg, color: tone.ink, fontWeight: 700, fontSize: 24, padding: '8px 20px', borderRadius: 999 }}>
          {pill.label}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: titleSize(title), lineHeight: 1, letterSpacing: -2, color: C.ink }}>{title}</span>
          {verdict ? <Badge verdict={verdict} note={verdictNote} /> : null}
        </div>
        <Logo dogFace={dogFace} />
      </div>
      {photo ? (
        <div style={{ display: 'flex', padding: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og : next/image indisponible */}
          <img src={photo} width={PHOTO.width} height={PHOTO.height} alt="" style={{ objectFit: 'cover', borderRadius: 32 }} />
        </div>
      ) : null}
    </div>
  )
}
