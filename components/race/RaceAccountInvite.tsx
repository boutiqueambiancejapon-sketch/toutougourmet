import { AccountInvite } from '@/components/compte/AccountInvite'
import type { Breed } from '@/data/breeds'

// @cdc premium — invitation à créer le profil du chien sur les pages race. Après l'inscription,
// le formulaire du chien arrive avec la race déjà choisie (le poids reste à saisir : celui du chien,
// pas la moyenne de la race).
export function RaceAccountInvite({ breed }: { breed: Breed }) {
  return (
    <div className="mt-10">
      <AccountInvite
        place="race"
        title={`Crée le profil de ton ${breed.name}`}
        text="Ration calculée, poids suivi sur une courbe, offres adaptées à son âge et à son gabarit."
        cta="Créer son profil"
        retour={`/compte/chien/nouveau?race=${encodeURIComponent(breed.slug)}`}
      />
    </div>
  )
}
