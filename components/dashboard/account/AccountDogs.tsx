import { ACTIVITY_LABELS, breedName, formatAge, formatKg } from '@/lib/dog-profile'
import type { AccountDog } from '@/lib/server/dashboard-account-detail'
import { Empty } from '../Panel'
import { Badge } from '../subscribers/RowParts'
import { Card, KeyValues, Unreadable } from './parts'

// @cdc tableau de bord — chiens d'un compte, en lecture seule. Un champ vide dit « non renseigné ».

const MISSING = 'Non renseigné'

function DogCard({ dog }: { dog: AccountDog }) {
  const count = `${dog.weighings} ${dog.weighings > 1 ? 'pesées' : 'pesée'}`
  return (
    <Card title={dog.name}>
      <KeyValues
        rows={[
          ['Race', breedName(dog.breedSlug) ?? 'Non renseignée'],
          ['Âge', formatAge(dog.birthDate, dog.birthDateEstimated) ?? MISSING],
          ['Poids', dog.weightKg === null ? `${MISSING} (${count})` : `${formatKg(dog.weightKg)} (${count})`],
          ['Activité', ACTIVITY_LABELS[dog.activity] ?? MISSING],
          ['Stérilisation', dog.sterilized ? 'Stérilisé' : 'Non stérilisé'],
          ['Mange', dog.food ?? MISSING],
          [
            'Allergies',
            dog.allergies.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {dog.allergies.map((a) => (
                  <Badge key={a} tone="rose">{a}</Badge>
                ))}
              </span>
            ) : (
              'Non renseignées'
            ),
          ],
        ]}
      />
    </Card>
  )
}

export function AccountDogs({ dogs }: { dogs: AccountDog[] | null }) {
  if (dogs === null) return <Unreadable>Les chiens de ce compte n’ont pas pu être lus.</Unreadable>
  if (dogs.length === 0) return <Empty>Aucun chien sur ce compte.</Empty>
  return (
    <>
      {dogs.map((d) => (
        <DogCard key={d.id} dog={d} />
      ))}
    </>
  )
}
