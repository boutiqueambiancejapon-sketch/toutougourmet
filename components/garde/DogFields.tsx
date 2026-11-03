'use client'

import { TextField } from '@/components/compte/fields'
import { Segmented } from '@/components/tools/Segmented'
import { Fieldset, TwoCols, type PartProps } from './form-parts'

// @cdc fiche de garde — le chien : de quoi calculer sa ration (même calcul que /outils/ration).

const AGES = [['chiot', 'Chiot'], ['adulte', 'Adulte'], ['senior', 'Senior']] as const
const ACTIVITIES = [['sedentaire', 'Calme'], ['normal', 'Normale'], ['actif', 'Sportive'], ['tres-actif', 'Intense']] as const
const YES_NO = [['non', 'Non'], ['oui', 'Oui']] as const

export function DogFields({ id, v, set, err }: PartProps) {
  return (
    <Fieldset legend="Le chien">
      <TwoCols>
        <TextField id={`${id}-name`} name="dogName" label="Son nom" value={v.dogName} onChange={(x) => set('dogName', x)} maxLength={40} required error={err.dogName} />
        <TextField id={`${id}-breed`} name="breed" label="Race (facultatif)" value={v.breed} onChange={(x) => set('breed', x)} maxLength={60} placeholder="ex. croisé beagle" error={err.breed} />
      </TwoCols>
      <TextField
        id={`${id}-weight`}
        name="weightKg"
        label="Poids (kg)"
        type="text"
        inputMode="decimal"
        value={v.weightKg}
        onChange={(x) => set('weightKg', x)}
        placeholder="ex. 12"
        required
        error={err.weightKg}
      />
      <Segmented name={`${id}-age`} legend="Âge" options={AGES} value={v.ageGroup} onChange={(x) => set('ageGroup', x)} />
      <Segmented name={`${id}-act`} legend="Activité" options={ACTIVITIES} value={v.activity} onChange={(x) => set('activity', x)} />
      <Segmented
        name={`${id}-ster`}
        legend="Stérilisé"
        options={YES_NO}
        value={v.sterilized ? 'oui' : 'non'}
        onChange={(x) => set('sterilized', x === 'oui')}
      />
    </Fieldset>
  )
}
