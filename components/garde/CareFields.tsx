'use client'

import { AreaField, Fieldset, type PartProps } from './form-parts'

// @cdc fiche de garde — friandises autorisées, allergies, médicaments, habitudes. Les aliments
// interdits ne se tapent pas : la fiche reprend la liste du guide (lib/garde/forbidden.ts).

export function CareFields({ id, v, set, err }: PartProps) {
  return (
    <Fieldset legend="Ce qu'il a le droit de manger" hint="Le chocolat, le raisin, l'oignon, le xylitol et les os cuits figurent déjà sur la fiche, dans la case des interdits.">
      <AreaField
        id={`${id}-treats`}
        label="Friandises autorisées"
        hint="séparées par des virgules"
        value={v.treats}
        onChange={(x) => set('treats', x)}
        maxLength={200}
        placeholder="ex. carotte, pomme sans pépins, 2 biscuits par jour"
        error={err.treats}
      />
      <AreaField id={`${id}-allergies`} label="Allergies connues" hint="facultatif" value={v.allergies} onChange={(x) => set('allergies', x)} maxLength={200} placeholder="ex. bœuf" error={err.allergies} />
      <AreaField id={`${id}-meds`} label="Médicaments" hint="facultatif" value={v.meds} onChange={(x) => set('meds', x)} maxLength={300} placeholder="ex. un comprimé le matin, caché dans la pâtée" error={err.meds} />
      <AreaField
        id={`${id}-notes`}
        label="À savoir sur lui"
        hint="facultatif, une habitude par ligne"
        value={v.notes}
        onChange={(x) => set('notes', x)}
        maxLength={400}
        placeholder="ex. a peur de l'orage. Promenade avant chaque repas."
        error={err.notes}
      />
    </Fieldset>
  )
}
