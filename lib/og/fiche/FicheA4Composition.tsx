import { INGREDIENT_CLASS_LABELS, type IngredientClass } from '@/lib/scanner/ingredient-class'
import { OG_COLORS as C } from '../tokens'
import type { FicheA4Data } from './data'
import { Heading } from './FicheA4Criteria'
import { u } from './scale'

// @cdc lot 6 — fiche A4 (PDF) : composition dans l'ordre de l'étiquette, une pastille colorée par
// ingrédient (mêmes couleurs que FicheIngredients), « + N autres » si la liste déborde, légende.

const STYLE: Record<IngredientClass, { bg: string; ink: string; border: string }> = {
  nommee: { bg: C.greenBg, ink: C.greenInk, border: C.green },
  'non-nommee': { bg: C.amberBg, ink: C.amberInk, border: C.amber },
  cereale: { bg: C.cream2, ink: C.ink2, border: C.line2 },
  controverse: { bg: C.roseBg, ink: C.roseInk, border: C.rose },
  autre: { bg: C.white, ink: C.ink, border: C.line },
}

function Pill({ text, cls }: { text: string; cls: IngredientClass }) {
  const s = STYLE[cls]
  return (
    <span style={{ display: 'flex', background: s.bg, color: s.ink, border: `${u(1)}px solid ${s.border}`, borderRadius: u(20), padding: `${u(2.5)}px ${u(8)}px`, fontWeight: 500, fontSize: u(10.5), lineHeight: 1.25 }}>
      {text}
    </span>
  )
}

export function FicheA4Composition({ items, hidden }: { items: FicheA4Data['ingredients']; hidden: number }) {
  const legend = Object.keys(INGREDIENT_CLASS_LABELS) as (keyof typeof INGREDIENT_CLASS_LABELS)[]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: u(7) }}>
      <Heading>Composition, ingrédient par ingrédient</Heading>
      {items.length === 0 ? (
        <span style={{ fontWeight: 500, fontSize: u(11), color: C.ink2 }}>Composition absente de la lecture.</span>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: u(4) }}>
          {items.map((i, n) => (
            <Pill key={`${n}-${i.text}`} text={i.text} cls={i.cls} />
          ))}
          {hidden > 0 ? (
            <span style={{ display: 'flex', padding: `${u(2.5)}px ${u(6)}px`, fontWeight: 700, fontSize: u(10.5), lineHeight: 1.25, color: C.ink2 }}>{`+ ${hidden} autre${hidden > 1 ? 's' : ''}`}</span>
          ) : null}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: u(14), fontWeight: 500, fontSize: u(9.5), color: C.ink2 }}>
        {legend.map((k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: u(5) }}>
            <span style={{ display: 'flex', width: u(10), height: u(10), borderRadius: u(10), background: STYLE[k].bg, border: `${u(1.5)}px solid ${STYLE[k].ink}` }} />
            <span>{INGREDIENT_CLASS_LABELS[k]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
