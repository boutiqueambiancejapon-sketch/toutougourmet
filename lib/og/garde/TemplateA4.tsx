import { POISON_COUNTRIES } from '@/data/poison-centers'
import { FORBIDDEN_FOODS } from '@/lib/garde/forbidden'
import { OG_COLORS as C } from '../tokens'
import { A4_PX, u } from '../fiche/scale'
import { Blank, Box, Brand, Chips, H } from './parts'

// @cdc fiche de garde — modèle vierge à imprimer (A4, une page) : cases à remplir au stylo. Les
// aliments interdits et les centres antipoison (France, Belgique, Canada) sont déjà imprimés.

const Row = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'flex', gap: u(10) }}>{children}</div>

export function TemplateA4() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: u(11), width: A4_PX.width, height: A4_PX.height, background: C.cream, padding: `${u(28)}px ${u(36)}px ${u(22)}px`, fontFamily: 'DM Sans', color: C.ink }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.ink, borderRadius: u(18), padding: `${u(16)}px ${u(24)}px` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: u(4) }}>
          <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(30), lineHeight: 1, color: C.cream }}>Fiche de garde</span>
          <span style={{ fontSize: u(12), fontWeight: 500, color: C.cream2 }}>À remplir et à laisser à la personne qui garde le chien</span>
        </div>
        <Brand />
      </div>

      <Row>
        <Blank label="Nom du chien" flex={1.4} />
        <Blank label="Poids" flex={1} />
        <Blank label="Âge" flex={1} />
      </Row>
      <Row>
        <Blank label="Du" flex={1} />
        <Blank label="Au" flex={1} />
        <Blank label="Stérilisé (oui / non)" flex={1} />
      </Row>

      <H>Ses repas</H>
      <Row>
        <Blank label="Grammes par jour" height={44} flex={1} />
        <Blank label="Nombre de repas" height={44} flex={1} />
        <Blank label="Heures des repas" height={44} flex={1.4} />
      </Row>
      <Blank label="Ses croquettes (marque, recette) et où elles sont rangées" />

      <Row>
        <div style={{ display: 'flex', flex: 1 }}>
          <Box bg={C.greenBg}>
            <H color={C.greenInk}>Friandises autorisées</H>
            <div style={{ display: 'flex', height: u(96), background: C.white, borderRadius: u(8) }} />
          </Box>
        </div>
        <div style={{ display: 'flex', flex: 1.3 }}>
          <Box bg={C.roseBg}>
            <H color={C.roseInk}>Jamais, même un peu</H>
            <Chips items={FORBIDDEN_FOODS.map((f) => f.label)} />
            <Blank label="Allergies" height={24} />
          </Box>
        </div>
      </Row>

      <Blank label="Médicaments (nom, dose, heure)" height={56} />
      <Blank label="À savoir sur lui (peurs, promenades, habitudes)" height={110} />

      <H>En cas de souci</H>
      <Row>
        <Blank label="Téléphone du propriétaire" height={38} flex={1} />
        <Blank label="Vétérinaire et son téléphone" height={38} flex={1} />
      </Row>
      <div style={{ display: 'flex', flexDirection: 'column', gap: u(4), background: C.white, border: `${u(2)}px solid ${C.roseInk}`, borderRadius: u(12), padding: `${u(9)}px ${u(14)}px` }}>
        <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: u(14), color: C.roseInk }}>{"Il a avalé quelque chose\u00a0? Appelle sans attendre les symptômes"}</span>
        {POISON_COUNTRIES.flatMap((country) =>
          country.centers.map((c) => (
            <span key={c.tel} style={{ display: 'flex', fontSize: u(11.5), fontWeight: 500, color: C.ink }}>
              {`${country.label}\u00a0: ${c.name} (${c.city})${c.hours ? `, ${c.hours}` : ''} · ${c.phone}`}
            </span>
          )),
        )}
      </div>
      <span style={{ display: 'flex', justifyContent: 'center', fontSize: u(10), fontWeight: 500, color: C.ink2, marginTop: 'auto' }}>
        Version en ligne, ration calculée et lien à partager : toutou-gourmet.com/outils/fiche-de-garde
      </span>
    </div>
  )
}
