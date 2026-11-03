// @cdc lot 6 — fiche A4 d'un produit scanné, rendue par next/og puis enveloppée en PDF
// (lib/og/fiche-pdf.tsx). Même direction que le site : en-tête encre, tampon orange incliné,
// critères en barres, composition en pastilles colorées. Tout tient sur une page.
import { Stamp } from '../ScanCard'
import { OG_COLORS as C } from '../tokens'
import type { FicheA4Data } from './data'
import { FicheA4Bottom } from './FicheA4Bottom'
import { FicheA4Composition } from './FicheA4Composition'
import { FicheA4Criteria } from './FicheA4Criteria'
import { A4_PX, u } from './scale'

const nameSize = (s: string) => (s.length <= 34 ? 30 : s.length <= 60 ? 25 : 21)

function Header({ d }: { d: FicheA4Data }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: u(20), background: C.ink, borderRadius: u(18), padding: `${u(18)}px ${u(22)}px ${u(18)}px ${u(24)}px` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: u(7), flex: 1 }}>
        <div style={{ display: 'flex', gap: u(5), fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(17), color: C.cream, lineHeight: 1 }}>
          <span>Toutou</span>
          <span style={{ color: C.orange }}>Gourmet</span>
        </div>
        <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(nameSize(d.name)), lineHeight: 1.08, color: C.cream }}>{d.name}</span>
        <span style={{ fontWeight: 500, fontSize: u(11.5), color: C.cream2 }}>{d.meta}</span>
      </div>
      <Stamp score={d.score} band={d.band ?? 'Pas de note'} size={u(112)} />
    </div>
  )
}

export function FicheA4({ d }: { d: FicheA4Data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: u(13), width: A4_PX.width, height: A4_PX.height, background: C.cream, padding: `${u(30)}px ${u(34)}px ${u(24)}px`, fontFamily: 'DM Sans', color: C.ink }}>
      <Header d={d} />
      {d.verdict ? (
        <div style={{ display: 'flex', background: C.white, border: `${u(1)}px solid ${C.line}`, borderRadius: u(12), padding: `${u(10)}px ${u(14)}px`, fontWeight: 500, fontSize: u(12.5), lineHeight: 1.4, color: C.ink2 }}>
          {d.verdict}
        </div>
      ) : null}
      {d.missing ? (
        <div style={{ display: 'flex', background: C.amberBg, borderRadius: u(10), padding: `${u(7)}px ${u(12)}px`, fontWeight: 500, fontSize: u(10.5), lineHeight: 1.35, color: C.amberInk }}>{d.missing}</div>
      ) : null}
      <FicheA4Criteria criteria={d.criteria} />
      <FicheA4Composition items={d.ingredients} hidden={d.hidden} />
      <FicheA4Bottom d={d} />
    </div>
  )
}
