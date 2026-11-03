import { OG_COLORS as C } from '../tokens'
import type { FicheA4Data } from './data'
import { u } from './scale'

// @cdc lot 6 — fiche A4 (PDF) : les 11 critères sur deux colonnes, points et barre colorée
// (mêmes seuils que FicheCriteria), explication courte.

function barColor(ratio: number): string {
  if (ratio >= 0.75) return C.greenStrong
  if (ratio >= 0.5) return C.amberInk
  return C.roseInk
}

export function Heading({ children }: { children: string }) {
  return <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(16), lineHeight: 1.1, color: C.ink }}>{children}</span>
}

export function FicheA4Criteria({ criteria }: { criteria: FicheA4Data['criteria'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: u(7) }}>
      <Heading>Le détail des critères</Heading>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: u(8) }}>
        {criteria.map((c) => {
          const ratio = c.points === null ? 0 : c.points / c.max
          return (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: u(3), width: '48.5%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: u(8), fontWeight: 700, fontSize: u(12) }}>
                <span>{c.label}</span>
                <span>{c.points === null ? 'non évalué' : `${c.points}/${c.max}`}</span>
              </div>
              <div style={{ display: 'flex', height: u(5), borderRadius: u(5), background: C.cream2 }}>
                <div style={{ display: 'flex', width: `${Math.round(ratio * 100)}%`, height: '100%', borderRadius: u(5), background: barColor(ratio) }} />
              </div>
              <span style={{ fontWeight: 500, fontSize: u(10.5), lineHeight: 1.3, color: C.ink2 }}>{c.explanation}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
