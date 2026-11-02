import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AccountPage } from '@/components/compte/AccountPage'
import { DogForm } from '@/components/compte/DogForm'
import { BREED_OPTIONS, EMPTY_DOG } from '@/components/compte/dog-form-values'
import { getSessionUser } from '@/lib/server/auth'
import { todayIso } from '@/lib/server/dog-form'
import { createDogAction } from '../../actions'

export const metadata: Metadata = { title: 'Ajouter mon chien' }

export default async function NewDogPage() {
  if (!(await getSessionUser())) redirect('/compte/connexion?retour=/compte/chien/nouveau')
  return (
    <AccountPage title="Ajouter mon chien" back={{ href: '/compte', label: 'Mon compte' }} lead={<p>Tu pourras tout modifier ensuite.</p>}>
      <DogForm action={createDogAction} initial={EMPTY_DOG} breeds={BREED_OPTIONS} submitLabel="Enregistrer mon chien" today={todayIso()} />
    </AccountPage>
  )
}
