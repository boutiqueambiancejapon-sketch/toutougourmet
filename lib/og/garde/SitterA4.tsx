import { FORBIDDEN_FOODS } from '@/lib/garde/forbidden'
import type { SitterViewModel } from '@/lib/garde/view'
import { OG_COLORS as C } from '../tokens'
import { A4_PX, u } from '../fiche/scale'
import { Box, Brand, CallRow, Chips, H, Line } from './parts'

// @cdc fiche de garde — fiche remplie en A4 d'une page (même contenu que /garde/[jeton]) :
// à coller sur le frigo du gardien ou à lui envoyer en PDF.

export function SitterA4({ m }: { m: SitterViewModel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: u(12), width: A4_PX.width, height: A4_PX.height, background: C.cream, padding: `${u(30)}px ${u(36)}px ${u(24)}px`, fontFamily: 'DM Sans', color: C.ink }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: u(6), background: C.ink, borderRadius: u(18), padding: `${u(18)}px ${u(24)}px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: u(11), fontWeight: 700, letterSpacing: u(1), textTransform: 'uppercase', color: C.amber }}>{`Fiche de garde · ${m.period}`}</span>
          <Brand />
        </div>
        <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(38), lineHeight: 1, color: C.cream }}>{m.name}</span>
        <span style={{ fontSize: u(13), fontWeight: 500, color: C.cream2 }}>{m.facts}</span>
      </div>

      <H>Ses repas</H>
      <div style={{ display: 'flex', gap: u(10) }}>
        {[
          [m.grams, 'de croquettes par jour'],
          [m.split, m.splitDetail],
        ].map(([big, small]) => (
          <div key={small} style={{ display: 'flex', flexDirection: 'column', gap: u(4), flex: 1, background: C.amberBg, borderRadius: u(14), padding: `${u(12)}px ${u(14)}px` }}>
            <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(30), lineHeight: 1 }}>{big}</span>
            <span style={{ fontSize: u(12), fontWeight: 500, color: C.ink2 }}>{small}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: u(3) }}>
        {m.food ? <Line>{`Croquettes : ${m.food}`}</Line> : null}
        <Line>Pèse avec une balance de cuisine, le doseur trompe. Eau fraîche toujours à disposition.</Line>
      </div>

      <div style={{ display: 'flex', gap: u(10) }}>
        {m.treats.length > 0 ? (
          <div style={{ display: 'flex', flex: 1 }}>
            <Box bg={C.greenBg}>
              <H color={C.greenInk}>Friandises autorisées</H>
              <Chips items={m.treats} />
            </Box>
          </div>
        ) : null}
        <div style={{ display: 'flex', flex: 1.4 }}>
          <Box bg={C.roseBg}>
            <H color={C.roseInk}>Jamais, même un peu</H>
            <Chips items={FORBIDDEN_FOODS.map((f) => f.label)} />
            {m.allergies ? <Line>{`Allergie connue : ${m.allergies}`}</Line> : null}
          </Box>
        </div>
      </div>

      {m.meds || m.notes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: u(4) }}>
          <H>À savoir</H>
          {m.meds ? <Line>{`Médicament : ${m.meds}`}</Line> : null}
          {m.notes.map((n) => (
            <Line key={n}>{n}</Line>
          ))}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: u(7), flex: 1 }}>
        <H>En cas de souci</H>
        <CallRow title={m.owner.label} detail="Joignable pendant l'absence" phone={m.owner.phone} />
        {m.vet ? <CallRow title={m.vet.label} detail="Son vétérinaire" phone={m.vet.phone} /> : null}
        {m.poison.map((c) => (
          <CallRow key={c.tel} title={"Il a avalé quelque chose\u00a0?"} detail={`${c.name}, ${c.city}${c.hours ? `, ${c.hours}` : ''}`} phone={c.phone} urgent />
        ))}
        <span style={{ display: 'flex', justifyContent: 'center', fontSize: u(10), fontWeight: 500, color: C.ink2, marginTop: 'auto' }}>
          Fiche préparée avec Toutou Gourmet · toutou-gourmet.com/outils/fiche-de-garde
        </span>
      </div>
    </div>
  )
}
