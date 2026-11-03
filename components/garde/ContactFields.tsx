'use client'

import { TextField } from '@/components/compte/fields'
import { Segmented } from '@/components/tools/Segmented'
import { POISON_COUNTRIES, type PoisonCountry } from '@/data/poison-centers'
import { Fieldset, TwoCols, type PartProps } from './form-parts'

// @cdc fiche de garde — dates de l'absence et numéros à appeler. Le pays choisit le centre
// antipoison affiché (data/poison-centers.ts). Aucune adresse, aucun e-mail : le gardien ne voit
// que des numéros.

const COUNTRIES = POISON_COUNTRIES.map((c) => [c.code, c.label] as const) as readonly (readonly [PoisonCountry, string])[]

export function ContactFields({ id, v, set, err, today }: PartProps & { today: string }) {
  return (
    <Fieldset legend="Dates et numéros">
      <TwoCols>
        <TextField id={`${id}-start`} name="startsOn" label="Départ" type="date" min={today} value={v.startsOn} onChange={(x) => set('startsOn', x)} error={err.startsOn} />
        <TextField id={`${id}-end`} name="endsOn" label="Retour" type="date" min={v.startsOn || today} value={v.endsOn} onChange={(x) => set('endsOn', x)} error={err.endsOn} />
      </TwoCols>
      <TextField
        id={`${id}-phone`}
        name="ownerPhone"
        label="Ton téléphone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={v.ownerPhone}
        onChange={(x) => set('ownerPhone', x)}
        placeholder="ex. 06 12 34 56 78"
        error={err.ownerPhone}
      />
      <TwoCols>
        <TextField id={`${id}-vet`} name="vetName" label="Son vétérinaire" value={v.vetName} onChange={(x) => set('vetName', x)} maxLength={80} placeholder="ex. Clinique des Lilas" error={err.vetName} />
        <TextField
          id={`${id}-vetphone`}
          name="vetPhone"
          label="Téléphone du vétérinaire"
          type="tel"
          inputMode="tel"
          value={v.vetPhone}
          onChange={(x) => set('vetPhone', x)}
          placeholder="ex. 04 72 00 00 00"
          error={err.vetPhone}
        />
      </TwoCols>
      <Segmented name={`${id}-country`} legend="Pays de la garde (centre antipoison)" options={COUNTRIES} value={v.country} onChange={(x) => set('country', x)} />
    </Fieldset>
  )
}
